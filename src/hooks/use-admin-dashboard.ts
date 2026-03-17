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

/* ─────────────────────────────────────────────
   Hook 1 — Revenue data (invoices)
───────────────────────────────────────────── */
export function useRevenueStats() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin-revenue"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
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
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      const [invoicesAllRes, invoicesThisMonthRes, invoicesLastMonthRes] =
        await Promise.all([
          supabase
            .from("invoices")
            .select("total, status, paid_at, created_at")
            .gte("created_at", sixMonthsAgo.toISOString()),
          supabase
            .from("invoices")
            .select("total")
            .eq("status", "paid")
            .gte("created_at", startOfMonth),
          supabase
            .from("invoices")
            .select("total")
            .eq("status", "paid")
            .gte("created_at", startOfLastMonth)
            .lte("created_at", endOfLastMonth),
        ]);

      const revenueThisMonth = (invoicesThisMonthRes.data ?? []).reduce(
        (sum, inv) => sum + Number(inv.total ?? 0),
        0,
      );
      const revenueLastMonth = (invoicesLastMonthRes.data ?? []).reduce(
        (sum, inv) => sum + Number(inv.total ?? 0),
        0,
      );
      const revenueChange =
        revenueLastMonth > 0
          ? Math.round(
              ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100,
            )
          : 0;

      // Revenue by month
      const monthsMap: Record<string, number> = {};
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthsMap[key] = 0;
      }
      const allInvoices = invoicesAllRes.data ?? [];
      for (const inv of allInvoices) {
        if (inv.status === "paid" && inv.paid_at) {
          const d = new Date(inv.paid_at);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          if (key in monthsMap) monthsMap[key] += Number(inv.total);
        }
      }
      const revenueByMonth = Object.entries(monthsMap).map(
        ([key, revenue]) => ({
          month: key,
          label: new Date(key + "-01").toLocaleDateString("fr-FR", {
            month: "short",
          }),
          revenue,
        }),
      );

      // Revenue by quarter
      const quarterMap: Record<string, number> = {};
      for (const inv of allInvoices) {
        if (inv.status === "paid" && inv.paid_at) {
          const d = new Date(inv.paid_at);
          const q = Math.ceil((d.getMonth() + 1) / 3);
          const key = `T${q} ${d.getFullYear()}`;
          quarterMap[key] = (quarterMap[key] ?? 0) + Number(inv.total);
        }
      }
      const revenueByQuarter = Object.entries(quarterMap)
        .map(([quarter, revenue]) => ({ quarter, revenue }))
        .slice(-4);

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
   Hook 2 — Student stats (profiles + student_details)
───────────────────────────────────────────── */
export function useStudentStats() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin-students"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const now = new Date();
      const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1,
      ).toISOString();

      const [clientsRes, newClientsRes, churnedRes, detailsRes] =
        await Promise.all([
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("role", "client"),
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("role", "client")
            .gte("created_at", startOfMonth),
          supabase
            .from("student_details")
            .select("id", { count: "exact", head: true })
            .eq("tag", "churned"),
          supabase
            .from("student_details")
            .select(
              "tag, health_score, last_engagement_at, acquisition_source, lifetime_value",
            ),
        ]);

      const totalStudents = clientsRes.count ?? 0;
      const newStudentsThisMonth = newClientsRes.count ?? 0;
      const churnedStudents = churnedRes.count ?? 0;
      const retentionRate =
        totalStudents > 0
          ? Math.round(
              ((totalStudents - churnedStudents) / totalStudents) * 100,
            )
          : 100;
      const churnRate = 100 - retentionRate;

      const details = detailsRes.data ?? [];

      const atRiskStudents = details.filter((d) => d.tag === "at_risk").length;

      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const inactiveStudents = details.filter((d) => {
        if (!d.last_engagement_at) return true;
        return new Date(d.last_engagement_at) < fourteenDaysAgo;
      }).length;

      // Average LTV
      const ltvValues = details
        .map((d) => Number(d.lifetime_value ?? 0))
        .filter((v) => v > 0);
      const averageLtv =
        ltvValues.length > 0
          ? Math.round(ltvValues.reduce((s, v) => s + v, 0) / ltvValues.length)
          : 0;

      // Revenue by channel (from acquisition_source in student_details)
      const channelRevenue: Record<string, number> = {};
      for (const d of details) {
        const source = d.acquisition_source ?? "autre";
        channelRevenue[source] =
          (channelRevenue[source] ?? 0) + Number(d.lifetime_value ?? 0);
      }
      const totalChannelRevenue = Object.values(channelRevenue).reduce(
        (s, v) => s + v,
        0,
      );
      const revenueByChannel = Object.entries(channelRevenue)
        .map(([channel, revenue]) => ({
          channel: channel.charAt(0).toUpperCase() + channel.slice(1),
          revenue,
          percent:
            totalChannelRevenue > 0
              ? Math.round((revenue / totalChannelRevenue) * 100)
              : 0,
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 6);

      return {
        totalStudents,
        newStudentsThisMonth,
        churnedStudents,
        retentionRate,
        churnRate,
        atRiskStudents,
        inactiveStudents,
        averageLtv,
        revenueByChannel,
      };
    },
  });
}

/* ─────────────────────────────────────────────
   Hook 3 — Sales pipeline (crm_contacts)
───────────────────────────────────────────── */
export function useSalesStats() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin-sales"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const contactsRes = await supabase
        .from("crm_contacts")
        .select("stage, source, estimated_value");

      const contacts = contactsRes.data ?? [];
      const contactsByStage: Record<string, number> = {};
      for (const c of contacts) {
        const stage = c.stage ?? "prospect";
        contactsByStage[stage] = (contactsByStage[stage] ?? 0) + 1;
      }
      const totalContacts = contacts.length;
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
   Hook 4 — Formation + engagement (lesson_progress, lessons, weekly_checkins)
───────────────────────────────────────────── */
export function useEngagementStats() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin-engagement"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);
      const weekStart = monday.toISOString().split("T")[0];

      const [completionsRes, totalLessonsRes, checkinsRes, clientsCountRes] =
        await Promise.all([
          supabase
            .from("lesson_progress")
            .select("id", { count: "exact", head: true }),
          supabase.from("lessons").select("id", { count: "exact", head: true }),
          supabase
            .from("weekly_checkins")
            .select("id", { count: "exact", head: true })
            .gte("week_start", weekStart),
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("role", "client"),
        ]);

      const totalCompletions = completionsRes.count ?? 0;
      const totalLessons = totalLessonsRes.count ?? 0;
      const totalStudents = clientsCountRes.count ?? 0;
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
        weeklyCheckins: checkinsRes.count ?? 0,
      };
    },
  });
}

/* ─────────────────────────────────────────────
   Hook 5 — Coach leaderboard + alerts (profiles coaches, invoices overdue)
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
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("role", "coach"),
        supabase
          .from("invoices")
          .select("id", { count: "exact", head: true })
          .eq("status", "overdue"),
      ]);

      const coaches = coachesRes.data ?? [];
      const coachLeaderboard = coaches.map((coach) => ({
        name: coach.full_name,
        avatar: coach.avatar_url,
        students: 0, // Would need client_assignments join
        avgHealth: 0,
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
