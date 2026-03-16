"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type { AiReport, AiReportType } from "@/types/database";

const AI_REPORTS_KEY = "ai-reports";

/**
 * Hook pour lister les rapports IA periodiques.
 * Filtre optionnel par type de rapport.
 */
export function useAiReports(type?: AiReportType) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery<AiReport[]>({
    queryKey: [AI_REPORTS_KEY, user?.id, type],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from("ai_reports" as never)
        .select("*" as never)
        .eq("user_id" as never, user!.id as never)
        .order("generated_at" as never, { ascending: false } as never);

      if (type) {
        query = query.eq("type" as never, type as never);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as AiReport[]) ?? [];
    },
  });
}

/**
 * Hook pour compter les rapports non lus.
 */
export function useUnreadReportsCount() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery<number>({
    queryKey: [AI_REPORTS_KEY, "unread", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("ai_reports" as never)
        .select("id" as never, { count: "exact", head: true } as never)
        .eq("user_id" as never, user!.id as never)
        .is("read_at" as never, null as never);

      if (error) throw error;
      return count ?? 0;
    },
  });
}

/**
 * Mutation pour marquer un rapport comme lu.
 */
export function useMarkReportRead() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (reportId: string) => {
      const { error } = await supabase
        .from("ai_reports" as never)
        .update({ read_at: new Date().toISOString() } as never)
        .eq("id" as never, reportId as never)
        .eq("user_id" as never, user!.id as never);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AI_REPORTS_KEY] });
    },
    onError: () => {
      toast.error("Erreur lors du marquage du rapport");
    },
  });
}
