"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";

export interface MemberEntry {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
  bio: string | null;
  created_at: string;
  // Aggregated
  total_xp: number;
  badge_count: number;
  level: number;
  level_name: string;
  level_icon: string;
}

// Row shape returned by the member_stats view
interface MemberStatsRow {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
  bio: string | null;
  created_at: string;
  total_xp: number;
  badge_count: number;
  level: number;
  level_name: string;
  level_icon: string;
}

export function useMembers() {
  const supabase = useSupabase();
  const { user } = useAuth();

  const membersQuery = useQuery({
    queryKey: ["members-directory"],
    enabled: !!user,
    staleTime: 60_000,
    queryFn: async () => {
      // Try the view first, fall back to direct profiles query if view doesn't exist
      const { data, error } = await supabase
        .from("member_stats")
        .select("*")
        .order("full_name", { ascending: true })
        .returns<MemberStatsRow[]>();

      if (!error) {
        return (data ?? []).map((row) => ({
          id: row.id,
          full_name: row.full_name,
          avatar_url: row.avatar_url,
          role: row.role,
          bio: row.bio,
          created_at: row.created_at,
          total_xp: row.total_xp ?? 0,
          badge_count: row.badge_count ?? 0,
          level: row.level ?? 1,
          level_name: row.level_name ?? "Debutant",
          level_icon: row.level_icon ?? "🌱",
        })) satisfies MemberEntry[];
      }

      // Fallback: direct profiles query if view doesn't exist
      console.warn("[useMembers] member_stats view unavailable, using fallback:", error.message);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role, bio, created_at")
        .order("full_name", { ascending: true })
        .returns<Array<{ id: string; full_name: string; avatar_url: string | null; role: string; bio: string | null; created_at: string }>>();

      if (profilesError) throw profilesError;

      return (profiles ?? []).map((p) => ({
        id: p.id,
        full_name: p.full_name ?? "Utilisateur",
        avatar_url: p.avatar_url ?? null,
        role: p.role ?? "client",
        bio: p.bio ?? null,
        created_at: p.created_at ?? new Date().toISOString(),
        total_xp: 0,
        badge_count: 0,
        level: 1,
        level_name: "Debutant",
        level_icon: "🌱",
      })) satisfies MemberEntry[];
    },
  });

  return {
    members: membersQuery.data ?? [],
    isLoading: membersQuery.isLoading,
    error: membersQuery.error,
  };
}
