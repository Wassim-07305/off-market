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
 * messages sent, lesson completions, and logins.
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

      // Fetch messages
      const { data: messages } = await supabase
        .from("messages")
        .select("created_at")
        .gte("created_at", from)
        .lte("created_at", to);

      // Fetch student activities (lesson completions, etc.)
      const { data: activities } = await supabase
        .from("student_activities")
        .select("created_at")
        .gte("created_at", from)
        .lte("created_at", to);

      const allTimestamps = [
        ...(messages as { created_at: string }[] ?? []).map((m) => m.created_at),
        ...(activities as { created_at: string }[] ?? []).map((a) => a.created_at),
      ];

      for (const ts of allTimestamps) {
        const d = new Date(ts);
        const jsDay = d.getDay(); // 0=Sun
        // Convert to Mon=0 ... Sun=6
        const day = jsDay === 0 ? 6 : jsDay - 1;
        const hour = d.getHours();
        matrix[day][hour]++;
      }

      const maxCount = Math.max(1, ...matrix.flat());

      return { matrix, maxCount };
    },
    staleTime: 5 * 60 * 1000,
  });
}
