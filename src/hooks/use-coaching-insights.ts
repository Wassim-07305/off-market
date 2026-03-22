"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────

export interface InsightItem {
  title: string;
  description: string;
}

export interface RecommendationItem {
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
}

export interface CoachingInsights {
  patterns: InsightItem[];
  strengths: InsightItem[];
  improvements: InsightItem[];
  recommendations: RecommendationItem[];
}

export interface InsightsMeta {
  period: "week" | "month";
  daysBack: number;
  clientCount: number;
  dataPoints: {
    checkins: number;
    journal: number;
    xpTransactions: number;
    formations: number;
    sessions: number;
    regularity: number;
  };
  generatedAt: string;
}

interface InsightsResponse {
  insights: CoachingInsights;
  meta: InsightsMeta;
  message?: string;
}

// ─── Hook ───────────────────────────────────────────────────

export function useCoachingInsights(clientId?: string) {
  const queryClient = useQueryClient();

  // Cache key includes clientId so per-client insights are separate
  const cacheKey = ["coaching-insights", clientId ?? "all"];

  // Query for last generated insights (from cache only, no auto-fetch)
  const insightsQuery = useQuery<InsightsResponse | null>({
    queryKey: cacheKey,
    queryFn: () => null,
    enabled: false, // Manual only — insights are expensive (AI call)
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Mutation to generate insights
  const generateInsights = useMutation({
    mutationFn: async (period: "week" | "month" = "month") => {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, period }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Erreur lors de la generation des insights");
      }

      return (await res.json()) as InsightsResponse;
    },
    onSuccess: (data) => {
      // Store in query cache so it persists across renders
      queryClient.setQueryData(cacheKey, data);
      toast.success("Insights generes", {
        description: `Analyse de ${data.meta.clientCount} client${data.meta.clientCount > 1 ? "s" : ""} sur ${data.meta.daysBack} jours`,
      });
    },
    onError: (error) => {
      toast.error("Erreur", {
        description:
          error instanceof Error
            ? error.message
            : "Impossible de generer les insights",
      });
    },
  });

  return {
    insights: insightsQuery.data?.insights ?? null,
    meta: insightsQuery.data?.meta ?? null,
    isLoading: generateInsights.isPending,
    generateInsights,
  };
}
