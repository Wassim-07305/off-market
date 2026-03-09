"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type {
  DateRange,
  PeriodPreset,
  FinancialReport,
  MonthlyRevenue,
  InvoiceStatusBreakdown,
  CallMetrics,
  PipelineReport,
  EngagementReport,
} from "@/types/analytics";
import { PIPELINE_STAGES, CONTACT_SOURCES } from "@/types/pipeline";
import { CALL_MOOD_CONFIG } from "@/types/pipeline";
import { STUDENT_TAGS, ACTIVITY_TYPES } from "@/lib/constants";

/* ─── Helpers ─── */

const MONTH_LABELS = [
  "Jan", "Fev", "Mar", "Avr", "Mai", "Juin",
  "Juil", "Aout", "Sep", "Oct", "Nov", "Dec",
];

export function periodToDateRange(preset: PeriodPreset): DateRange {
  const now = new Date();
  const to = now.toISOString().split("T")[0];
  let from: string;

  switch (preset) {
    case "7d":
      from = new Date(now.getTime() - 7 * 86400000).toISOString().split("T")[0];
      break;
    case "30d":
      from = new Date(now.getTime() - 30 * 86400000).toISOString().split("T")[0];
      break;
    case "90d":
      from = new Date(now.getTime() - 90 * 86400000).toISOString().split("T")[0];
      break;
    case "12m":
      from = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()).toISOString().split("T")[0];
      break;
    case "ytd":
      from = `${now.getFullYear()}-01-01`;
      break;
    case "all":
      from = "2020-01-01";
      break;
  }

  return { from, to };
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split("-");
  return `${MONTH_LABELS[parseInt(month) - 1]} ${year}`;
}

/* ─── Financial Report ─── */

export function useFinancialReport(range: DateRange) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["financial-report", range.from, range.to],
    enabled: !!user,
    queryFn: async (): Promise<FinancialReport> => {
      const { data: invoices, error } = await supabase
        .from("invoices")
        .select("total, status, created_at, paid_at")
        .gte("created_at", range.from)
        .lte("created_at", range.to + "T23:59:59");

      if (error) throw error;
      const rows = invoices ?? [];

      // Status breakdown
      const invoiceStatus: InvoiceStatusBreakdown = {
        paid: rows.filter((i) => i.status === "paid").length,
        sent: rows.filter((i) => i.status === "sent").length,
        overdue: rows.filter((i) => i.status === "overdue").length,
        draft: rows.filter((i) => i.status === "draft").length,
        cancelled: rows.filter((i) => i.status === "cancelled").length,
      };

      const paidInvoices = rows.filter((i) => i.status === "paid");
      const totalRevenue = paidInvoices.reduce((s, i) => s + Number(i.total ?? 0), 0);
      const pendingAmount = rows
        .filter((i) => i.status === "sent")
        .reduce((s, i) => s + Number(i.total ?? 0), 0);
      const overdueAmount = rows
        .filter((i) => i.status === "overdue")
        .reduce((s, i) => s + Number(i.total ?? 0), 0);

      // Revenue by month
      const monthMap = new Map<string, { revenue: number; count: number }>();
      const from = new Date(range.from);
      const to = new Date(range.to);
      const cursor = new Date(from.getFullYear(), from.getMonth(), 1);
      while (cursor <= to) {
        const key = monthKey(cursor);
        monthMap.set(key, { revenue: 0, count: 0 });
        cursor.setMonth(cursor.getMonth() + 1);
      }

      for (const inv of paidInvoices) {
        const d = new Date(inv.paid_at ?? inv.created_at);
        const key = monthKey(d);
        const entry = monthMap.get(key);
        if (entry) {
          entry.revenue += Number(inv.total ?? 0);
          entry.count += 1;
        }
      }

      const revenueByMonth: MonthlyRevenue[] = Array.from(monthMap.entries()).map(
        ([key, val]) => ({
          month: key,
          label: monthLabel(key),
          revenue: Math.round(val.revenue * 100) / 100,
          invoiceCount: val.count,
        })
      );

      // MRR: average of last 3 months revenue
      const last3 = revenueByMonth.slice(-3);
      const mrr =
        last3.length > 0
          ? Math.round(last3.reduce((s, m) => s + m.revenue, 0) / last3.length)
          : 0;
      const arr = mrr * 12;

      // Trend: compare first half vs second half of period
      const mid = Math.floor(revenueByMonth.length / 2);
      const firstHalf = revenueByMonth.slice(0, mid || 1);
      const secondHalf = revenueByMonth.slice(mid || 1);
      const firstSum = firstHalf.reduce((s, m) => s + m.revenue, 0) / (firstHalf.length || 1);
      const secondSum = secondHalf.reduce((s, m) => s + m.revenue, 0) / (secondHalf.length || 1);
      const revenueTrend = firstSum > 0 ? Math.round(((secondSum - firstSum) / firstSum) * 100) : 0;

      const avgDealValue =
        paidInvoices.length > 0
          ? Math.round(totalRevenue / paidInvoices.length)
          : 0;

      return {
        totalRevenue,
        mrr,
        arr,
        pendingAmount,
        overdueAmount,
        revenueByMonth,
        invoiceStatus,
        revenueTrend,
        avgDealValue,
      };
    },
  });
}

/* ─── Call Metrics ─── */

export function useCallMetrics(range: DateRange) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["call-metrics", range.from, range.to],
    enabled: !!user,
    queryFn: async (): Promise<CallMetrics> => {
      const [callsRes, notesRes] = await Promise.all([
        supabase
          .from("call_calendar")
          .select("id, date, time, duration_minutes, call_type, status, actual_duration_seconds")
          .gte("date", range.from)
          .lte("date", range.to),
        supabase
          .from("call_notes")
          .select("client_mood, outcome, created_at"),
      ]);

      if (callsRes.error) throw callsRes.error;
      const calls = callsRes.data ?? [];
      const notes = notesRes.data ?? [];

      const totalCalls = calls.length;
      const completedCalls = calls.filter((c) => c.status === "realise").length;
      const noShowCalls = calls.filter((c) => c.status === "no_show").length;
      const cancelledCalls = calls.filter((c) => c.status === "annule").length;
      const rescheduledCalls = calls.filter((c) => c.status === "reporte").length;

      const completionRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;
      const noShowRate = totalCalls > 0 ? Math.round((noShowCalls / totalCalls) * 100) : 0;

      // Average duration (from actual_duration_seconds if available, else duration_minutes)
      const completedWithDuration = calls.filter((c) => c.status === "realise");
      const totalSeconds = completedWithDuration.reduce((s, c) => {
        if (c.actual_duration_seconds) return s + c.actual_duration_seconds;
        return s + (c.duration_minutes ?? 30) * 60;
      }, 0);
      const avgDurationMinutes =
        completedWithDuration.length > 0
          ? Math.round(totalSeconds / completedWithDuration.length / 60)
          : 0;
      const totalDurationHours = Math.round((totalSeconds / 3600) * 10) / 10;

      // Calls by type
      const typeMap = new Map<string, number>();
      for (const c of calls) {
        typeMap.set(c.call_type, (typeMap.get(c.call_type) ?? 0) + 1);
      }
      const callTypeLabels: Record<string, string> = {
        manuel: "Manuel",
        iclosed: "iClosed",
        calendly: "Calendly",
        booking: "Reservation",
        autre: "Autre",
      };
      const callsByType = Array.from(typeMap.entries()).map(([type, count]) => ({
        type,
        label: callTypeLabels[type] ?? type,
        count,
      }));

      // Calls by month
      const callMonthMap = new Map<string, { count: number; completed: number }>();
      for (const c of calls) {
        const key = c.date.slice(0, 7); // "YYYY-MM"
        const entry = callMonthMap.get(key) ?? { count: 0, completed: 0 };
        entry.count += 1;
        if (c.status === "realise") entry.completed += 1;
        callMonthMap.set(key, entry);
      }
      const callsByMonth = Array.from(callMonthMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([m, v]) => ({ month: m, label: monthLabel(m), ...v }));

      // Mood distribution from call notes
      const moodMap = new Map<string, number>();
      for (const n of notes) {
        if (n.client_mood) moodMap.set(n.client_mood, (moodMap.get(n.client_mood) ?? 0) + 1);
      }
      const moodColors: Record<string, string> = {
        tres_positif: "#22c55e",
        positif: "#86efac",
        neutre: "#a1a1aa",
        negatif: "#fbbf24",
        tres_negatif: "#ef4444",
      };
      const moodDistribution = Object.entries(CALL_MOOD_CONFIG).map(([mood, cfg]) => ({
        mood,
        label: cfg.label,
        count: moodMap.get(mood) ?? 0,
        color: moodColors[mood] ?? "#a1a1aa",
      }));

      // Outcome distribution
      const outcomeMap = new Map<string, number>();
      for (const n of notes) {
        if (n.outcome) outcomeMap.set(n.outcome, (outcomeMap.get(n.outcome) ?? 0) + 1);
      }
      const outcomeLabels: Record<string, string> = {
        interested: "Interesse",
        follow_up: "A relancer",
        not_interested: "Pas interesse",
        closed: "Signe",
        no_show: "No show",
      };
      const outcomeDistribution = Object.keys(outcomeLabels).map((outcome) => ({
        outcome,
        label: outcomeLabels[outcome],
        count: outcomeMap.get(outcome) ?? 0,
      }));

      return {
        totalCalls,
        completedCalls,
        noShowCalls,
        cancelledCalls,
        rescheduledCalls,
        completionRate,
        noShowRate,
        avgDurationMinutes,
        totalDurationHours,
        callsByType,
        callsByMonth,
        moodDistribution,
        outcomeDistribution,
      };
    },
  });
}

/* ─── Pipeline Report ─── */

export function usePipelineReport() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["pipeline-report"],
    enabled: !!user,
    queryFn: async (): Promise<PipelineReport> => {
      const { data: contacts, error } = await supabase
        .from("crm_contacts")
        .select("stage, source, estimated_value, created_at, updated_at");

      if (error) throw error;
      const rows = contacts ?? [];

      const totalContacts = rows.length;
      const totalPipelineValue = rows
        .filter((c) => c.stage !== "perdu" && c.stage !== "client")
        .reduce((s, c) => s + Number(c.estimated_value ?? 0), 0);

      // By stage
      const contactsByStage = PIPELINE_STAGES.map((stage) => {
        const stageContacts = rows.filter((c) => c.stage === stage.value);
        return {
          stage: stage.value,
          label: stage.label,
          count: stageContacts.length,
          totalValue: stageContacts.reduce((s, c) => s + Number(c.estimated_value ?? 0), 0),
          color: stage.color,
        };
      });

      // Conversion rate: prospect → client
      const prospects = rows.filter((c) => c.stage !== "perdu").length;
      const converted = rows.filter((c) => c.stage === "client").length;
      const conversionRate = prospects > 0 ? Math.round((converted / prospects) * 100) : 0;

      // Average deal value (clients only)
      const clientContacts = rows.filter((c) => c.stage === "client");
      const avgDealValue =
        clientContacts.length > 0
          ? Math.round(
              clientContacts.reduce((s, c) => s + Number(c.estimated_value ?? 0), 0) /
                clientContacts.length
            )
          : 0;

      // By source
      const contactsBySource = CONTACT_SOURCES.map((src) => ({
        source: src.value,
        label: src.label,
        count: rows.filter((c) => c.source === src.value).length,
      }));

      // Recently converted / lost (last 30 days)
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
      const recentlyConverted = rows.filter(
        (c) => c.stage === "client" && c.updated_at >= thirtyDaysAgo
      ).length;
      const recentlyLost = rows.filter(
        (c) => c.stage === "perdu" && c.updated_at >= thirtyDaysAgo
      ).length;

      return {
        totalContacts,
        totalPipelineValue,
        contactsByStage,
        conversionRate,
        avgDealValue,
        contactsBySource,
        recentlyConverted,
        recentlyLost,
      };
    },
  });
}

/* ─── Engagement Report ─── */

export function useEngagementReport(range: DateRange) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["engagement-report", range.from, range.to],
    enabled: !!user,
    queryFn: async (): Promise<EngagementReport> => {
      const [profilesRes, detailsRes, activitiesRes, checkinsRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, created_at")
          .eq("role", "client"),
        supabase
          .from("student_details")
          .select("profile_id, tag, health_score, last_engagement_at"),
        supabase
          .from("student_activities")
          .select("activity_type, created_at")
          .gte("created_at", range.from)
          .lte("created_at", range.to + "T23:59:59"),
        supabase
          .from("weekly_checkins")
          .select("mood, created_at")
          .gte("created_at", range.from)
          .lte("created_at", range.to + "T23:59:59"),
      ]);

      if (profilesRes.error) throw profilesRes.error;
      const profiles = profilesRes.data ?? [];
      const details = detailsRes.data ?? [];
      const activities = activitiesRes.data ?? [];
      const checkins = checkinsRes.data ?? [];

      const totalClients = profiles.length;

      // Active = engaged in last 14 days
      const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000).toISOString();
      const activeClients = details.filter(
        (d) => d.last_engagement_at && d.last_engagement_at >= fourteenDaysAgo
      ).length;

      const churnedClients = details.filter((d) => d.tag === "churned").length;
      const retentionRate =
        totalClients > 0
          ? Math.round(((totalClients - churnedClients) / totalClients) * 100)
          : 100;

      // New clients in period
      const newClientsInPeriod = profiles.filter(
        (p) => p.created_at >= range.from && p.created_at <= range.to + "T23:59:59"
      ).length;

      // Tag distribution
      const tagDistribution = STUDENT_TAGS.map((tag) => ({
        tag: tag.value,
        label: tag.label,
        count: details.filter((d) => d.tag === tag.value).length,
        color: tag.color,
      }));

      // Activity by type
      const activityTypeMap = new Map<string, number>();
      for (const a of activities) {
        activityTypeMap.set(a.activity_type, (activityTypeMap.get(a.activity_type) ?? 0) + 1);
      }
      const activityByType = ACTIVITY_TYPES.map((t) => ({
        type: t.value,
        label: t.label,
        count: activityTypeMap.get(t.value) ?? 0,
      })).filter((t) => t.count > 0);

      // Activity heatmap (day × hour)
      const heatmap: { day: number; hour: number; count: number }[] = [];
      const heatmapMap = new Map<string, number>();
      for (const a of activities) {
        const d = new Date(a.created_at);
        const day = (d.getDay() + 6) % 7; // 0=Mon
        const hour = d.getHours();
        const key = `${day}-${hour}`;
        heatmapMap.set(key, (heatmapMap.get(key) ?? 0) + 1);
      }
      for (let day = 0; day < 7; day++) {
        for (let hour = 0; hour < 24; hour++) {
          const count = heatmapMap.get(`${day}-${hour}`) ?? 0;
          if (count > 0) heatmap.push({ day, hour, count });
        }
      }

      // Avg health score
      const avgHealthScore =
        details.length > 0
          ? Math.round(details.reduce((s, d) => s + (d.health_score ?? 0), 0) / details.length)
          : 0;

      // Avg mood
      const avgMood =
        checkins.length > 0
          ? Math.round((checkins.reduce((s, c) => s + (c.mood ?? 0), 0) / checkins.length) * 10) / 10
          : 0;

      return {
        totalClients,
        activeClients,
        churnedClients,
        retentionRate,
        newClientsInPeriod,
        tagDistribution,
        activityByType,
        activityHeatmap: heatmap,
        avgHealthScore,
        avgMood,
        checkinsCount: checkins.length,
      };
    },
  });
}

/* ─── CSV Export utility ─── */

export function exportToCSV(filename: string, headers: string[], rows: string[][]) {
  const bom = "\uFEFF"; // UTF-8 BOM for Excel
  const csv = bom + [headers, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
