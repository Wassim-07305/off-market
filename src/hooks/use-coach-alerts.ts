"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type { CoachAlert } from "@/types/coaching";

export function useCoachAlerts(resolved?: boolean) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const alertsQuery = useQuery({
    queryKey: ["coach-alerts", resolved],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from("coach_alerts")
        .select("*, client:profiles!coach_alerts_client_id_fkey(id, full_name, avatar_url)")
        .order("created_at", { ascending: false })
        .limit(100);

      if (resolved !== undefined) query = query.eq("is_resolved", resolved);

      const { data, error } = await query;
      if (error) throw error;
      return data as CoachAlert[];
    },
  });

  const resolveAlert = useMutation({
    mutationFn: async (alertId: string) => {
      const { error } = await supabase
        .from("coach_alerts")
        .update({ is_resolved: true, resolved_at: new Date().toISOString() })
        .eq("id", alertId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-alerts"] });
    },
  });

  return {
    alerts: alertsQuery.data ?? [],
    isLoading: alertsQuery.isLoading,
    resolveAlert,
  };
}
