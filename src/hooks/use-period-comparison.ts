"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";

export interface PeriodKPIs {
  revenue: number;
  newClients: number;
  callsCompleted: number;
  lessonsCompleted: number;
}

export interface PeriodComparisonResult {
  period1: PeriodKPIs;
  period2: PeriodKPIs;
  deltas: {
    revenue: number;
    newClients: number;
    callsCompleted: number;
    lessonsCompleted: number;
  };
}

interface UsePeriodComparisonOptions {
  period1From: string;
  period1To: string;
  period2From: string;
  period2To: string;
  enabled?: boolean;
}

async function fetchPeriodKPIs(
  supabase: ReturnType<typeof useSupabase>,
  from: string,
  to: string,
): Promise<PeriodKPIs> {
  const [revenueRes, clientsRes, callsRes, lessonsRes] = await Promise.all([
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
      .from("lesson_completions")
      .select("id", { count: "exact", head: true })
      .gte("created_at", from)
      .lte("created_at", to),
  ]);

  const invoices = (revenueRes.data ?? []) as { total: number }[];
  return {
    revenue: invoices.reduce(
      (sum, inv) => sum + Number(inv.total ?? 0),
      0,
    ),
    newClients: clientsRes.count ?? 0,
    callsCompleted: callsRes.count ?? 0,
    lessonsCompleted: lessonsRes.count ?? 0,
  };
}

function computeDelta(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

export function usePeriodComparison(options: UsePeriodComparisonOptions) {
  const supabase = useSupabase();
  const { user } = useAuth();

  const { period1From, period1To, period2From, period2To, enabled = true } = options;

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

      return {
        period1,
        period2,
        deltas: {
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
        },
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}
