"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";

export function useDashboardStats() {
  const supabase = useSupabase();
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    enabled: !!user,
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ).toISOString();
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      ).toISOString();
      const endOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        0,
      ).toISOString();

      // Get Monday of current week
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);
      const weekStart = monday.toISOString().split("T")[0];

      const [
        clientsRes,
        clientsLastRes,
        revenueRes,
        revenueLastRes,
        coursesRes,
        checkinsRes,
      ] = await Promise.all([
        // Total clients
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "client"),
        // Clients last month (for comparison)
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "client")
          .lte("created_at", endOfLastMonth),
        // Revenue this month (paid invoices)
        supabase
          .from("invoices")
          .select("total")
          .eq("status", "paid")
          .gte("created_at", startOfMonth),
        // Revenue last month
        supabase
          .from("invoices")
          .select("total")
          .eq("status", "paid")
          .gte("created_at", startOfLastMonth)
          .lte("created_at", endOfLastMonth),
        // Active courses
        supabase
          .from("courses")
          .select("id", { count: "exact", head: true })
          .eq("status", "published"),
        // Check-ins this week
        supabase
          .from("weekly_checkins")
          .select("id", { count: "exact", head: true })
          .gte("week_start", weekStart),
      ]);

      const totalClients = clientsRes.count ?? 0;
      const lastMonthClients = clientsLastRes.count ?? 0;
      const clientChange =
        lastMonthClients > 0
          ? Math.round(
              ((totalClients - lastMonthClients) / lastMonthClients) * 100,
            )
          : 0;

      const revenueThisMonth = (revenueRes.data ?? []).reduce(
        (sum, inv) => sum + Number(inv.total ?? 0),
        0,
      );
      const revenueLastMonth = (revenueLastRes.data ?? []).reduce(
        (sum, inv) => sum + Number(inv.total ?? 0),
        0,
      );
      const revenueChange =
        revenueLastMonth > 0
          ? Math.round(
              ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100,
            )
          : 0;

      const activeCourses = coursesRes.count ?? 0;
      const weeklyCheckins = checkinsRes.count ?? 0;

      return {
        totalClients,
        clientChange,
        revenueThisMonth,
        revenueChange,
        activeCourses,
        weeklyCheckins,
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
    queryFn: async () => {
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      const { data, error } = await supabase
        .from("invoices")
        .select("total, created_at")
        .eq("status", "paid")
        .gte("created_at", sixMonthsAgo.toISOString())
        .order("created_at", { ascending: true });
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
      const monthlyRevenue: Record<string, number> = {};

      // Initialize last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        monthlyRevenue[key] = 0;
      }

      (data ?? []).forEach((inv) => {
        const d = new Date(inv.created_at);
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (key in monthlyRevenue) {
          monthlyRevenue[key] += Number(inv.total ?? 0);
        }
      });

      return Object.entries(monthlyRevenue).map(([key, revenue]) => {
        const [, monthIdx] = key.split("-");
        return { month: months[Number(monthIdx)], revenue };
      });
    },
  });
}

export function useEngagementChart() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["engagement-chart"],
    enabled: !!user,
    queryFn: async () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);

      const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

      const { data: messages, error: messagesErr } = await supabase
        .from("messages")
        .select("created_at")
        .gte("created_at", monday.toISOString());
      if (messagesErr) throw messagesErr;

      const { data: checkins, error: checkinsErr } = await supabase
        .from("weekly_checkins")
        .select("created_at")
        .gte("created_at", monday.toISOString());
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
