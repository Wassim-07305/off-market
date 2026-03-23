"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";

export type ComparisonPreset = "month" | "week" | "quarter" | "custom";

export const COMPARISON_PRESETS: { value: ComparisonPreset; label: string }[] =
  [
    { value: "month", label: "Ce mois vs mois dernier" },
    { value: "week", label: "Cette semaine vs semaine dernière" },
    { value: "quarter", label: "Ce trimestre vs dernier trimestre" },
    { value: "custom", label: "Personnalise" },
  ];

export interface MetricComparison {
  label: string;
  key: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: "up" | "down" | "stable";
  format: "currency" | "number" | "percent";
}

export interface PeriodKPIs {
  revenue: number;
  newClients: number;
  callsCompleted: number;
  lessonsCompleted: number;
  messagesSent: number;
  avgLeadScore: number;
}

export interface PeriodComparisonResult {
  period1: PeriodKPIs;
  period2: PeriodKPIs;
  deltas: {
    revenue: number;
    newClients: number;
    callsCompleted: number;
    lessonsCompleted: number;
    messagesSent: number;
    avgLeadScore: number;
  };
  metrics: MetricComparison[];
}

interface UsePeriodComparisonOptions {
  period1From: string;
  period1To: string;
  period2From: string;
  period2To: string;
  enabled?: boolean;
}

export function getPresetDates(preset: ComparisonPreset): {
  p1From: string;
  p1To: string;
  p2From: string;
  p2To: string;
} {
  const now = new Date();

  switch (preset) {
    case "week": {
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const thisMonday = new Date(now);
      thisMonday.setDate(now.getDate() - mondayOffset);
      thisMonday.setHours(0, 0, 0, 0);

      const lastMonday = new Date(thisMonday);
      lastMonday.setDate(thisMonday.getDate() - 7);
      const lastSunday = new Date(thisMonday);
      lastSunday.setDate(thisMonday.getDate() - 1);

      return {
        p1From: lastMonday.toISOString().split("T")[0],
        p1To: lastSunday.toISOString().split("T")[0],
        p2From: thisMonday.toISOString().split("T")[0],
        p2To: now.toISOString().split("T")[0],
      };
    }
    case "quarter": {
      const currentQ = Math.floor(now.getMonth() / 3);
      const p2From = new Date(now.getFullYear(), currentQ * 3, 1);
      const p1From = new Date(now.getFullYear(), (currentQ - 1) * 3, 1);
      const p1To = new Date(now.getFullYear(), currentQ * 3, 0);

      return {
        p1From: p1From.toISOString().split("T")[0],
        p1To: p1To.toISOString().split("T")[0],
        p2From: p2From.toISOString().split("T")[0],
        p2To: now.toISOString().split("T")[0],
      };
    }
    case "month":
    default: {
      const p2From = new Date(now.getFullYear(), now.getMonth(), 1);
      const p1From = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const p1To = new Date(now.getFullYear(), now.getMonth(), 0);

      return {
        p1From: p1From.toISOString().split("T")[0],
        p1To: p1To.toISOString().split("T")[0],
        p2From: p2From.toISOString().split("T")[0],
        p2To: now.toISOString().split("T")[0],
      };
    }
  }
}

async function fetchPeriodKPIs(
  supabase: ReturnType<typeof useSupabase>,
  from: string,
  to: string,
): Promise<PeriodKPIs> {
  const [revenueRes, clientsRes, callsRes, lessonsRes, messagesRes, leadsRes] =
    await Promise.all([
      supabase
        .from("invoices")
        .select("total")
        .eq("status", "paid")
        .gte("created_at", from)
        .lte("created_at", to),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "client")
        .gte("created_at", from)
        .lte("created_at", to),
      supabase
        .from("call_calendar")
        .select("id", { count: "exact", head: true })
        .eq("status", "completed")
        .gte("date", from.split("T")[0])
        .lte("date", to.split("T")[0]),
      supabase
        .from("lesson_progress")
        .select("id", { count: "exact", head: true })
        .gte("completed_at", from)
        .lte("completed_at", to),
      supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .gte("created_at", from)
        .lte("created_at", to),
      supabase
        .from("crm_contacts")
        .select("lead_score")
        .gte("created_at", from)
        .lte("created_at", to),
    ]);

  const invoices = (revenueRes.data ?? []) as { total: number }[];
  const leads = (leadsRes.data ?? []) as { lead_score: number }[];
  const avgLeadScore =
    leads.length > 0
      ? Math.round(
          leads.reduce((sum, l) => sum + (l.lead_score ?? 0), 0) / leads.length,
        )
      : 0;

  return {
    revenue: invoices.reduce((sum, inv) => sum + Number(inv.total ?? 0), 0),
    newClients: clientsRes.count ?? 0,
    callsCompleted: callsRes.count ?? 0,
    lessonsCompleted: lessonsRes.count ?? 0,
    messagesSent: messagesRes.count ?? 0,
    avgLeadScore,
  };
}

function computeDelta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function getTrend(current: number, previous: number): "up" | "down" | "stable" {
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "stable";
}

export function usePeriodComparison(options: UsePeriodComparisonOptions) {
  const supabase = useSupabase();
  const { user } = useAuth();

  const {
    period1From,
    period1To,
    period2From,
    period2To,
    enabled = true,
  } = options;

  return useQuery({
    queryKey: [
      "period-comparison",
      period1From,
      period1To,
      period2From,
      period2To,
    ],
    enabled: !!user && enabled,
    queryFn: async (): Promise<PeriodComparisonResult> => {
      const [period1, period2] = await Promise.all([
        fetchPeriodKPIs(supabase, period1From, period1To),
        fetchPeriodKPIs(supabase, period2From, period2To),
      ]);

      const deltas = {
        revenue: computeDelta(period2.revenue, period1.revenue),
        newClients: computeDelta(period2.newClients, period1.newClients),
        callsCompleted: computeDelta(
          period2.callsCompleted,
          period1.callsCompleted,
        ),
        lessonsCompleted: computeDelta(
          period2.lessonsCompleted,
          period1.lessonsCompleted,
        ),
        messagesSent: computeDelta(period2.messagesSent, period1.messagesSent),
        avgLeadScore: computeDelta(period2.avgLeadScore, period1.avgLeadScore),
      };

      const metrics: MetricComparison[] = [
        {
          label: "Revenus",
          key: "revenue",
          current: period2.revenue,
          previous: period1.revenue,
          change: period2.revenue - period1.revenue,
          changePercent: deltas.revenue,
          trend: getTrend(period2.revenue, period1.revenue),
          format: "currency",
        },
        {
          label: "Nouveaux clients",
          key: "newClients",
          current: period2.newClients,
          previous: period1.newClients,
          change: period2.newClients - period1.newClients,
          changePercent: deltas.newClients,
          trend: getTrend(period2.newClients, period1.newClients),
          format: "number",
        },
        {
          label: "Appels completes",
          key: "callsCompleted",
          current: period2.callsCompleted,
          previous: period1.callsCompleted,
          change: period2.callsCompleted - period1.callsCompleted,
          changePercent: deltas.callsCompleted,
          trend: getTrend(period2.callsCompleted, period1.callsCompleted),
          format: "number",
        },
        {
          label: "Messages envoyes",
          key: "messagesSent",
          current: period2.messagesSent,
          previous: period1.messagesSent,
          change: period2.messagesSent - period1.messagesSent,
          changePercent: deltas.messagesSent,
          trend: getTrend(period2.messagesSent, period1.messagesSent),
          format: "number",
        },
        {
          label: "Formations terminées",
          key: "lessonsCompleted",
          current: period2.lessonsCompleted,
          previous: period1.lessonsCompleted,
          change: period2.lessonsCompleted - period1.lessonsCompleted,
          changePercent: deltas.lessonsCompleted,
          trend: getTrend(period2.lessonsCompleted, period1.lessonsCompleted),
          format: "number",
        },
        {
          label: "Score lead moyen",
          key: "avgLeadScore",
          current: period2.avgLeadScore,
          previous: period1.avgLeadScore,
          change: period2.avgLeadScore - period1.avgLeadScore,
          changePercent: deltas.avgLeadScore,
          trend: getTrend(period2.avgLeadScore, period1.avgLeadScore),
          format: "number",
        },
      ];

      return {
        period1,
        period2,
        deltas,
        metrics,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}
