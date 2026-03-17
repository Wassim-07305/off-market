import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ROLE_PREFIXES: Record<string, string> = {
  admin: "/admin",
  coach: "/coach",
  setter: "/sales",
  closer: "/sales",
  client: "/client",
};

const DEFAULT_ROUTES: Record<string, string> = {
  admin: "/admin/dashboard",
  coach: "/coach/dashboard",
  setter: "/sales/dashboard",
  closer: "/sales/dashboard",
  client: "/client/dashboard",
};

/**
 * Cookie name used to cache role + onboarding status.
 * Avoids a DB roundtrip on every middleware invocation.
 * TTL: 5 minutes — short enough that role changes propagate quickly.
 */
const PROFILE_CACHE_COOKIE = "om_profile_cache";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

interface ProfileCache {
  role: string;
  onboarding_completed: boolean;
  exp: number; // timestamp ms
}

function readProfileCache(request: NextRequest): ProfileCache | null {
  try {
    const raw = request.cookies.get(PROFILE_CACHE_COOKIE)?.value;
    if (!raw) return null;
    const parsed: ProfileCache = JSON.parse(atob(raw));
    if (parsed.exp < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

function buildCacheCookieValue(
  role: string,
  onboarding_completed: boolean,
): string {
  const payload: ProfileCache = {
    role,
    onboarding_completed,
    exp: Date.now() + CACHE_TTL_MS,
  };
  return btoa(JSON.stringify(payload));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() is required to refresh the session token — cannot skip.
  // It uses the local JWT and only hits the network to refresh expired tokens,
  // so it is fast in the happy path (no network call needed when token is valid).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isAuthPage =
    pathname.startsWith("/login") ||
    pathname.startsWith("/signup") ||
    pathname.startsWith("/register") ||
    pathname.startsWith("/forgot-password") ||
    pathname.startsWith("/auth");

  // API routes handle their own auth — skip middleware redirect
  const isApiRoute = pathname.startsWith("/api");

  // Public pages/routes that don't require auth
  const isPublicPage =
    pathname === "/" ||
    pathname.startsWith("/lead-magnet") ||
    pathname.startsWith("/f/") ||
    (pathname.startsWith("/contracts/") && pathname.endsWith("/sign")) ||
    (pathname.startsWith("/api/contracts/") &&
      (pathname.endsWith("/sign") ||
        pathname.endsWith("/public") ||
        pathname.endsWith("/pdf")));

  // Not logged in → redirect to login (except auth, API & public pages)
  if (!user && !isAuthPage && !isApiRoute && !isPublicPage) {
    // Clear stale profile cache on logout
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const redirectResp = NextResponse.redirect(url);
    redirectResp.cookies.delete(PROFILE_CACHE_COOKIE);
    return redirectResp;
  }

  // Logged in on auth page → redirect to role dashboard
  if (user && isAuthPage && !pathname.startsWith("/auth/callback")) {
    // Check cache first to avoid DB query
    const cached = readProfileCache(request);
    let role: string;
    let onboardingDone: boolean;

    if (cached) {
      role = cached.role;
      onboardingDone = cached.onboarding_completed;
    } else {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, onboarding_completed")
        .eq("id", user.id)
        .single();
      role = profile?.role ?? "client";
      onboardingDone = profile?.onboarding_completed ?? false;
    }

    const url = request.nextUrl.clone();
    url.pathname = onboardingDone
      ? (DEFAULT_ROUTES[role] ?? "/client/dashboard")
      : "/onboarding";
    const redirectResp = NextResponse.redirect(url);
    // Write cache so next requests skip the DB
    redirectResp.cookies.set(
      PROFILE_CACHE_COOKIE,
      buildCacheCookieValue(role, onboardingDone),
      { path: "/", sameSite: "lax", httpOnly: false, maxAge: 300 },
    );
    return redirectResp;
  }

  // Role-based route protection + onboarding enforcement
  if (user) {
    const isOnboardingPage = pathname === "/onboarding";
    const isRoleRoute =
      pathname.startsWith("/admin") ||
      pathname.startsWith("/coach") ||
      pathname.startsWith("/sales") ||
      pathname.startsWith("/client");

    if (isRoleRoute || isOnboardingPage) {
      // Use cached profile if fresh — avoids DB query on every navigation
      const cached = readProfileCache(request);
      let role: string;
      let onboardingDone: boolean;
      let needsWrite = false;

      if (cached) {
        role = cached.role;
        onboardingDone = cached.onboarding_completed;
      } else {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, onboarding_completed")
          .eq("id", user.id)
          .single();
        role = profile?.role ?? "client";
        onboardingDone = profile?.onboarding_completed ?? false;
        needsWrite = true;
      }

      // Enforce onboarding: redirect to /onboarding if not completed
      // Exception: allow call room pages so users can join calls during onboarding
      const isCallRoom = /^\/(admin|coach|sales|client)\/calls\/[^/]+$/.test(
        pathname,
      );
      if (!onboardingDone && !isOnboardingPage && !isApiRoute && !isCallRoom) {
        const url = request.nextUrl.clone();
        url.pathname = "/onboarding";
        const redirectResp = NextResponse.redirect(url);
        if (needsWrite) {
          redirectResp.cookies.set(
            PROFILE_CACHE_COOKIE,
            buildCacheCookieValue(role, onboardingDone),
            { path: "/", sameSite: "lax", httpOnly: false, maxAge: 300 },
          );
        }
        return redirectResp;
      }

      // Already completed onboarding but on /onboarding → go to dashboard
      if (onboardingDone && isOnboardingPage) {
        const url = request.nextUrl.clone();
        url.pathname = DEFAULT_ROUTES[role] ?? "/client/dashboard";
        return NextResponse.redirect(url);
      }

      // Role prefix check (skip for /onboarding)
      if (isRoleRoute) {
        const allowedPrefix = ROLE_PREFIXES[role] ?? "/client";
        if (!pathname.startsWith(allowedPrefix)) {
          const url = request.nextUrl.clone();
          url.pathname = DEFAULT_ROUTES[role] ?? "/client/dashboard";
          return NextResponse.redirect(url);
        }
      }

      // Write cache on the successful passthrough response (first time)
      if (needsWrite) {
        supabaseResponse.cookies.set(
          PROFILE_CACHE_COOKIE,
          buildCacheCookieValue(role, onboardingDone),
          { path: "/", sameSite: "lax", httpOnly: false, maxAge: 300 },
        );
      }
    }
  }

  return supabaseResponse;
}
