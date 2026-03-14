"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type { CallDocument } from "@/types/database";

// ---------------------------------------------------------------------------
// List documents for a call
// ---------------------------------------------------------------------------

export function useCallDocuments(callId: string | null) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["call-documents", callId],
    enabled: !!callId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("call_documents")
        .select("*")
        .eq("call_id", callId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CallDocument[];
    },
  });
}

// ---------------------------------------------------------------------------
// Generate transcript fusion document
// ---------------------------------------------------------------------------

export function useGenerateTranscriptFusion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (callId: string) => {
      const response = await fetch("/api/ai/transcript-fusion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ callId }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Erreur de generation");
      }

      return response.json() as Promise<CallDocument>;
    },
    onSuccess: (_data, callId) => {
      queryClient.invalidateQueries({
        queryKey: ["call-documents", callId],
      });
      toast.success("Document genere avec succes");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la generation du document");
    },
  });
}
