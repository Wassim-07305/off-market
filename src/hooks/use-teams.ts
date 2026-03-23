"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import type { Team, TeamMember } from "@/types/gamification";
import { toast } from "sonner";

// ─── List all teams with member count ───────────────────────
export function useTeams() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["teams"],
    enabled: !!user,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("teams")
        .select(
          "*, captain:profiles!teams_captain_id_fkey(id, full_name, avatar_url), team_members(count)",
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data ?? []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (t: any) =>
          ({
            ...t,
            member_count: t.team_members?.[0]?.count ?? 0,
            captain: t.captain,
          }) as Team,
      );
    },
  });
}

// ─── Single team with members ───────────────────────────────
export function useTeam(id: string | undefined) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["team", id],
    enabled: !!user && !!id,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("teams")
        .select(
          "*, captain:profiles!teams_captain_id_fkey(id, full_name, avatar_url)",
        )
        .eq("id", id)
        .single();

      if (error) throw error;

      // Fetch members
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: members, error: mErr } = await (supabase as any)
        .from("team_members")
        .select(
          "*, profile:profiles!team_members_user_id_fkey(id, full_name, avatar_url)",
        )
        .eq("team_id", id)
        .order("joined_at", { ascending: true });

      if (mErr) throw mErr;

      return {
        ...data,
        members: members as TeamMember[],
        member_count: (members ?? []).length,
      } as Team;
    },
  });
}

// ─── Current user's team ────────────────────────────────────
export function useMyTeam() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-team", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("team_members")
        .select(
          "team_id, team:teams!team_members_team_id_fkey(*, captain:profiles!teams_captain_id_fkey(id, full_name, avatar_url))",
        )
        .eq("user_id", user!.id)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return data.team as Team;
    },
  });
}

// ─── Create team ────────────────────────────────────────────
export function useCreateTeam() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      description?: string;
      avatar_emoji?: string;
      color?: string;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("teams")
        .insert({
          name: input.name,
          description: input.description ?? null,
          avatar_emoji: input.avatar_emoji ?? "🔥",
          color: input.color ?? "#DC2626",
          captain_id: user!.id,
          created_by: user!.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join as member
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any)
        .from("team_members")
        .insert({ team_id: data.id, user_id: user!.id });

      return data as Team;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teams"] });
      qc.invalidateQueries({ queryKey: ["my-team"] });
      toast.success("Équipe creee avec succès !");
    },
    onError: () => {
      toast.error("Erreur lors de la creation de l'équipe");
    },
  });
}

// ─── Join team ──────────────────────────────────────────────
export function useJoinTeam() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (teamId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("team_members")
        .insert({ team_id: teamId, user_id: user!.id });

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teams"] });
      qc.invalidateQueries({ queryKey: ["my-team"] });
      toast.success("Tu as rejoint l'équipe !");
    },
    onError: () => {
      toast.error("Impossible de rejoindre l'équipe");
    },
  });
}

// ─── Leave team ─────────────────────────────────────────────
export function useLeaveTeam() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (teamId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("team_members")
        .delete()
        .eq("team_id", teamId)
        .eq("user_id", user!.id);

      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["teams"] });
      qc.invalidateQueries({ queryKey: ["my-team"] });
      toast.success("Tu as quitte l'équipe");
    },
    onError: () => {
      toast.error("Impossible de quitter l'équipe");
    },
  });
}
