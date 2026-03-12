"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

// ─── Types ─────────────────────────────────────────────────────

export interface RiskResult {
  profile_id: string;
  full_name: string;
  previous_score: number;
  new_score: number;
  risk_factors: string[];
  severity: "low" | "medium" | "high" | "critical";
  recommendation: string;
}

export interface RiskSummary {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  avg_score: number;
}

export interface RiskAnalysisResponse {
  results: RiskResult[];
  summary: RiskSummary;
}

// ─── Hook ──────────────────────────────────────────────────────

export function useRiskAnalysis() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (): Promise<RiskAnalysisResponse> => {
      const res = await fetch("/api/ai/risk-analysis", { method: "POST" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Erreur inconnue");
      }
      return res.json();
    },
    onSuccess: () => {
      // Refresh student data after analysis
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["coach-alerts"] });
    },
  });
}
