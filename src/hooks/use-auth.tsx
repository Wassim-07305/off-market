"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useSupabase } from "./use-supabase";
import { useQueryClient } from "@tanstack/react-query";
import type { Profile } from "@/types/database";
import type { User, AuthError } from "@supabase/supabase-js";

/**
 * Clear all auth-related cookies from the browser.
 * Used before redirects to prevent middleware from seeing stale sessions.
 */
function clearAuthCookies() {
  // Clear profile cache
  document.cookie = "om_profile_cache=; path=/; max-age=0; SameSite=Lax";
  // Clear all Supabase session cookies
  document.cookie.split(";").forEach((c) => {
    const name = c.trim().split("=")[0];
    if (name && name.startsWith("sb-")) {
      document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
    }
  });
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error: AuthError | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: AuthError | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  isAdmin: boolean;
  isCoach: boolean;
  isStaff: boolean;
  isSetter: boolean;
  isCloser: boolean;
  isSales: boolean;
  isClient: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;

    const fetchProfile = async (userId: string) => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (!cancelled) setProfile(data);
    };

    // Timeout to prevent loading from hanging indefinitely (matches middleware timeout)
    const timeout = setTimeout(() => {
      if (!cancelled) setLoading(false);
    }, 5000);

    supabase.auth.getUser().then(({ data: { user: authUser } }) => {
      if (cancelled) return;
      if (authUser) {
        setUser(authUser);
        fetchProfile(authUser.id).finally(() => {
          if (!cancelled) {
            clearTimeout(timeout);
            setLoading(false);
          }
        });
      } else {
        clearTimeout(timeout);
        setLoading(false);
      }
    }).catch(() => {
      if (!cancelled) {
        clearTimeout(timeout);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (cancelled) return;
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [supabase]);

  // Realtime: listen to changes on the user's own profile row (role, name, etc.)
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`profile-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const newProfile = payload.new as Profile;
          const oldRole = profile?.role;
          setProfile(newProfile);

          // If role changed, redirect to the correct dashboard
          if (oldRole && newProfile.role !== oldRole) {
            const ROLE_DASHBOARDS: Record<string, string> = {
              admin: "/admin/dashboard",
              coach: "/coach/dashboard",
              setter: "/sales/dashboard",
              closer: "/sales/dashboard",
              client: "/client/dashboard",
              prospect: "/client/dashboard",
            };
            const target =
              ROLE_DASHBOARDS[newProfile.role] ?? "/client/dashboard";
            clearAuthCookies();
            window.location.replace(target);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, user, profile?.role]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      clearAuthCookies();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (!error) {
        // Invalidate all queries so they refetch with the new user's data
        queryClient.invalidateQueries();
      }
      return { error };
    },
    [supabase, queryClient],
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      return { error };
    },
    [supabase],
  );

  const signInWithMagicLink = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      return { error };
    },
    [supabase],
  );

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  }, [supabase]);

  const signOut = useCallback(async () => {
    // Clear all React Query caches
    queryClient.clear();
    // Clear all auth cookies to prevent middleware from redirecting back
    clearAuthCookies();
    // Clear auth state
    setUser(null);
    setProfile(null);
    // Sign out without awaiting (can hang with SSR client)
    supabase.auth.signOut().catch(() => {});
    // Redirect immediately — cookies are already cleared so middleware won't bounce back
    window.location.replace("/login");
  }, [supabase, queryClient]);

  const resetPassword = useCallback(
    async (email: string) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      return { error };
    },
    [supabase],
  );

  const role = profile?.role;
  // Computed before the object literal to avoid TypeScript control-flow narrowing
  // exhausting all other role values before it reaches the isClient line
  const isClientRole = role === "client" || role === "prospect";

  const value: AuthContextValue = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signInWithMagicLink,
    signInWithGoogle,
    signOut,
    resetPassword,
    isAdmin: role === "admin",
    isCoach: role === "coach",
    isStaff: role === "admin" || role === "coach",
    isSetter: role === "setter",
    isCloser: role === "closer",
    isSales: role === "setter" || role === "closer",
    isClient: isClientRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
