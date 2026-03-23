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
      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ).toISOString();

      // Total all time (count only)
      const { count: totalAllTime, error: totalErr } = await supabase
        .from("crm_contacts")
        .select("id", { count: "exact", head: true })
        .not("captured_at", "is", null);

      if (totalErr) throw totalErr;

      // Total this month (count only)
      const { count: totalThisMonth, error: monthErr } = await supabase
        .from("crm_contacts")
        .select("id", { count: "exact", head: true })
        .not("captured_at", "is", null)
        .gte("captured_at", startOfMonth);

      if (monthErr) throw monthErr;

      // Average score — fetch only scores
      const { data: scoreRows, error: scoreErr } = await supabase
        .from("crm_contacts")
        .select("qualification_score")
        .not("captured_at", "is", null)
        .not("qualification_score", "is", null)
        .gt("qualification_score", 0);

      if (scoreErr) throw scoreErr;

      const scores = (scoreRows ?? []).map(
        (r: { qualification_score: number }) => r.qualification_score,
      );
      const avgScore =
        scores.length > 0
          ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          : 0;

      // By stage — separate count queries
      const stages = [
        "prospect",
        "qualifie",
        "proposition",
        "closing",
        "client",
        "perdu",
      ];
      const stageCounts = await Promise.all(
        stages.map(async (stage) => {
          const { count, error: sErr } = await supabase
            .from("crm_contacts")
            .select("id", { count: "exact", head: true })
            .not("captured_at", "is", null)
            .eq("stage", stage);
          if (sErr) throw sErr;
          return { stage, count: count ?? 0 };
        }),
      );

      const byStage: Record<string, number> = {};
      for (const sc of stageCounts) {
        if (sc.count > 0) byStage[sc.stage] = sc.count;
      }

      // Top sources — fetch only source column
      const { data: sourceRows, error: srcErr } = await supabase
        .from("crm_contacts")
        .select("source")
        .not("captured_at", "is", null);

      if (srcErr) throw srcErr;

      const sourceCounts: Record<string, number> = {};
      for (const r of (sourceRows ?? []) as { source: string | null }[]) {
        const src = r.source || "inconnu";
        sourceCounts[src] = (sourceCounts[src] ?? 0) + 1;
      }
      const topSources = Object.entries(sourceCounts)
        .map(([source, count]) => ({ source, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Recent leads (limited to 10)
      const { data: recentRows, error: recentErr } = await supabase
        .from("crm_contacts")
        .select("id, full_name, email, qualification_score, stage, captured_at")
        .not("captured_at", "is", null)
        .order("captured_at", { ascending: false })
        .limit(10);

      if (recentErr) throw recentErr;

      return {
        totalThisMonth: totalThisMonth ?? 0,
        totalAllTime: totalAllTime ?? 0,
        avgScore,
        byStage,
        topSources,
        recentLeads: (recentRows ?? []).map((l) => ({
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
