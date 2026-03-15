"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type { LeaderboardEntry } from "@/types/gamification";

export type LeaderboardPeriod = "week" | "month" | "all";

/** Get the ISO start of the current week (Monday 00:00) */
function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday = 1
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diff);
  return monday.toISOString();
}

/** Get the ISO start of the current month */
function getMonthStart(): string {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
}

function getPeriodSince(period: LeaderboardPeriod): string | null {
  switch (period) {
    case "week":
      return getWeekStart();
    case "month":
      return getMonthStart();
    case "all":
      return null;
  }
}

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

        // Fetch anonymity flags
        const profileIds = (data ?? []).map(
          (e: LeaderboardEntry) => e.profile_id,
        );
        const anonymousSet = await fetchAnonymousProfiles(
          supabase,
          profileIds,
        );

        return (data as LeaderboardEntry[]).map((entry) =>
          applyAnonymity(entry, anonymousSet, user?.id),
        );
      }

      // For time-filtered queries, aggregate from xp_transactions
      const since = getPeriodSince(period)!;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: transactions, error: txError } = await (supabase as any)
        .from("xp_transactions")
        .select("profile_id, xp_amount")
        .gte("created_at", since);

      if (txError) throw txError;

      // Aggregate XP by profile
      const xpMap = new Map<string, number>();
      for (const tx of (transactions ?? []) as { profile_id: string; xp_amount: number }[]) {
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

      // Fetch profiles (including anonymity) and badge counts
      const profileIds = sorted.map(([id]) => id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [profilesRes, badgesRes] = await Promise.all([
        (supabase as any)
          .from("profiles")
          .select("id, full_name, avatar_url, leaderboard_anonymous")
          .in("id", profileIds),
        (supabase as any)
          .from("user_badges")
          .select("profile_id")
          .in("profile_id", profileIds),
      ]);

      const profileMap = new Map(
        ((profilesRes.data ?? []) as { id: string; full_name: string; avatar_url: string | null; leaderboard_anonymous: boolean }[]).map((p) => [p.id, p]),
      );

      // Count badges per profile
      const badgeCountMap = new Map<string, number>();
      for (const b of (badgesRes.data ?? []) as { profile_id: string }[]) {
        badgeCountMap.set(
          b.profile_id,
          (badgeCountMap.get(b.profile_id) ?? 0) + 1,
        );
      }

      return sorted.map(([profileId, totalXp], index) => {
        const profile = profileMap.get(profileId);
        const isAnonymous =
          profile?.leaderboard_anonymous === true &&
          profileId !== user?.id;

        return {
          profile_id: profileId,
          full_name: isAnonymous
            ? "Utilisateur anonyme"
            : (profile?.full_name ?? "Utilisateur"),
          avatar_url: isAnonymous ? null : (profile?.avatar_url ?? null),
          total_xp: totalXp,
          badge_count: badgeCountMap.get(profileId) ?? 0,
          rank: index + 1,
        } satisfies LeaderboardEntry;
      });
    },
  });

  // Fetch previous period ranks for rank change indicators
  const previousPeriodQuery = useQuery({
    queryKey: ["leaderboard-previous", period],
    enabled: !!user && period !== "all",
    queryFn: async () => {
      // Compute the previous period boundary
      let previousSince: string;
      let previousUntil: string;

      if (period === "week") {
        const weekStart = new Date(getWeekStart());
        const prevWeekEnd = new Date(weekStart.getTime() - 1);
        const prevWeekStart = new Date(weekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
        previousSince = prevWeekStart.toISOString();
        previousUntil = prevWeekEnd.toISOString();
      } else {
        const monthStart = new Date(getMonthStart());
        const prevMonthEnd = new Date(monthStart.getTime() - 1);
        const prevMonthStart = new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), 1);
        previousSince = prevMonthStart.toISOString();
        previousUntil = prevMonthEnd.toISOString();
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: transactions, error } = await (supabase as any)
        .from("xp_transactions")
        .select("profile_id, xp_amount")
        .gte("created_at", previousSince)
        .lte("created_at", previousUntil);

      if (error) throw error;

      const xpMap = new Map<string, number>();
      for (const tx of (transactions ?? []) as { profile_id: string; xp_amount: number }[]) {
        xpMap.set(
          tx.profile_id,
          (xpMap.get(tx.profile_id) ?? 0) + tx.xp_amount,
        );
      }

      const sorted = [...xpMap.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50);

      // Return a map of profile_id -> previous rank
      const rankMap = new Map<string, number>();
      sorted.forEach(([profileId], index) => {
        rankMap.set(profileId, index + 1);
      });
      return rankMap;
    },
  });

  // Build rank changes map
  const rankChanges = new Map<string, number>();
  if (period !== "all" && previousPeriodQuery.data && leaderboardQuery.data) {
    const prevRanks = previousPeriodQuery.data;
    for (const entry of leaderboardQuery.data) {
      const prevRank = prevRanks.get(entry.profile_id);
      if (prevRank !== undefined) {
        // Positive = improved (went up), negative = dropped
        rankChanges.set(entry.profile_id, prevRank - entry.rank);
      }
    }
  }

  return {
    entries: leaderboardQuery.data ?? [],
    isLoading: leaderboardQuery.isLoading,
    rankChanges,
  };
}

// ─── Helpers ────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchAnonymousProfiles(supabase: any, profileIds: string[]) {
  if (profileIds.length === 0) return new Set<string>();
  const { data } = await supabase
    .from("profiles")
    .select("id, leaderboard_anonymous")
    .in("id", profileIds)
    .eq("leaderboard_anonymous", true);
  return new Set<string>((data ?? []).map((p: { id: string }) => p.id));
}

function applyAnonymity(
  entry: LeaderboardEntry,
  anonymousSet: Set<string>,
  currentUserId: string | undefined,
): LeaderboardEntry {
  // Never hide current user's own entry
  if (entry.profile_id === currentUserId) return entry;
  if (!anonymousSet.has(entry.profile_id)) return entry;

  return {
    ...entry,
    full_name: "Utilisateur anonyme",
    avatar_url: null,
  };
}
