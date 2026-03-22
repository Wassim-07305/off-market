"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type {
  Streak,
  DailyActivity,
  RecordActivityResult,
} from "@/types/streaks";

export function useStreak() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const streakQuery = useQuery({
    queryKey: ["streak", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("streaks")
        .select("*")
        .eq("profile_id", user.id)
        .maybeSingle();
      if (error) throw error;
      return data as Streak | null;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const activityQuery = useQuery({
    queryKey: ["daily-activity", user?.id],
    queryFn: async () => {
      if (!user) return [];
      // Get last 30 days of activity
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data, error } = await supabase
        .from("daily_activity")
        .select("*")
        .eq("profile_id", user.id)
        .gte("activity_date", thirtyDaysAgo.toISOString().split("T")[0])
        .order("activity_date", { ascending: false });
      if (error) throw error;
      return data as DailyActivity[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const recordActivity = useMutation({
    mutationFn: async (action: string = "login") => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.rpc("record_activity", {
        p_profile_id: user.id,
        p_action: action,
      } as never);
      // RPC may not exist yet — fail silently
      if (error) return null;
      return data as RecordActivityResult;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["streak"] });
      queryClient.invalidateQueries({ queryKey: ["daily-activity"] });
    },
  });

  return {
    streak: streakQuery.data,
    recentActivity: activityQuery.data ?? [],
    isLoading: streakQuery.isLoading,
    recordActivity,
  };
}
