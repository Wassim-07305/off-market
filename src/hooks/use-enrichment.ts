"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type EnrichmentType = "linkedin" | "instagram" | "both";

interface EnrichmentResult {
  success: boolean;
  enrichment_data: Record<string, unknown>;
  error?: string;
}

export function useEnrichContact() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contactId,
      type,
    }: {
      contactId: string;
      type: EnrichmentType;
    }) => {
      const res = await fetch("/api/enrichment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId, type }),
      });

      const data = (await res.json()) as EnrichmentResult;
      if (!res.ok) throw new Error(data.error || "Erreur enrichissement");
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pipeline-contacts"] });
      queryClient.invalidateQueries({
        queryKey: ["contact-interactions", variables.contactId],
      });

      const label =
        variables.type === "both"
          ? "LinkedIn + Instagram"
          : variables.type === "linkedin"
            ? "LinkedIn"
            : "Instagram";
      toast.success(`Enrichissement ${label} termine`);
    },
    onError: (err: Error) => {
      toast.error(`Enrichissement echoue: ${err.message}`);
    },
  });
}
