"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import type {
  Competition,
  CompetitionParticipant,
  CompetitionStatus,
} from "@/types/gamification";
import { toast } from "sonner";

// ─── List competitions ──────────────────────────────────────
export function useCompetitions(status?: CompetitionStatus) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["competitions", status],
    enabled: !!user,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from("competitions")
        .select("*, competition_participants(count)")
        .order("start_date", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data ?? []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any) =>
          ({
            ...c,
            participant_count: c.competition_participants?.[0]?.count ?? 0,
          }) as Competition,
      );
    },
  });
}

// ─── Active competitions ────────────────────────────────────
export function useActiveCompetitions() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["competitions", "active"],
    enabled: !!user,
    queryFn: async () => {
      const now = new Date().toISOString();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("competitions")
        .select("*, competition_participants(count)")
        .lte("start_date", now)
        .gte("end_date", now)
        .order("end_date", { ascending: true });

      if (error) throw error;

      return (data ?? []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any) =>
          ({
            ...c,
            status: "active" as const,
            participant_count: c.competition_participants?.[0]?.count ?? 0,
          }) as Competition,
      );
    },
  });
}

// ─── Single competition ─────────────────────────────────────
export function useCompetition(id: string | undefined) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["competition", id],
    enabled: !!user && !!id,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("competitions")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Competition;
    },
  });
}

// ─── Competition leaderboard ────────────────────────────────
export function useCompetitionLeaderboard(competitionId: string | undefined) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["competition-leaderboard", competitionId],
    enabled: !!user && !!competitionId,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("competition_participants")
        .select(
          "*, team:teams!competition_participants_team_id_fkey(id, name, avatar_emoji, color, captain_id), profile:profiles!competition_participants_user_id_fkey(id, full_name, avatar_url)",
        )
        .eq("competition_id", competitionId)
        .order("score", { ascending: false });

      if (error) throw error;

      // Assign ranks
      return (data ?? []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (p: any, i: number) =>
          ({
            ...p,
            rank: i + 1,
            score: Number(p.score),
          }) as CompetitionParticipant,
      );
    },
  });
}

// ─── Create competition (admin) ─────────────────────────────
export function useCreateCompetition() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      title: string;
      description?: string;
      type: string;
      metric: string;
      start_date: string;
      end_date: string;
      prize_description?: string;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("competitions")
        .insert({
          title: input.title,
          description: input.description ?? null,
          type: input.type,
          metric: input.metric,
          start_date: input.start_date,
          end_date: input.end_date,
          prize_description: input.prize_description ?? null,
          created_by: user!.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Competition;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["competitions"] });
      toast.success("Competition creee avec succes !");
    },
    onError: () => {
      toast.error("Erreur lors de la creation de la competition");
    },
  });
}
