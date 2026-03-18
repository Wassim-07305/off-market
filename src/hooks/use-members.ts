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

export function useMembers() {
  const supabase = useSupabase();
  const { user } = useAuth();

  const membersQuery = useQuery({
    queryKey: ["members-directory"],
    enabled: !!user,
    queryFn: async () => {
      // Single query via the member_stats view (replaces 3 separate queries + client-side aggregation)
      const { data, error } = await supabase
        .from("member_stats")
        .select("*")
        .order("full_name", { ascending: true });

      if (error) throw error;

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
    },
  });

  return {
    members: membersQuery.data ?? [],
    isLoading: membersQuery.isLoading,
  };
}
