"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
interface UserSession {
  id: string;
  user_id: string;
  device_info: string;
  is_active: boolean;
  last_active_at: string;
  created_at: string;
}

export function useUserSessions() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const sessionsQuery = useQuery({
    queryKey: ["user-sessions", user?.id],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("user_sessions")
        .select("*")
        .eq("user_id", user!.id)
        .order("last_active_at", { ascending: false });
      if (error) throw error;
      return data as UserSession[];
    },
    enabled: !!user,
  });

  const revokeSession = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await (supabase as any)
        .from("user_sessions")
        .update({ is_active: false })
        .eq("id", sessionId)
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
      toast.success("Session deconnectee");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la deconnexion");
    },
  });

  const registerSession = useMutation({
    mutationFn: async () => {
      if (!user) return;
      const deviceInfo = parseDeviceInfo(navigator.userAgent);
      const { error } = await (supabase as any).from("user_sessions").insert({
        user_id: user.id,
        device_info: deviceInfo,
        is_active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-sessions"] });
    },
  });

  return {
    sessions: sessionsQuery.data ?? [],
    activeSessions: (sessionsQuery.data ?? []).filter((s) => s.is_active),
    isLoading: sessionsQuery.isLoading,
    revokeSession,
    registerSession,
  };
}

function parseDeviceInfo(userAgent: string): string {
  const ua = userAgent.toLowerCase();

  let os = "Inconnu";
  if (ua.includes("windows")) os = "Windows";
  else if (ua.includes("mac os")) os = "macOS";
  else if (ua.includes("linux")) os = "Linux";
  else if (ua.includes("android")) os = "Android";
  else if (ua.includes("iphone") || ua.includes("ipad")) os = "iOS";

  let browser = "Inconnu";
  if (ua.includes("chrome") && !ua.includes("edg")) browser = "Chrome";
  else if (ua.includes("firefox")) browser = "Firefox";
  else if (ua.includes("safari") && !ua.includes("chrome")) browser = "Safari";
  else if (ua.includes("edg")) browser = "Edge";

  return `${browser} sur ${os}`;
}
