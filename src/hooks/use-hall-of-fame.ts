"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";

export interface HallOfFameEntry {
  id: string;
  profile_id: string;
  monthly_revenue: number;
  testimony: string | null;
  niche: string | null;
  achievement_date: string;
  is_visible: boolean;
  created_at: string;
  profile: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
  } | null;
  total_xp: number;
  badge_count: number;
}

export function useHallOfFame() {
  const supabase = useSupabase();
  const { user } = useAuth();

  const hallQuery = useQuery({
    queryKey: ["hall-of-fame"],
    enabled: !!user,
    queryFn: async (): Promise<HallOfFameEntry[]> => {
      // Try to fetch from hall_of_fame table
      const { data, error } = await supabase
        .from("hall_of_fame")
        .select(
          "*, profile:profiles!hall_of_fame_profile_id_fkey(id, full_name, avatar_url, bio)",
        )
        .eq("is_visible", true)
        .order("monthly_revenue", { ascending: false });

      if (error) {
        // Table might not exist yet — return empty
        console.warn("hall_of_fame table not available:", error.message);
        return [];
      }

      if (!data || data.length === 0) return [];

      const profileIds = data.map((d) => d.profile_id);

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

      return data.map((entry) => ({
        ...entry,
        profile: entry.profile as HallOfFameEntry["profile"],
        total_xp: xpMap.get(entry.profile_id) ?? 0,
        badge_count: badgeMap.get(entry.profile_id) ?? 0,
      }));
    },
  });

  return {
    entries: hallQuery.data ?? [],
    isLoading: hallQuery.isLoading,
    error: hallQuery.error,
  };
}
