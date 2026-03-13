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
      // Get all non-admin profiles
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, role, bio, created_at")
        .order("full_name", { ascending: true });

      if (profileError) throw profileError;
      if (!profiles || profiles.length === 0) return [];

      const profileIds = profiles.map((p) => p.id);

      // Get XP totals
      const { data: xpData } = await supabase
        .from("xp_transactions")
        .select("profile_id, xp_amount")
        .in("profile_id", profileIds);

      const xpMap = new Map<string, number>();
      for (const tx of xpData ?? []) {
        xpMap.set(
          tx.profile_id,
          (xpMap.get(tx.profile_id) ?? 0) + tx.xp_amount,
        );
      }

      // Get badge counts
      const { data: badgeData } = await supabase
        .from("user_badges")
        .select("profile_id")
        .in("profile_id", profileIds);

      const badgeMap = new Map<string, number>();
      for (const b of badgeData ?? []) {
        badgeMap.set(b.profile_id, (badgeMap.get(b.profile_id) ?? 0) + 1);
      }

      // Get level config
      const { data: levels } = await supabase
        .from("level_config")
        .select("*")
        .order("min_xp", { ascending: true });

      const levelConfig = levels ?? [];

      function getLevel(xp: number) {
        const level = [...levelConfig].reverse().find((l) => xp >= l.min_xp);
        return level ?? { level: 1, name: "Debutant", icon: "🌱" };
      }

      return profiles.map((p) => {
        const totalXp = xpMap.get(p.id) ?? 0;
        const level = getLevel(totalXp);
        return {
          id: p.id,
          full_name: p.full_name,
          avatar_url: p.avatar_url,
          role: p.role,
          bio: p.bio,
          created_at: p.created_at,
          total_xp: totalXp,
          badge_count: badgeMap.get(p.id) ?? 0,
          level: level.level,
          level_name: level.name,
          level_icon: level.icon ?? "🌱",
        } satisfies MemberEntry;
      });
    },
  });

  return {
    members: membersQuery.data ?? [],
    isLoading: membersQuery.isLoading,
  };
}
