"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

export interface KpiGoal {
  id: string;
  created_by: string;
  title: string;
  description: string | null;
  metric: string;
  target_value: number;
  current_value: number;
  unit: string;
  period: "weekly" | "monthly" | "quarterly" | "yearly";
  start_date: string;
  end_date: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
}

export function useKpiGoals(includeArchived = false) {
  const supabase = useSupabase();
  const { user, isStaff } = useAuth();

  return useQuery({
    queryKey: ["kpi-goals", user?.id, includeArchived],
    enabled: !!user && isStaff,
    queryFn: async () => {
      let query = supabase
        .from("kpi_goals")
        .select("*")
        .order("created_at", { ascending: false });

      if (!includeArchived) {
        query = query.eq("is_archived", false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as KpiGoal[];
    },
  });
}

export function useCreateKpiGoal() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      goal: Pick<
        KpiGoal,
        "title" | "metric" | "target_value" | "unit" | "period"
      > &
        Partial<Pick<KpiGoal, "description" | "end_date">>,
    ) => {
      const { data, error } = await supabase
        .from("kpi_goals")
        .insert({ ...goal, created_by: user!.id } as never)
        .select()
        .single();
      if (error) throw error;
      return data as KpiGoal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpi-goals"] });
      toast.success("Objectif cree");
    },
    onError: () => toast.error("Erreur lors de la creation"),
  });
}

export function useUpdateKpiGoal() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<KpiGoal> & { id: string }) => {
      const { data, error } = await supabase
        .from("kpi_goals")
        .update(updates as never)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as KpiGoal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpi-goals"] });
    },
    onError: () => toast.error("Erreur lors de la mise a jour"),
  });
}

export function useDeleteKpiGoal() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("kpi_goals").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kpi-goals"] });
      toast.success("Objectif supprime");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}
