"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────

export type SessionType = "individual" | "group" | "emergency";
export type SessionStatus = "scheduled" | "completed" | "cancelled" | "no_show";

export interface ActionItem {
  id: string;
  text: string;
  done: boolean;
}

export interface SessionProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: string;
}

export interface Session {
  id: string;
  title: string;
  client_id: string;
  coach_id: string;
  session_type: SessionType;
  scheduled_at: string;
  duration_minutes: number;
  status: SessionStatus;
  notes: string | null;
  action_items: ActionItem[] | null;
  replay_url: string | null;
  satisfaction_rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface SessionWithRelations extends Session {
  client: SessionProfile | null;
  coach: SessionProfile | null;
}

export interface SessionFilters {
  status?: SessionStatus;
  dateFrom?: string;
  dateTo?: string;
}

// ── useSessions ────────────────────────────────────────────────────────────

export function useSessions(filters?: SessionFilters) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["sessions", filters],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from("sessions")
        .select(
          "*, client:profiles!sessions_client_id_fkey(id, full_name, avatar_url, role), coach:profiles!sessions_coach_id_fkey(id, full_name, avatar_url, role)",
        )
        .order("scheduled_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.dateFrom) {
        query = query.gte("scheduled_at", filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte("scheduled_at", filters.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as SessionWithRelations[];
    },
    enabled: !!user,
  });
}

// ── useSession ─────────────────────────────────────────────────────────────

export function useSession(id: string | null) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["session", id],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("sessions")
        .select(
          "*, client:profiles!sessions_client_id_fkey(id, full_name, avatar_url, role), coach:profiles!sessions_coach_id_fkey(id, full_name, avatar_url, role)",
        )
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as SessionWithRelations;
    },
    enabled: !!user && !!id,
  });
}

// ── useCreateSession ───────────────────────────────────────────────────────

export function useCreateSession() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (session: {
      title: string;
      client_id: string;
      session_type: SessionType;
      scheduled_at: string;
      duration_minutes: number;
      notes?: string;
      action_items?: ActionItem[];
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("sessions")
        .insert({
          ...session,
          coach_id: user?.id,
          status: "scheduled",
          action_items: session.action_items ?? [],
        })
        .select()
        .single();
      if (error) throw error;
      return data as Session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["session-stats"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-sessions"] });
      toast.success("Session creee avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la creation de la session");
    },
  });
}

// ── useUpdateSession ───────────────────────────────────────────────────────

export function useUpdateSession() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      title?: string;
      notes?: string;
      status?: SessionStatus;
      action_items?: ActionItem[];
      replay_url?: string;
      satisfaction_rating?: number;
      duration_minutes?: number;
      session_type?: SessionType;
      scheduled_at?: string;
      client_id?: string;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("sessions")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
      queryClient.invalidateQueries({ queryKey: ["session-stats"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-sessions"] });
      toast.success("Session mise à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour de la session");
    },
  });
}

// ── useCancelSession ───────────────────────────────────────────────────────

export function useCancelSession() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("sessions")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
      queryClient.invalidateQueries({ queryKey: ["session-stats"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-sessions"] });
      toast.success("Session annulee");
    },
    onError: () => {
      toast.error("Erreur lors de l'annulation de la session");
    },
  });
}

// ── useCompleteSession ─────────────────────────────────────────────────────

export function useCompleteSession() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const updates: Record<string, unknown> = {
        status: "completed",
        updated_at: new Date().toISOString(),
      };
      if (notes !== undefined) {
        updates.notes = notes;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("sessions")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["session"] });
      queryClient.invalidateQueries({ queryKey: ["session-stats"] });
      queryClient.invalidateQueries({ queryKey: ["upcoming-sessions"] });
      toast.success("Session terminée");
    },
    onError: () => {
      toast.error("Erreur lors de la completion de la session");
    },
  });
}

// ── useUpcomingSessions ────────────────────────────────────────────────────

export function useUpcomingSessions() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["upcoming-sessions", user?.id],
    queryFn: async () => {
      const now = new Date().toISOString();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("sessions")
        .select(
          "*, client:profiles!sessions_client_id_fkey(id, full_name, avatar_url, role), coach:profiles!sessions_coach_id_fkey(id, full_name, avatar_url, role)",
        )
        .eq("status", "scheduled")
        .gte("scheduled_at", now)
        .or(`coach_id.eq.${user?.id},client_id.eq.${user?.id}`)
        .order("scheduled_at", { ascending: true })
        .limit(5);
      if (error) throw error;
      return (data ?? []) as SessionWithRelations[];
    },
    enabled: !!user,
  });
}

// ── useSessionStats ────────────────────────────────────────────────────────

export interface SessionStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

export function useSessionStats() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["session-stats", user?.id],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("sessions")
        .select("status");
      if (error) throw error;

      const rows = (data ?? []) as { status: SessionStatus }[];
      const stats: SessionStats = {
        total: rows.length,
        scheduled: rows.filter((r) => r.status === "scheduled").length,
        completed: rows.filter((r) => r.status === "completed").length,
        cancelled: rows.filter((r) => r.status === "cancelled").length,
        noShow: rows.filter((r) => r.status === "no_show").length,
      };
      return stats;
    },
    enabled: !!user,
  });
}
