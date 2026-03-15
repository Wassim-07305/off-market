"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type { Session, SessionType, ActionItem } from "@/types/coaching";

export function useSessions(clientId?: string) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const sessionsQuery = useQuery({
    queryKey: ["sessions", clientId],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from("sessions")
        .select(
          "*, client:profiles!sessions_client_id_fkey(id, full_name, avatar_url), coach:profiles!sessions_coach_id_fkey(id, full_name, avatar_url)",
        )
        .order("scheduled_at", { ascending: false })
        .limit(50);

      if (clientId) query = query.eq("client_id", clientId);

      const { data, error } = await query;
      if (error) throw error;
      return data as Session[];
    },
  });

  const createSession = useMutation({
    mutationFn: async (session: {
      client_id: string;
      title: string;
      session_type: SessionType;
      scheduled_at: string;
      duration_minutes?: number;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("sessions")
        .insert({ ...session, coach_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Session;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: () => { toast.error("Erreur lors de la création de la session"); },
  });

  const updateSession = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Session> & { id: string }) => {
      const { error } = await supabase
        .from("sessions")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: () => { toast.error("Erreur lors de la mise à jour de la session"); },
  });

  const completeSession = useMutation({
    mutationFn: async ({
      id,
      notes,
      actionItems,
    }: {
      id: string;
      notes?: string;
      actionItems?: ActionItem[];
    }) => {
      const { error } = await supabase
        .from("sessions")
        .update({
          status: "completed",
          notes,
          action_items: actionItems ?? [],
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: () => { toast.error("Erreur lors de la complétion de la session"); },
  });

  return {
    sessions: sessionsQuery.data ?? [],
    upcoming: (sessionsQuery.data ?? []).filter(
      (s) => s.status === "scheduled",
    ),
    isLoading: sessionsQuery.isLoading,
    createSession,
    updateSession,
    completeSession,
  };
}
