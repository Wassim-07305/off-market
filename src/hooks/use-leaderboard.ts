"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type { LeaderboardEntry } from "@/types/gamification";

export function useLeaderboard() {
  const supabase = useSupabase();
  const { user } = useAuth();

  const leaderboardQuery = useQuery({
    queryKey: ["leaderboard"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("leaderboard")
        .select("*")
        .order("rank", { ascending: true })
        .limit(50);
      if (error) throw error;
      return data as LeaderboardEntry[];
    },
  });

  return {
    entries: leaderboardQuery.data ?? [],
    isLoading: leaderboardQuery.isLoading,
  };
}
