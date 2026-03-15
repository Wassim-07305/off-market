"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";

// ─── Public: submit a lead (no auth required) ──────────────────

interface LeadCaptureData {
  full_name: string;
  email: string;
  phone?: string;
  company?: string;
  revenue_range: "less_5k" | "5k_10k" | "10k_20k" | "20k_plus";
  goals?: string;
}

export function useSubmitLead() {
  return useMutation({
    mutationFn: async (data: LeadCaptureData) => {
      const res = await fetch("/api/leads/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Erreur lors de l'envoi");
      }

      return json as { success: boolean; id: string; score: number };
    },
  });
}

// ─── Admin: lead magnet stats ──────────────────────────────────

interface CapturedContact {
  id: string;
  full_name: string;
  email: string | null;
  qualification_score: number | null;
  stage: string;
  source: string | null;
  captured_at: string | null;
}

export interface LeadMagnetStats {
  totalThisMonth: number;
  totalAllTime: number;
  avgScore: number;
  byStage: Record<string, number>;
  topSources: Array<{ source: string; count: number }>;
  recentLeads: Array<{
    id: string;
    full_name: string;
    email: string;
    qualification_score: number;
    stage: string;
    captured_at: string;
  }>;
}

export function useLeadMagnetStats() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["lead-magnet-stats"],
    queryFn: async (): Promise<LeadMagnetStats> => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

      // All lead magnet contacts
      const { data: allLeads, error } = await supabase
        .from("crm_contacts")
        .select("id, full_name, email, qualification_score, stage, source, captured_at")
        .not("captured_at", "is", null)
        .order("captured_at", { ascending: false });

      if (error) throw error;

      const leads = (allLeads ?? []) as CapturedContact[];

      // Total this month
      const thisMonth = leads.filter(
        (l) => l.captured_at && l.captured_at >= startOfMonth,
      );

      // Average score
      const scores = leads
        .map((l) => l.qualification_score ?? 0)
        .filter((s) => s > 0);
      const avgScore =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;

      // By stage
      const byStage: Record<string, number> = {};
      for (const l of leads) {
        byStage[l.stage] = (byStage[l.stage] ?? 0) + 1;
      }

      // Top sources
      const sourceCounts: Record<string, number> = {};
      for (const l of leads) {
        const src = l.source || "inconnu";
        sourceCounts[src] = (sourceCounts[src] ?? 0) + 1;
      }
      const topSources = Object.entries(sourceCounts)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        totalThisMonth: thisMonth.length,
        totalAllTime: leads.length,
        avgScore,
        byStage,
        topSources,
        recentLeads: leads.slice(0, 10).map((l) => ({
          id: l.id,
          full_name: l.full_name,
          email: l.email ?? "",
          qualification_score: l.qualification_score ?? 0,
          stage: l.stage,
          captured_at: l.captured_at ?? "",
        })),
      };
    },
    refetchInterval: 60_000,
  });
}
