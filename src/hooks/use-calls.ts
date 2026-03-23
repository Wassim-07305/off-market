"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type {
  CallCalendarWithRelations,
  RoomStatus,
  TranscriptEntry,
  CallNoteTemplate,
} from "@/types/calls";

export function useCalls(weekStart?: Date) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const callsQuery = useQuery({
    queryKey: ["calls", weekStart?.toISOString()],
    queryFn: async ({ signal }) => {
      let query = supabase
        .from("call_calendar")
        .select(
          "*, client:profiles!call_calendar_client_id_fkey(id, full_name, avatar_url), assigned_profile:profiles!call_calendar_assigned_to_fkey(id, full_name)",
        )
        .order("date", { ascending: false })
        .order("time", { ascending: true })
        .limit(200)
        .abortSignal(signal);

      if (weekStart) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        // Use local date to avoid UTC shift (e.g. CET midnight → previous day in UTC)
        const toLocal = (d: Date) => {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          return `${y}-${m}-${day}`;
        };
        query = query
          .gte("date", toLocal(weekStart))
          .lte("date", toLocal(weekEnd));
      }

      const { data, error } = await query.returns<CallCalendarWithRelations[]>();
      if (error) throw error;
      return (data ?? []) as CallCalendarWithRelations[];
    },
    enabled: !!user,
  });

  const createCall = useMutation({
    mutationFn: async (call: {
      title: string;
      client_id?: string | null;
      date: string;
      time: string;
      duration_minutes?: number;
      call_type?: string;
      status?: string;
      link?: string;
      notes?: string;
    }) => {
      const { data, error } = await supabase
        .from("call_calendar")
        .insert({
          ...call,
          assigned_to: user?.id,
        } as never)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calls"] }),
    onError: () => {
      toast.error("Erreur lors de la création de l'appel");
    },
  });

  const updateCall = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string } & Record<string, unknown>) => {
      const { error } = await supabase
        .from("call_calendar")
        .update(updates as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calls"] }),
    onError: () => {
      toast.error("Erreur lors de la mise à jour de l'appel");
    },
  });

  const deleteCall = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("call_calendar")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calls"] }),
    onError: () => {
      toast.error("Erreur lors de la suppression de l'appel");
    },
  });

  const updateRoomStatus = useMutation({
    mutationFn: async ({
      id,
      room_status,
      started_at,
      ended_at,
      actual_duration_seconds,
    }: {
      id: string;
      room_status: RoomStatus;
      started_at?: string;
      ended_at?: string;
      actual_duration_seconds?: number;
    }) => {
      const updates: Record<string, unknown> = { room_status };
      if (started_at) updates.started_at = started_at;
      if (ended_at) updates.ended_at = ended_at;
      if (actual_duration_seconds !== undefined)
        updates.actual_duration_seconds = actual_duration_seconds;
      const { error } = await supabase
        .from("call_calendar")
        .update(updates as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calls"] }),
    onError: () => {
      toast.error("Erreur lors de la mise à jour du statut de la salle");
    },
  });

  const saveTranscript = useMutation({
    mutationFn: async ({
      call_id,
      content,
      language,
      duration_seconds,
    }: {
      call_id: string;
      content: TranscriptEntry[];
      language?: string;
      duration_seconds?: number;
    }) => {
      const { data, error } = await supabase
        .from("call_transcripts")
        .insert({
          call_id,
          content: JSON.stringify(content),
          language: language ?? "fr-FR",
          duration_seconds,
        } as never)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onError: () => {
      toast.error("Erreur lors de la sauvegarde de la transcription");
    },
  });

  const rescheduleCall = useMutation({
    mutationFn: async ({
      id,
      newDate,
      newTime,
      reason,
    }: {
      id: string;
      newDate: string;
      newTime: string;
      reason: string;
    }) => {
      // Get the current call date/time to preserve as original
      const { data: current, error: fetchErr } = await supabase
        .from("call_calendar")
        .select("date, time")
        .eq("id", id)
        .returns<{ date: string; time: string }[]>()
        .single();
      if (fetchErr) throw fetchErr;

      // Build update payload — include original_date/time only if columns exist
      const updatePayload: Record<string, unknown> = {
        date: newDate,
        time: newTime,
        status: "reporte",
        notes: reason ? `Report: ${reason}` : undefined,
      };

      // Try with reschedule columns first, fallback without
      const { error } = await supabase
        .from("call_calendar")
        .update({
          ...updatePayload,
          reschedule_reason: reason,
          original_date: current?.date,
          original_time: current?.time,
        } as never)
        .eq("id", id);

      if (error && error.code === "PGRST204") {
        // Columns don't exist — update without them
        const { error: fallbackErr } = await supabase
          .from("call_calendar")
          .update(updatePayload as never)
          .eq("id", id);
        if (fallbackErr) throw fallbackErr;
      } else if (error) {
        throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calls"] }),
    onError: () => {
      toast.error("Erreur lors du report de l'appel");
    },
  });

  const rateSatisfaction = useMutation({
    mutationFn: async ({ id, rating }: { id: string; rating: number }) => {
      const { error } = await supabase
        .from("call_calendar")
        .update({ satisfaction_rating: rating } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calls"] }),
    onError: () => {
      toast.error("Erreur lors de l'évaluation de la satisfaction");
    },
  });

  return {
    calls: callsQuery.data ?? [],
    isLoading: callsQuery.isLoading,
    error: callsQuery.error,
    createCall,
    updateCall,
    deleteCall,
    updateRoomStatus,
    saveTranscript,
    rescheduleCall,
    rateSatisfaction,
  };
}

export function useCallNoteTemplates() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["call-note-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("call_note_templates")
        .select("*")
        .eq("is_active", true)
        .order("title")
        .returns<CallNoteTemplate[]>();
      if (error) throw error;
      return (data ?? []) as CallNoteTemplate[];
    },
  });
}

type CallMetricRow = {
  status: string;
  duration_minutes: number;
  actual_duration_seconds: number | null;
  satisfaction_rating: number | null;
  call_type: string;
  date: string;
};

export function useCallMetrics(dateRange?: { from: string; to: string }) {
  const supabase = useSupabase();
  const { user } = useAuth();

  const metricsQuery = useQuery({
    queryKey: ["call-metrics", dateRange?.from, dateRange?.to],
    queryFn: async () => {
      let query = supabase
        .from("call_calendar")
        .select(
          "status, duration_minutes, actual_duration_seconds, satisfaction_rating, call_type, date",
        );

      if (dateRange) {
        query = query.gte("date", dateRange.from).lte("date", dateRange.to);
      }

      const { data, error } = await query.returns<CallMetricRow[]>();
      if (error) throw error;

      const rows = data ?? [];
      const total = rows.length;
      const realise = rows.filter((c) => c.status === "realise");
      const noShow = rows.filter((c) => c.status === "no_show");
      const annule = rows.filter((c) => c.status === "annule");
      const reporte = rows.filter((c) => c.status === "reporte");

      const completionRate =
        total > 0 ? Math.round((realise.length / total) * 100) : 0;
      const noShowRate =
        total > 0 ? Math.round((noShow.length / total) * 100) : 0;

      const durations = realise
        .map((c) => c.actual_duration_seconds)
        .filter((d): d is number => d !== null);
      const avgDuration =
        durations.length > 0
          ? Math.round(
              durations.reduce((a, b) => a + b, 0) / durations.length / 60,
            )
          : 0;

      const ratings = rows
        .map((c) => c.satisfaction_rating)
        .filter((r): r is number => r !== null);
      const avgSatisfaction =
        ratings.length > 0
          ? Math.round(
              (ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10,
            ) / 10
          : 0;

      // Calls by type
      const byType: Record<string, number> = {};
      rows.forEach((c) => {
        byType[c.call_type] = (byType[c.call_type] || 0) + 1;
      });

      // Calls by day of week (0=Mon..6=Sun)
      const byDay: number[] = [0, 0, 0, 0, 0, 0, 0];
      rows.forEach((c) => {
        const d = new Date(c.date);
        const day = d.getDay();
        byDay[day === 0 ? 6 : day - 1]++;
      });

      return {
        total,
        realise: realise.length,
        noShow: noShow.length,
        annule: annule.length,
        reporte: reporte.length,
        completionRate,
        noShowRate,
        avgDuration,
        avgSatisfaction,
        totalRatings: ratings.length,
        byType,
        byDay,
      };
    },
    enabled: !!user,
  });

  return metricsQuery;
}

export function useCallById(callId: string | null) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["call", callId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("call_calendar")
        .select(
          "*, client:profiles!call_calendar_client_id_fkey(id, full_name, avatar_url), assigned_profile:profiles!call_calendar_assigned_to_fkey(id, full_name)",
        )
        .eq("id", callId!)
        .returns<CallCalendarWithRelations[]>()
        .single();
      if (error) throw error;
      return data as unknown as CallCalendarWithRelations;
    },
    enabled: !!user && !!callId,
  });
}
