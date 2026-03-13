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

export function useAdminDashboard() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin-dashboard"],
    enabled: !!user,
    queryFn: async (): Promise<AdminDashboardData> => {
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

      // Monday of current week
      const dayOfWeek = now.getDay();
      const monday = new Date(now);
      monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      monday.setHours(0, 0, 0, 0);
      const weekStart = monday.toISOString().split("T")[0];

      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      const [
        clientsRes,
        newClientsRes,
        churnedRes,
        invoicesAllRes,
        invoicesThisMonthRes,
        invoicesLastMonthRes,
        contactsRes,
        completionsRes,
        totalLessonsRes,
        checkinsRes,
        detailsRes,
        latePaymentsRes,
        coachesRes,
      ] = await Promise.all([
        // Total active clients
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "client"),
        // New clients this month
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "client")
          .gte("created_at", startOfMonth),
        // Churned students
        supabase
          .from("student_details")
          .select("id", { count: "exact", head: true })
          .eq("tag", "churned"),
        // All paid invoices for revenue history
        supabase
          .from("invoices")
          .select("total, status, paid_at, created_at")
          .gte("created_at", sixMonthsAgo.toISOString()),
        // Revenue this month
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
        // Pipeline contacts
        supabase.from("crm_contacts").select("stage, source, estimated_value"),
        // Formation completions
        supabase
          .from("lesson_completions")
          .select("id", { count: "exact", head: true }),
        // Total lessons
        supabase.from("lessons").select("id", { count: "exact", head: true }),
        // Check-ins this week
        supabase
          .from("weekly_checkins")
          .select("id", { count: "exact", head: true })
          .gte("week_start", weekStart),
        // Student details for at-risk and inactive
        supabase
          .from("student_details")
          .select(
            "tag, health_score, last_engagement_at, acquisition_source, lifetime_value",
          ),
        // Late payments
        supabase
          .from("invoices")
          .select("id", { count: "exact", head: true })
          .eq("status", "overdue"),
        // Coaches with student counts
        supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .eq("role", "coach"),
      ]);

      // ─── Revenue calculations ─────────────
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

      // Cash collected vs invoiced
      const cashCollected = allInvoices
        .filter((i) => i.status === "paid")
        .reduce((sum, i) => sum + Number(i.total), 0);
      const cashInvoiced = allInvoices.reduce(
        (sum, i) => sum + Number(i.total),
        0,
      );

      // Revenue by channel (from acquisition_source in student_details)
      const details = detailsRes.data ?? [];
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

      // Average LTV
      const ltvValues = details
        .map((d) => Number(d.lifetime_value ?? 0))
        .filter((v) => v > 0);
      const averageLtv =
        ltvValues.length > 0
          ? Math.round(ltvValues.reduce((s, v) => s + v, 0) / ltvValues.length)
          : 0;

      // ─── Students ─────────────
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

      // At-risk students
      const atRiskStudents = details.filter((d) => d.tag === "at_risk").length;

      // Inactive students (no engagement in 14 days)
      const fourteenDaysAgo = new Date();
      fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
      const inactiveStudents = details.filter((d) => {
        if (!d.last_engagement_at) return true;
        return new Date(d.last_engagement_at) < fourteenDaysAgo;
      }).length;

      // ─── Sales ─────────────
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

      // ─── Formations ─────────────
      const totalCompletions = completionsRes.count ?? 0;
      const totalLessons = totalLessonsRes.count ?? 0;
      const formationCompletionRate =
        totalLessons > 0 && totalStudents > 0
          ? Math.min(
              Math.round(
                (totalCompletions / (totalLessons * totalStudents)) * 100,
              ),
              100,
            )
          : 0;

      // ─── Coach leaderboard ─────────────
      // Note: we build a simplified leaderboard from available data
      const coaches = coachesRes.data ?? [];
      const coachLeaderboard = coaches.map((coach) => ({
        name: coach.full_name,
        avatar: coach.avatar_url,
        students: 0, // Would need client_assignments join
        avgHealth: 0,
      }));

      return {
        revenueThisMonth,
        revenueLastMonth,
        revenueChange,
        cashCollected,
        cashInvoiced,
        averageLtv,
        revenueByQuarter,
        revenueByMonth,
        revenueByChannel,
        totalStudents,
        newStudentsThisMonth,
        churnedStudents,
        retentionRate,
        churnRate,
        globalClosingRate,
        contactsByStage,
        formationCompletionRate,
        weeklyCheckins: checkinsRes.count ?? 0,
        inactiveStudents,
        latePayments: latePaymentsRes.count ?? 0,
        atRiskStudents,
        coachLeaderboard,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
