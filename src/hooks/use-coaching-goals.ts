"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type { CoachingGoal, GoalStatus } from "@/types/coaching";

export function useCoachingGoals(clientId?: string) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const effectiveClientId = clientId ?? user?.id;

  const goalsQuery = useQuery({
    queryKey: ["coaching-goals", effectiveClientId],
    queryFn: async () => {
      let query = supabase
        .from("coaching_goals")
        .select("*, client:profiles!coaching_goals_client_id_fkey(id, full_name, avatar_url)")
        .order("created_at", { ascending: false });

      if (effectiveClientId) query = query.eq("client_id", effectiveClientId);

      const { data, error } = await query;
      if (error) throw error;
      return data as CoachingGoal[];
    },
    enabled: !!effectiveClientId,
  });

  const createGoal = useMutation({
    mutationFn: async (goal: {
      client_id: string;
      title: string;
      description?: string;
      target_value?: number;
      unit?: string;
      deadline?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("coaching_goals")
        .insert({ ...goal, set_by: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as CoachingGoal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching-goals"] });
    },
  });

  const updateGoal = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<CoachingGoal> & { id: string }) => {
      const { error } = await supabase
        .from("coaching_goals")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching-goals"] });
    },
  });

  const updateProgress = useMutation({
    mutationFn: async ({ id, currentValue }: { id: string; currentValue: number }) => {
      const { error } = await supabase
        .from("coaching_goals")
        .update({ current_value: currentValue })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching-goals"] });
    },
  });

  return {
    goals: goalsQuery.data ?? [],
    activeGoals: (goalsQuery.data ?? []).filter((g) => g.status === "active"),
    isLoading: goalsQuery.isLoading,
    createGoal,
    updateGoal,
    updateProgress,
  };
}
