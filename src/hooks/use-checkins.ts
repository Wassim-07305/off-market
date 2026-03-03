"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type { WeeklyCheckin, Mood } from "@/types/coaching";

export function useCheckins(clientId?: string) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const effectiveClientId = clientId ?? user?.id;

  const checkinsQuery = useQuery({
    queryKey: ["checkins", effectiveClientId],
    queryFn: async () => {
      let query = supabase
        .from("weekly_checkins")
        .select("*, client:profiles!weekly_checkins_client_id_fkey(id, full_name, avatar_url)")
        .order("week_start", { ascending: false })
        .limit(52);

      if (effectiveClientId) query = query.eq("client_id", effectiveClientId);

      const { data, error } = await query;
      if (error) throw error;
      return data as WeeklyCheckin[];
    },
    enabled: !!effectiveClientId,
  });

  const submitCheckin = useMutation({
    mutationFn: async (checkin: {
      week_start: string;
      revenue?: number;
      prospection_count?: number;
      win?: string;
      blocker?: string;
      goal_next_week?: string;
      mood?: Mood;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("weekly_checkins")
        .upsert(
          { ...checkin, client_id: user.id },
          { onConflict: "client_id,week_start" }
        )
        .select()
        .single();
      if (error) throw error;
      return data as WeeklyCheckin;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkins"] });
    },
  });

  const addFeedback = useMutation({
    mutationFn: async ({ checkinId, feedback }: { checkinId: string; feedback: string }) => {
      const { error } = await supabase
        .from("weekly_checkins")
        .update({ coach_feedback: feedback })
        .eq("id", checkinId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkins"] });
    },
  });

  return {
    checkins: checkinsQuery.data ?? [],
    isLoading: checkinsQuery.isLoading,
    submitCheckin,
    addFeedback,
  };
}

// All client checkins for coach view
export function useAllCheckins() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["all-checkins"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_checkins")
        .select("*, client:profiles!weekly_checkins_client_id_fkey(id, full_name, avatar_url)")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as WeeklyCheckin[];
    },
  });

  return {
    checkins: query.data ?? [],
    isLoading: query.isLoading,
  };
}
