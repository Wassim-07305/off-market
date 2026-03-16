"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import type { DateRange } from "@/types/analytics";

interface NotificationAnalyticsData {
  totalSent: number;
  totalOpened: number;
  totalClicked: number;
  openRate: number;
  clickRate: number;
  avgOpenTimeMinutes: number;
}

interface NotificationTypeBreakdown {
  type: string;
  label: string;
  count: number;
  openRate: number;
}

interface NotificationTrend {
  date: string;
  label: string;
  sent: number;
  opened: number;
  clicked: number;
}

interface RawNotification {
  id: string;
  type: string;
  created_at: string;
  opened_at: string | null;
  clicked_at: string | null;
  delivered_at: string | null;
}

const TYPE_LABELS: Record<string, string> = {
  general: "Generales",
  lead_status: "Leads",
  new_call: "Appels",
  call_closed: "Closing",
  flag_change: "Drapeaux",
  digest: "Resumes",
  messaging: "Messages",
  billing: "Facturation",
  coaching: "Coaching",
  gamification: "Gamification",
  system: "Systeme",
};

/**
 * Aggregated notification analytics stats for a given date range.
 */
export function useNotificationAnalytics(range?: DateRange) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["notification-analytics", range?.from, range?.to],
    queryFn: async (): Promise<NotificationAnalyticsData> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from("notifications")
        .select("id, created_at, opened_at, clicked_at, delivered_at");

      if (range?.from) {
        query = query.gte("created_at", range.from);
      }
      if (range?.to) {
        query = query.lte("created_at", range.to);
      }

      const { data, error } = await query;
      if (error) throw error;

      const notifications = (data ?? []) as RawNotification[];
      const totalSent = notifications.length;
      const totalOpened = notifications.filter((n) => n.opened_at).length;
      const totalClicked = notifications.filter((n) => n.clicked_at).length;

      // Calculate average time to open (in minutes)
      const openTimes = notifications
        .filter((n) => n.opened_at && n.created_at)
        .map((n) => {
          const created = new Date(n.created_at).getTime();
          const opened = new Date(n.opened_at!).getTime();
          return (opened - created) / (1000 * 60); // minutes
        })
        .filter((t) => t >= 0 && t < 1440); // only consider <24h

      const avgOpenTimeMinutes =
        openTimes.length > 0
          ? Math.round(
              openTimes.reduce((a, b) => a + b, 0) / openTimes.length,
            )
          : 0;

      return {
        totalSent,
        totalOpened,
        totalClicked,
        openRate: totalSent > 0 ? Math.round((totalOpened / totalSent) * 100) : 0,
        clickRate: totalSent > 0 ? Math.round((totalClicked / totalSent) * 100) : 0,
        avgOpenTimeMinutes,
      };
    },
  });
}

/**
 * Notification count by type, suitable for pie charts.
 */
export function useNotificationsByType(range?: DateRange) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["notification-by-type", range?.from, range?.to],
    queryFn: async (): Promise<NotificationTypeBreakdown[]> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from("notifications")
        .select("type, opened_at");

      if (range?.from) {
        query = query.gte("created_at", range.from);
      }
      if (range?.to) {
        query = query.lte("created_at", range.to);
      }

      const { data, error } = await query;
      if (error) throw error;

      const notifications = (data ?? []) as Array<{
        type: string;
        opened_at: string | null;
      }>;

      // Group by type
      const grouped: Record<string, { count: number; opened: number }> = {};
      for (const n of notifications) {
        const t = n.type || "general";
        if (!grouped[t]) grouped[t] = { count: 0, opened: 0 };
        grouped[t].count++;
        if (n.opened_at) grouped[t].opened++;
      }

      return Object.entries(grouped)
        .map(([type, stats]) => ({
          type,
          label: TYPE_LABELS[type] || type,
          count: stats.count,
          openRate:
            stats.count > 0
              ? Math.round((stats.opened / stats.count) * 100)
              : 0,
        }))
        .sort((a, b) => b.count - a.count);
    },
  });
}

/**
 * Daily notification trends for line charts.
 */
export function useNotificationTrends(range?: DateRange) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["notification-trends", range?.from, range?.to],
    queryFn: async (): Promise<NotificationTrend[]> => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from("notifications")
        .select("created_at, opened_at, clicked_at")
        .order("created_at", { ascending: true });

      if (range?.from) {
        query = query.gte("created_at", range.from);
      }
      if (range?.to) {
        query = query.lte("created_at", range.to);
      }

      const { data, error } = await query;
      if (error) throw error;

      const notifications = (data ?? []) as Array<{
        created_at: string;
        opened_at: string | null;
        clicked_at: string | null;
      }>;

      // Group by day
      const byDay: Record<
        string,
        { sent: number; opened: number; clicked: number }
      > = {};

      for (const n of notifications) {
        const day = n.created_at.substring(0, 10); // "YYYY-MM-DD"
        if (!byDay[day]) byDay[day] = { sent: 0, opened: 0, clicked: 0 };
        byDay[day].sent++;
        if (n.opened_at) byDay[day].opened++;
        if (n.clicked_at) byDay[day].clicked++;
      }

      // Format with short day labels
      const MONTHS_FR = [
        "jan",
        "fev",
        "mar",
        "avr",
        "mai",
        "jun",
        "jul",
        "aou",
        "sep",
        "oct",
        "nov",
        "dec",
      ];

      return Object.entries(byDay).map(([date, stats]) => {
        const d = new Date(date);
        return {
          date,
          label: `${d.getDate()} ${MONTHS_FR[d.getMonth()]}`,
          ...stats,
        };
      });
    },
  });
}
