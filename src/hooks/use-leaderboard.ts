"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type { LeaderboardEntry } from "@/types/gamification";

export type LeaderboardPeriod = "7d" | "30d" | "all";

export function useLeaderboard(period: LeaderboardPeriod = "all") {
  const supabase = useSupabase();
  const { user } = useAuth();

  const leaderboardQuery = useQuery({
    queryKey: ["leaderboard", period],
    enabled: !!user,
    queryFn: async () => {
      if (period === "all") {
        // Use the leaderboard view for all-time
        const { data, error } = await supabase
          .from("leaderboard")
          .select("*")
          .order("rank", { ascending: true })
          .limit(50);
        if (error) throw error;
        return data as LeaderboardEntry[];
      }

      // For time-filtered queries, aggregate from xp_transactions
      const daysAgo = period === "7d" ? 7 : 30;
      const since = new Date(
        Date.now() - daysAgo * 24 * 60 * 60 * 1000,
      ).toISOString();

      const { data: transactions, error: txError } = await supabase
        .from("xp_transactions")
        .select("profile_id, xp_amount")
        .gte("created_at", since);

      if (txError) throw txError;

      // Aggregate XP by profile
      const xpMap = new Map<string, number>();
      for (const tx of transactions ?? []) {
        xpMap.set(
          tx.profile_id,
          (xpMap.get(tx.profile_id) ?? 0) + tx.xp_amount,
        );
      }

      // Get top 50
      const sorted = [...xpMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50);

      if (sorted.length === 0) return [];

      // Fetch profiles and badge counts
      const profileIds = sorted.map(([id]) => id);
      const [profilesRes, badgesRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", profileIds),
        supabase
          .from("user_badges")
          .select("profile_id")
          .in("profile_id", profileIds),
      ]);

      const profileMap = new Map(
        (profilesRes.data ?? []).map((p) => [p.id, p]),
      );

      // Count badges per profile
      const badgeCountMap = new Map<string, number>();
      for (const b of badgesRes.data ?? []) {
        badgeCountMap.set(
          b.profile_id,
          (badgeCountMap.get(b.profile_id) ?? 0) + 1,
        );
      }

      return sorted.map(([profileId, totalXp], index) => {
        const profile = profileMap.get(profileId);
        return {
          profile_id: profileId,
          full_name: profile?.full_name ?? "Utilisateur",
          avatar_url: profile?.avatar_url ?? null,
          total_xp: totalXp,
          badge_count: badgeCountMap.get(profileId) ?? 0,
          rank: index + 1,
        } satisfies LeaderboardEntry;
      });
    },
  });

  return {
    entries: leaderboardQuery.data ?? [],
    isLoading: leaderboardQuery.isLoading,
  };
}
