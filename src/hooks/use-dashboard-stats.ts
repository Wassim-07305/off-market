"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";

// Row shapes for views
interface DashboardKpisRow {
  total_clients: number;
  last_month_clients: number;
  revenue_this_month: number;
  revenue_last_month: number;
  active_courses: number;
  weekly_checkins: number;
}

interface RevenueByMonthRow {
  month: string;
  label: string;
  revenue: number;
}

interface TimestampedRow {
  created_at: string;
}

export function useDashboardStats() {
  const supabase = useSupabase();
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      // Single query via the dashboard_kpis view (replaces 6 parallel queries)
      const { data, error } = await supabase
        .from("dashboard_kpis")
        .select("*")
        .returns<DashboardKpisRow[]>()
        .single();

      if (error) throw error;

      const totalClients = data.total_clients ?? 0;
      const lastMonthClients = data.last_month_clients ?? 0;
      const clientChange =
        lastMonthClients > 0
          ? Math.round(
              ((totalClients - lastMonthClients) / lastMonthClients) * 100,
            )
          : 0;

      const revenueThisMonth = Number(data.revenue_this_month ?? 0);
      const revenueLastMonth = Number(data.revenue_last_month ?? 0);
      const revenueChange =
        revenueLastMonth > 0
          ? Math.round(
              ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100,
            )
          : 0;

      return {
        totalClients,
        clientChange,
        revenueThisMonth,
        revenueChange,
        activeCourses: data.active_courses ?? 0,
        weeklyCheckins: data.weekly_checkins ?? 0,
      };
    },
  });

  return {
    stats: stats ?? {
      totalClients: 0,
      clientChange: 0,
      revenueThisMonth: 0,
      revenueChange: 0,
      activeCourses: 0,
      weeklyCheckins: 0,
    },
    isLoading,
  };
}

export function useRevenueChart() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["revenue-chart"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      // Single query via the revenue_by_month view (replaces fetch all invoices + client-side grouping)
      const { data, error } = await supabase
        .from("revenue_by_month")
        .select("*")
        .order("month", { ascending: true })
        .returns<RevenueByMonthRow[]>();

      if (error) throw error;

      const months = [
        "Jan",
        "Fev",
        "Mar",
        "Avr",
        "Mai",
        "Juin",
        "Juil",
        "Aout",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      // Build the last 6 months skeleton (in case some months have no invoices)
      const now = new Date();
      const result: { month: string; revenue: number }[] = [];
      const revenueMap = new Map<string, number>();

      for (const row of data ?? []) {
        revenueMap.set(row.month, Number(row.revenue ?? 0));
      }

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        result.push({
          month: months[d.getMonth()],
          revenue: revenueMap.get(key) ?? 0,
        });
      }

      return result;
    },
  });
}

export function useEngagementChart() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["engagement-chart"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);

      const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

      // These two queries are lightweight (only this week's data) — no view needed
      const [
        { data: messages, error: messagesErr },
        { data: checkins, error: checkinsErr },
      ] = await Promise.all([
        supabase
          .from("messages")
          .select("created_at")
          .gte("created_at", monday.toISOString())
          .returns<TimestampedRow[]>(),
        supabase
          .from("weekly_checkins")
          .select("created_at")
          .gte("created_at", monday.toISOString())
          .returns<TimestampedRow[]>(),
      ]);

      if (messagesErr) throw messagesErr;
      if (checkinsErr) throw checkinsErr;

      const result = days.map((day, i) => {
        const dayDate = new Date(monday);
        dayDate.setDate(monday.getDate() + i);
        const dayStr = dayDate.toISOString().split("T")[0];

        const msgCount = (messages ?? []).filter((m) =>
          m.created_at.startsWith(dayStr),
        ).length;

        const checkinCount = (checkins ?? []).filter((c) =>
          c.created_at.startsWith(dayStr),
        ).length;

        return { day, messages: msgCount, checkins: checkinCount };
      });

      return result;
    },
  });
}
