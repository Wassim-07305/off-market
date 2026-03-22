"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type { CoachingGoal, GoalStatus, GoalMilestone } from "@/types/coaching";

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
        .select(
          "*, client:profiles!coaching_goals_client_id_fkey(id, full_name, avatar_url)",
        )
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
      difficulty?: number;
      coach_notes?: string;
      milestones?: GoalMilestone[];
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
    onError: () => {
      toast.error("Erreur lors de la création de l'objectif");
    },
  });

  const updateGoal = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<CoachingGoal> & { id: string }) => {
      const { error } = await supabase
        .from("coaching_goals")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching-goals"] });
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour de l'objectif");
    },
  });

  const updateProgress = useMutation({
    mutationFn: async ({
      id,
      currentValue,
    }: {
      id: string;
      currentValue: number;
    }) => {
      const { error } = await supabase
        .from("coaching_goals")
        .update({ current_value: currentValue })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching-goals"] });
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour de la progression");
    },
  });

  const toggleMilestone = useMutation({
    mutationFn: async ({
      goalId,
      milestoneId,
    }: {
      goalId: string;
      milestoneId: string;
    }) => {
      // Get current goal
      const { data: goal, error: fetchError } = await supabase
        .from("coaching_goals")
        .select("milestones")
        .eq("id", goalId)
        .single();
      if (fetchError) throw fetchError;

      const milestones = (goal?.milestones as GoalMilestone[] | null) ?? [];
      const updated = milestones.map((m) =>
        m.id === milestoneId ? { ...m, completed: !m.completed } : m,
      );

      const { error } = await supabase
        .from("coaching_goals")
        .update({ milestones: updated })
        .eq("id", goalId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching-goals"] });
    },
    onError: () => {
      toast.error("Erreur lors de la mise a jour du jalon");
    },
  });

  const addMilestone = useMutation({
    mutationFn: async ({
      goalId,
      milestone,
    }: {
      goalId: string;
      milestone: GoalMilestone;
    }) => {
      const { data: goal, error: fetchError } = await supabase
        .from("coaching_goals")
        .select("milestones")
        .eq("id", goalId)
        .single();
      if (fetchError) throw fetchError;

      const milestones = (goal?.milestones as GoalMilestone[] | null) ?? [];
      const updated = [...milestones, milestone];

      const { error } = await supabase
        .from("coaching_goals")
        .update({ milestones: updated })
        .eq("id", goalId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coaching-goals"] });
      toast.success("Jalon ajoute");
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout du jalon");
    },
  });

  return {
    goals: goalsQuery.data ?? [],
    activeGoals: (goalsQuery.data ?? []).filter((g) => g.status === "active"),
    isLoading: goalsQuery.isLoading,
    createGoal,
    updateGoal,
    updateProgress,
    toggleMilestone,
    addMilestone,
  };
}
