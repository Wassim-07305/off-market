"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface ClientBriefing {
  clientId: string;
  clientName: string;
  briefing: string;
  tokensUsed: number;
  generationTimeMs: number;
  generatedAt: string;
}

export function useClientBriefing(clientId: string | null) {
  const queryClient = useQueryClient();
  const [lastBriefing, setLastBriefing] = useState<ClientBriefing | null>(null);

  // Cached briefing (in-memory via React Query)
  const briefingQuery = useQuery({
    queryKey: ["client-briefing", clientId],
    enabled: false, // Only fetch on demand via generateBriefing
    queryFn: async () => lastBriefing,
  });

  const generateBriefing = useMutation({
    mutationFn: async (id: string): Promise<ClientBriefing> => {
      const res = await fetch("/api/ai/client-briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: id }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Erreur lors de la generation");
      }

      return res.json();
    },
    onSuccess: (data) => {
      setLastBriefing(data);
      queryClient.setQueryData(["client-briefing", data.clientId], data);
    },
  });

  return {
    briefing: lastBriefing ?? (briefingQuery.data as ClientBriefing | null),
    isLoading: generateBriefing.isPending,
    isError: generateBriefing.isError,
    error: generateBriefing.error,
    generateBriefing,
  };
}
