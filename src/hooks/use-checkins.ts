"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useMemo } from "react";
import { toast } from "sonner";
import type { WeeklyCheckin, DailyCheckin, DailyCheckinType, Mood, Energy } from "@/types/coaching";

export function useCheckins(clientId?: string) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const effectiveClientId = clientId ?? user?.id;

  const checkinsQuery = useQuery({
    queryKey: ["checkins", effectiveClientId],
    queryFn: async () => {
      let query = supabase
        .from("weekly_checkins")
        .select(
          "*, client:profiles!weekly_checkins_client_id_fkey(id, full_name, avatar_url)",
        )
        .order("week_start", { ascending: false })
        .limit(52);

      if (effectiveClientId) query = query.eq("client_id", effectiveClientId);

      const { data, error } = await query;
      if (error) throw error;
      return data as WeeklyCheckin[];
    },
    enabled: !!effectiveClientId,
  });

  const submitCheckin = useMutation({
    mutationFn: async (checkin: {
      week_start: string;
      revenue?: number;
      prospection_count?: number;
      win?: string;
      blocker?: string;
      goal_next_week?: string;
      mood?: Mood;
      energy?: Energy;
      gratitudes?: string[];
      daily_goals?: string[];
      notes?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await (supabase as any)
        .from("weekly_checkins")
        .upsert(
          { ...checkin, client_id: user.id },
          { onConflict: "client_id,week_start" },
        )
        .select()
        .single();
      if (error) throw error;
      return data as WeeklyCheckin;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkins"] });
    },
    onError: () => {
      toast.error("Erreur lors de la soumission du check-in");
    },
  });

  const addFeedback = useMutation({
    mutationFn: async ({
      checkinId,
      feedback,
    }: {
      checkinId: string;
      feedback: string;
    }) => {
      const { error } = await (supabase as any)
        .from("weekly_checkins")
        .update({ coach_feedback: feedback })
        .eq("id", checkinId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checkins"] });
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout du feedback");
    },
  });

  // Computed stats
  const checkins = checkinsQuery.data ?? [];

  const stats = useMemo(() => {
    if (checkins.length === 0)
      return {
        streak: 0,
        totalCheckins: 0,
        avgMood: 0,
        avgEnergy: 0,
        totalRevenue: 0,
      };

    // Streak: consecutive weeks with a checkin (from most recent)
    let streak = 0;
    const sorted = [...checkins].sort((a, b) =>
      b.week_start.localeCompare(a.week_start),
    );
    const now = new Date();
    const currentMonday = getMonday(now);

    for (let i = 0; i < sorted.length; i++) {
      const expectedMonday = new Date(currentMonday);
      expectedMonday.setDate(expectedMonday.getDate() - i * 7);
      const expected = expectedMonday.toISOString().split("T")[0];
      if (sorted[i].week_start === expected) {
        streak++;
      } else {
        break;
      }
    }

    const moods = checkins.filter((c) => c.mood).map((c) => c.mood as number);
    const energies = checkins
      .filter((c) => c.energy)
      .map((c) => c.energy as number);
    const avgMood =
      moods.length > 0 ? moods.reduce((a, b) => a + b, 0) / moods.length : 0;
    const avgEnergy =
      energies.length > 0
        ? energies.reduce((a, b) => a + b, 0) / energies.length
        : 0;
    const totalRevenue = checkins.reduce(
      (sum, c) => sum + Number(c.revenue),
      0,
    );

    return {
      streak,
      totalCheckins: checkins.length,
      avgMood,
      avgEnergy,
      totalRevenue,
    };
  }, [checkins]);

  // Heatmap data: map of week_start -> mood for calendar display
  const heatmapData = useMemo(() => {
    const map: Record<string, { mood: Mood | null; energy: Energy | null }> =
      {};
    for (const c of checkins) {
      map[c.week_start] = {
        mood: c.mood as Mood | null,
        energy: c.energy as Energy | null,
      };
    }
    return map;
  }, [checkins]);

  return {
    checkins,
    isLoading: checkinsQuery.isLoading,
    submitCheckin,
    addFeedback,
    stats,
    heatmapData,
  };
}

// All client checkins for coach view
export function useAllCheckins() {
  const supabase = useSupabase();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["all-checkins"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("weekly_checkins")
        .select(
          "*, client:profiles!weekly_checkins_client_id_fkey(id, full_name, avatar_url)",
        )
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as WeeklyCheckin[];
    },
  });

  return {
    checkins: query.data ?? [],
    isLoading: query.isLoading,
  };
}

// ─── Daily Check-ins (Morning & Evening) ─────────────────
export function useDailyCheckins(clientId?: string) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const effectiveClientId = clientId ?? user?.id;
  const today = new Date().toISOString().split("T")[0];

  // Fetch today's daily checkins
  const todayQuery = useQuery({
    queryKey: ["daily-checkins", "today", effectiveClientId, today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_checkins")
        .select("*")
        .eq("client_id", effectiveClientId!)
        .eq("checkin_date", today);
      if (error) throw error;
      return data as DailyCheckin[];
    },
    enabled: !!effectiveClientId,
  });

  // Fetch recent daily checkins (last 30 days)
  const recentQuery = useQuery({
    queryKey: ["daily-checkins", "recent", effectiveClientId],
    queryFn: async () => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      const { data, error } = await supabase
        .from("daily_checkins")
        .select("*")
        .eq("client_id", effectiveClientId!)
        .gte("checkin_date", cutoff.toISOString().split("T")[0])
        .order("checkin_date", { ascending: false });
      if (error) throw error;
      return data as DailyCheckin[];
    },
    enabled: !!effectiveClientId,
  });

  const todayCheckins = todayQuery.data ?? [];
  const morningDone = todayCheckins.find((c) => c.checkin_type === "morning") ?? null;
  const eveningDone = todayCheckins.find((c) => c.checkin_type === "evening") ?? null;

  // Create daily checkin mutation
  const createDailyCheckin = useMutation({
    mutationFn: async (
      checkin:
        | {
            type: "morning";
            energy: Energy;
            mood: Mood;
            goal_today: string;
            priority: string;
          }
        | {
            type: "evening";
            wins: string;
            learnings: string;
            challenges: string;
            gratitude: string;
          },
    ) => {
      if (!user) throw new Error("Not authenticated");

      const base = {
        client_id: user.id,
        checkin_date: today,
        checkin_type: checkin.type as DailyCheckinType,
      };

      const payload =
        checkin.type === "morning"
          ? {
              ...base,
              energy: checkin.energy,
              mood: checkin.mood,
              goal_today: checkin.goal_today,
              priority: checkin.priority,
            }
          : {
              ...base,
              wins: checkin.wins,
              learnings: checkin.learnings,
              challenges: checkin.challenges,
              gratitude: checkin.gratitude,
            };

      const { data, error } = await (supabase as any)
        .from("daily_checkins")
        .upsert(payload, { onConflict: "client_id,checkin_date,checkin_type" })
        .select()
        .single();
      if (error) throw error;
      return data as DailyCheckin;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["daily-checkins"] });
      toast.success(
        variables.type === "morning"
          ? "Check-in matinal enregistre !"
          : "Check-in du soir enregistre !",
      );
    },
    onError: () => {
      toast.error("Erreur lors de la soumission du check-in");
    },
  });

  // Compute daily streak
  const dailyStreak = useMemo(() => {
    const recent = recentQuery.data ?? [];
    if (recent.length === 0) return 0;

    // Group by date
    const dates = new Set(recent.map((c) => c.checkin_date));
    const sortedDates = [...dates].sort((a, b) => b.localeCompare(a));

    let streak = 0;
    const now = new Date();
    for (let i = 0; i < sortedDates.length; i++) {
      const expected = new Date(now);
      expected.setDate(expected.getDate() - i);
      const expectedStr = expected.toISOString().split("T")[0];
      if (sortedDates.includes(expectedStr)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [recentQuery.data]);

  return {
    todayCheckins,
    morningDone,
    eveningDone,
    recentCheckins: recentQuery.data ?? [],
    isLoading: todayQuery.isLoading,
    createDailyCheckin,
    dailyStreak,
  };
}

// All daily checkins for coach view
export function useAllDailyCheckins() {
  const supabase = useSupabase();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["all-daily-checkins"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_checkins")
        .select(
          "*, client:profiles!daily_checkins_client_id_fkey(id, full_name, avatar_url)",
        )
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as DailyCheckin[];
    },
  });

  return {
    checkins: query.data ?? [],
    isLoading: query.isLoading,
  };
}

function getMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

// ─── Check-in Trends Report ─────────────────────────
export interface CheckinTrend {
  period: string; // week_start
  avgMood: number;
  avgEnergy: number;
  totalRevenue: number;
  checkinCount: number;
  topWin: string | null;
  topBlocker: string | null;
}

export function useCheckinTrends(clientId?: string, weeks = 12) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const effectiveId = clientId ?? user?.id;

  return useQuery({
    queryKey: ["checkin-trends", effectiveId, weeks],
    enabled: !!effectiveId,
    queryFn: async () => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - weeks * 7);

      let query = supabase
        .from("weekly_checkins")
        .select("*")
        .gte("week_start", cutoff.toISOString().split("T")[0])
        .order("week_start", { ascending: true });

      if (effectiveId) query = query.eq("client_id", effectiveId);

      const { data, error } = await query;
      if (error) throw error;

      const checkins = (data ?? []) as WeeklyCheckin[];

      // Group by week
      const weekMap = new Map<string, WeeklyCheckin[]>();
      for (const c of checkins) {
        const existing = weekMap.get(c.week_start) ?? [];
        existing.push(c);
        weekMap.set(c.week_start, existing);
      }

      const trends: CheckinTrend[] = [];
      for (const [period, items] of weekMap) {
        const moods = items.filter((c) => c.mood).map((c) => Number(c.mood));
        const energies = items
          .filter((c) => c.energy)
          .map((c) => Number(c.energy));
        const avgMood =
          moods.length > 0
            ? Math.round(
                (moods.reduce((a, b) => a + b, 0) / moods.length) * 10,
              ) / 10
            : 0;
        const avgEnergy =
          energies.length > 0
            ? Math.round(
                (energies.reduce((a, b) => a + b, 0) / energies.length) * 10,
              ) / 10
            : 0;
        const totalRevenue = items.reduce(
          (sum, c) => sum + Number(c.revenue ?? 0),
          0,
        );
        const wins = items.filter((c) => c.win).map((c) => c.win!);
        const blockers = items.filter((c) => c.blocker).map((c) => c.blocker!);

        trends.push({
          period,
          avgMood,
          avgEnergy,
          totalRevenue,
          checkinCount: items.length,
          topWin: wins[0] ?? null,
          topBlocker: blockers[0] ?? null,
        });
      }

      // Compute overall insights
      const allMoods = trends
        .filter((t) => t.avgMood > 0)
        .map((t) => t.avgMood);
      const moodTrend =
        allMoods.length >= 2 ? allMoods[allMoods.length - 1] - allMoods[0] : 0;
      const allEnergies = trends
        .filter((t) => t.avgEnergy > 0)
        .map((t) => t.avgEnergy);
      const energyTrend =
        allEnergies.length >= 2
          ? allEnergies[allEnergies.length - 1] - allEnergies[0]
          : 0;
      const revenueTrend = trends.reduce((s, t) => s + t.totalRevenue, 0);
      const completionRate =
        weeks > 0 ? Math.round((trends.length / weeks) * 100) : 0;

      return {
        trends,
        insights: {
          moodTrend: Math.round(moodTrend * 10) / 10,
          energyTrend: Math.round(energyTrend * 10) / 10,
          totalRevenue: revenueTrend,
          completionRate,
          weeksCovered: trends.length,
          moodDirection:
            moodTrend > 0.2 ? "up" : moodTrend < -0.2 ? "down" : "stable",
          energyDirection:
            energyTrend > 0.2 ? "up" : energyTrend < -0.2 ? "down" : "stable",
        },
      };
    },
  });
}
