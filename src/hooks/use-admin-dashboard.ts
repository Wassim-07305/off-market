"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";

export interface AdminDashboardData {
  // Revenue
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueChange: number;
  cashCollected: number;
  cashInvoiced: number;
  averageLtv: number;
  revenueByQuarter: { quarter: string; revenue: number }[];
  revenueByMonth: { month: string; label: string; revenue: number }[];
  revenueByChannel: { channel: string; revenue: number; percent: number }[];

  // Students
  totalStudents: number;
  newStudentsThisMonth: number;
  churnedStudents: number;
  retentionRate: number;
  churnRate: number;

  // Sales
  globalClosingRate: number;
  contactsByStage: Record<string, number>;

  // Formations
  formationCompletionRate: number;

  // Engagement
  weeklyCheckins: number;

  // Alerts
  inactiveStudents: number;
  latePayments: number;
  atRiskStudents: number;

  // Leaderboard
  coachLeaderboard: {
    name: string;
    avatar: string | null;
    students: number;
    avgHealth: number;
  }[];
}

// ── Row types for views ──────────────────────────────────────

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

interface RevenueByQuarterRow {
  quarter: string;
  revenue: number;
}

interface InvoiceTotalRow {
  total: number;
  status: string;
}

interface StudentStatsSummaryRow {
  total_students: number;
  new_students_this_month: number;
  churned_students: number;
  at_risk_students: number;
  average_ltv: number;
}

interface RevenueByChannelRow {
  channel: string;
  revenue: number;
}

interface SalesPipelineRow {
  stage: string;
  count: number;
}

interface EngagementStatsRow {
  total_completions: number;
  total_lessons: number;
  total_students: number;
  weekly_checkins: number;
}

interface CoachLeaderboardRow {
  id: string;
  name: string;
  avatar: string | null;
  students: number;
  avg_health: number;
}

/* ─────────────────────────────────────────────
   Hook 1 — Revenue data (views: dashboard_kpis, revenue_by_month, revenue_by_quarter)
   Replaces 3 parallel invoice queries + client-side aggregation
───────────────────────────────────────────── */
export function useRevenueStats() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin-revenue"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const [kpisRes, monthlyRes, quarterlyRes, invoiceTotalsRes] =
        await Promise.all([
          supabase
            .from("dashboard_kpis")
            .select("*")
            .returns<DashboardKpisRow[]>()
            .single(),
          supabase
            .from("revenue_by_month")
            .select("*")
            .order("month", { ascending: true })
            .returns<RevenueByMonthRow[]>(),
          supabase
            .from("revenue_by_quarter")
            .select("*")
            .returns<RevenueByQuarterRow[]>(),
          supabase
            .from("invoices")
            .select("total, status")
            .gte(
              "created_at",
              new Date(
                new Date().getFullYear(),
                new Date().getMonth() - 5,
                1,
              ).toISOString(),
            )
            .returns<InvoiceTotalRow[]>(),
        ]);

      if (kpisRes.error) throw kpisRes.error;

      const revenueThisMonth = Number(kpisRes.data.revenue_this_month ?? 0);
      const revenueLastMonth = Number(kpisRes.data.revenue_last_month ?? 0);
      const revenueChange =
        revenueLastMonth > 0
          ? Math.round(
              ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100,
            )
          : 0;

      // Revenue by month — fill in months with no data
      const now = new Date();
      const revenueMap = new Map<string, number>();
      for (const row of monthlyRes.data ?? []) {
        revenueMap.set(row.month, Number(row.revenue ?? 0));
      }
      const revenueByMonth: {
        month: string;
        label: string;
        revenue: number;
      }[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        revenueByMonth.push({
          month: key,
          label: d.toLocaleDateString("fr-FR", { month: "short" }),
          revenue: revenueMap.get(key) ?? 0,
        });
      }

      // Revenue by quarter from view
      const revenueByQuarter = (quarterlyRes.data ?? []).map((row) => ({
        quarter: row.quarter,
        revenue: Number(row.revenue ?? 0),
      }));

      // Cash collected / invoiced
      const allInvoices = invoiceTotalsRes.data ?? [];
      const cashCollected = allInvoices
        .filter((i) => i.status === "paid")
        .reduce((sum, i) => sum + Number(i.total), 0);
      const cashInvoiced = allInvoices.reduce(
        (sum, i) => sum + Number(i.total),
        0,
      );

      return {
        revenueThisMonth,
        revenueLastMonth,
        revenueChange,
        cashCollected,
        cashInvoiced,
        revenueByMonth,
        revenueByQuarter,
      };
    },
  });
}

/* ─────────────────────────────────────────────
   Hook 2 — Student stats (views: student_stats_summary, revenue_by_channel)
   Replaces 4 parallel queries + client-side flag/LTV aggregation
───────────────────────────────────────────── */
export function useStudentStats() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin-students"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const [statsRes, channelRes] = await Promise.all([
        supabase
          .from("student_stats_summary")
          .select("*")
          .returns<StudentStatsSummaryRow[]>()
          .single(),
        supabase
          .from("revenue_by_channel")
          .select("*")
          .returns<RevenueByChannelRow[]>(),
      ]);

      if (statsRes.error) throw statsRes.error;

      const s = statsRes.data;
      const totalStudents = s.total_students ?? 0;
      const churnedStudents = s.churned_students ?? 0;
      const retentionRate =
        totalStudents > 0
          ? Math.round(
              ((totalStudents - churnedStudents) / totalStudents) * 100,
            )
          : 100;

      // Revenue by channel with percent
      const channelData = channelRes.data ?? [];
      const totalChannelRevenue = channelData.reduce(
        (sum, r) => sum + Number(r.revenue ?? 0),
        0,
      );
      const revenueByChannel = channelData.map((row) => {
        const revenue = Number(row.revenue ?? 0);
        return {
          channel: row.channel.charAt(0).toUpperCase() + row.channel.slice(1),
          revenue,
          percent:
            totalChannelRevenue > 0
              ? Math.round((revenue / totalChannelRevenue) * 100)
              : 0,
        };
      });

      return {
        totalStudents,
        newStudentsThisMonth: s.new_students_this_month ?? 0,
        churnedStudents,
        retentionRate,
        churnRate: 100 - retentionRate,
        atRiskStudents: s.at_risk_students ?? 0,
        inactiveStudents: 0,
        averageLtv: s.average_ltv ?? 0,
        revenueByChannel,
      };
    },
  });
}

/* ─────────────────────────────────────────────
   Hook 3 — Sales pipeline (view: sales_pipeline_summary)
   Replaces fetching all crm_contacts + client-side grouping
───────────────────────────────────────────── */
export function useSalesStats() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin-sales"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sales_pipeline_summary")
        .select("*")
        .returns<SalesPipelineRow[]>();

      if (error) throw error;

      const contactsByStage: Record<string, number> = {};
      let totalContacts = 0;
      for (const row of data ?? []) {
        contactsByStage[row.stage] = row.count;
        totalContacts += row.count;
      }
      const closedContacts = contactsByStage["client"] ?? 0;
      const globalClosingRate =
        totalContacts > 0
          ? Math.round((closedContacts / totalContacts) * 100)
          : 0;

      return { globalClosingRate, contactsByStage };
    },
  });
}

/* ─────────────────────────────────────────────
   Hook 4 — Formation + engagement (view: engagement_stats)
   Replaces 4 parallel count queries
───────────────────────────────────────────── */
export function useEngagementStats() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin-engagement"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("engagement_stats")
        .select("*")
        .returns<EngagementStatsRow[]>()
        .single();

      if (error) throw error;

      const totalCompletions = data.total_completions ?? 0;
      const totalLessons = data.total_lessons ?? 0;
      const totalStudents = data.total_students ?? 0;
      const formationCompletionRate =
        totalLessons > 0 && totalStudents > 0
          ? Math.min(
              Math.round(
                (totalCompletions / (totalLessons * totalStudents)) * 100,
              ),
              100,
            )
          : 0;

      return {
        formationCompletionRate,
        weeklyCheckins: data.weekly_checkins ?? 0,
      };
    },
  });
}

/* ─────────────────────────────────────────────
   Hook 5 — Coach leaderboard + alerts (view: coach_leaderboard)
   Replaces 2 queries + manual join
───────────────────────────────────────────── */
export function useCoachLeaderboard() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin-coaches"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const [coachesRes, latePaymentsRes] = await Promise.all([
        supabase
          .from("coach_leaderboard")
          .select("*")
          .returns<CoachLeaderboardRow[]>(),
        supabase
          .from("invoices")
          .select("id", { count: "exact", head: true })
          .eq("status", "overdue"),
      ]);

      const coachLeaderboard = (coachesRes.data ?? []).map((coach) => ({
        name: coach.name,
        avatar: coach.avatar,
        students: coach.students ?? 0,
        avgHealth: coach.avg_health ?? 0,
      }));

      return {
        coachLeaderboard,
        latePayments: latePaymentsRes.count ?? 0,
      };
    },
  });
}

/* ─────────────────────────────────────────────
   Backward-compatible aggregate hook
───────────────────────────────────────────── */
export function useAdminDashboard() {
  const revenue = useRevenueStats();
  const students = useStudentStats();
  const sales = useSalesStats();
  const engagement = useEngagementStats();
  const coaches = useCoachLeaderboard();

  const isLoading =
    revenue.isLoading ||
    students.isLoading ||
    sales.isLoading ||
    engagement.isLoading ||
    coaches.isLoading;

  const data =
    revenue.data &&
    students.data &&
    sales.data &&
    engagement.data &&
    coaches.data
      ? {
          ...revenue.data,
          ...students.data,
          ...sales.data,
          ...engagement.data,
          ...coaches.data,
        }
      : undefined;

  return {
    data,
    isLoading,
    // Individual loading states for progressive rendering:
    revenue,
    students,
    sales,
    engagement,
    coaches,
  };
}
