"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { toast } from "sonner";

export interface CallSummary {
  id: string;
  call_id: string;
  author_id: string;
  content: string;
  sections: Record<string, string>;
  model: string;
  tokens_used: number | null;
  generation_time_ms: number | null;
  sources: {
    has_transcript: boolean;
    has_pre_call: boolean;
    has_session_notes: boolean;
    has_call_notes: boolean;
  };
  created_at: string;
  updated_at: string;
}

export function useCallSummary(callId: string | null) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const summaryQuery = useQuery({
    queryKey: ["call-summary", callId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("call_summaries")
        .select("*")
        .eq("call_id", callId!)
        .maybeSingle();
      if (error) throw error;
      return data as CallSummary | null;
    },
    enabled: !!callId,
  });

  const generateSummary = useMutation({
    mutationFn: async (targetCallId: string) => {
      const response = await fetch("/api/ai/call-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId: targetCallId }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erreur de generation");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["call-summary", callId] });
      toast.success("Synthese generee avec succes");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la generation");
    },
  });

  return {
    summary: summaryQuery.data ?? null,
    isLoading: summaryQuery.isLoading,
    generateSummary,
    isGenerating: generateSummary.isPending,
  };
}
