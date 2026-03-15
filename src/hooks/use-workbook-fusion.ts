"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { toast } from "sonner";

export interface WorkbookFusion {
  id: string;
  call_id: string;
  type: string;
  title: string;
  content_markdown: string | null;
  content_html: string;
  generated_by: string;
  model: string | null;
  metadata: {
    submission_id: string;
    workbook_id: string;
    tokens_used: number;
    generation_time_ms: number;
  } | null;
  created_at: string;
}

export function useWorkbookFusion(
  submissionId: string | null,
  callId: string | null,
) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const fusionQuery = useQuery({
    queryKey: ["workbook-fusion", callId, submissionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("call_documents")
        .select("*")
        .eq("call_id", callId!)
        .eq("type", "workbook_export")
        .maybeSingle();
      if (error) throw error;
      return data as WorkbookFusion | null;
    },
    enabled: !!callId && !!submissionId,
  });

  const generateFusion = useMutation({
    mutationFn: async ({
      targetSubmissionId,
      targetCallId,
    }: {
      targetSubmissionId: string;
      targetCallId: string;
    }) => {
      const response = await fetch("/api/ai/workbook-fusion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId: targetSubmissionId,
          callId: targetCallId,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erreur de generation");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workbook-fusion", callId, submissionId],
      });
      toast.success("Fusion workbook + transcription generee avec succes");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la generation de la fusion");
    },
  });

  return {
    fusion: fusionQuery.data ?? null,
    isLoading: fusionQuery.isLoading,
    generateFusion,
    isGenerating: generateFusion.isPending,
  };
}
