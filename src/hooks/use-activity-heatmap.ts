"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";

export interface HeatmapCell {
  day: number; // 0=Mon, 6=Sun
  hour: number; // 0-23
  count: number;
}

export type HeatmapMatrix = number[][];

interface UseActivityHeatmapOptions {
  from?: string; // ISO date
  to?: string; // ISO date
}

/**
 * Returns a 7x24 matrix (day-of-week x hour) counting activities:
 * messages sent, contact interactions, journal entries, lesson progress, check-ins.
 */
export function useActivityHeatmap(options: UseActivityHeatmapOptions = {}) {
  const supabase = useSupabase();
  const { user } = useAuth();

  const now = new Date();
  const defaultFrom = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() - 30,
  ).toISOString();
  const defaultTo = now.toISOString();

  const from = options.from ?? defaultFrom;
  const to = options.to ?? defaultTo;

  return useQuery({
    queryKey: ["activity-heatmap", from, to],
    enabled: !!user,
    queryFn: async () => {
      // Initialize 7x24 matrix (Mon=0 ... Sun=6)
      const matrix: number[][] = Array.from({ length: 7 }, () =>
        Array.from({ length: 24 }, () => 0),
      );

      // Fetch from multiple tables in parallel
      const [
        messagesRes,
        activitiesRes,
        interactionsRes,
        journalRes,
        checkinsRes,
      ] = await Promise.all([
        supabase
          .from("messages")
          .select("created_at")
          .gte("created_at", from)
          .lte("created_at", to),
        supabase
          .from("student_activities")
          .select("created_at")
          .gte("created_at", from)
          .lte("created_at", to),
        supabase
          .from("contact_interactions")
          .select("created_at")
          .gte("created_at", from)
          .lte("created_at", to),
        supabase
          .from("journal_entries")
          .select("created_at")
          .gte("created_at", from)
          .lte("created_at", to),
        supabase
          .from("weekly_checkins")
          .select("created_at")
          .gte("created_at", from)
          .lte("created_at", to),
      ]);

      const allTimestamps = [
        ...((messagesRes.data as { created_at: string }[]) ?? []).map(
          (m) => m.created_at,
        ),
        ...((activitiesRes.data as { created_at: string }[]) ?? []).map(
          (a) => a.created_at,
        ),
        ...((interactionsRes.data as { created_at: string }[]) ?? []).map(
          (i) => i.created_at,
        ),
        ...((journalRes.data as { created_at: string }[]) ?? []).map(
          (j) => j.created_at,
        ),
        ...((checkinsRes.data as { created_at: string }[]) ?? []).map(
          (c) => c.created_at,
        ),
      ];

      let totalCount = 0;

      for (const ts of allTimestamps) {
        const d = new Date(ts);
        const jsDay = d.getDay(); // 0=Sun
        // Convert to Mon=0 ... Sun=6
        const day = jsDay === 0 ? 6 : jsDay - 1;
        const hour = d.getHours();
        matrix[day][hour]++;
        totalCount++;
      }

      const maxCount = Math.max(1, ...matrix.flat());

      // Find peak day/hour
      let peakDay = 0;
      let peakHour = 0;
      let peakCount = 0;
      for (let d = 0; d < 7; d++) {
        for (let h = 0; h < 24; h++) {
          if (matrix[d][h] > peakCount) {
            peakCount = matrix[d][h];
            peakDay = d;
            peakHour = h;
          }
        }
      }

      // Compute daily totals
      const dailyTotals = matrix.map((row) =>
        row.reduce((sum, val) => sum + val, 0),
      );

      // Compute hourly totals
      const hourlyTotals = Array.from({ length: 24 }, (_, h) =>
        matrix.reduce((sum, row) => sum + row[h], 0),
      );

      return {
        matrix,
        maxCount,
        totalCount,
        peakDay,
        peakHour,
        peakCount,
        dailyTotals,
        hourlyTotals,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}
