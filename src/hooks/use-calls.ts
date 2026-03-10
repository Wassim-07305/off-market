"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useMemo } from "react";
import type { CallCalendarWithRelations, RoomStatus, TranscriptEntry, CallNoteTemplate } from "@/types/calls";

export function useCalls(weekStart?: Date) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const callsQuery = useQuery({
    queryKey: ["calls", weekStart?.toISOString()],
    queryFn: async () => {
      let query = supabase
        .from("call_calendar")
        .select("*, client:profiles!call_calendar_client_id_fkey(id, full_name, avatar_url), assigned_profile:profiles!call_calendar_assigned_to_fkey(id, full_name)")
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (weekStart) {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        query = query
          .gte("date", weekStart.toISOString().split("T")[0])
          .lte("date", weekEnd.toISOString().split("T")[0]);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as CallCalendarWithRelations[];
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
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calls"] }),
  });

  const updateCall = useMutation({
    mutationFn: async ({ id, ...updates }: { id: string } & Record<string, unknown>) => {
      const { error } = await supabase
        .from("call_calendar")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calls"] }),
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
      if (actual_duration_seconds !== undefined) updates.actual_duration_seconds = actual_duration_seconds;
      const { error } = await supabase
        .from("call_calendar")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calls"] }),
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
        })
        .select()
        .single();
      if (error) throw error;
      return data;
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
      // First get the current call to save original date/time
      const { data: current, error: fetchErr } = await supabase
        .from("call_calendar")
        .select("date, time, original_date, original_time")
        .eq("id", id)
        .single();
      if (fetchErr) throw fetchErr;

      const { error } = await supabase
        .from("call_calendar")
        .update({
          date: newDate,
          time: newTime,
          status: "reporte",
          reschedule_reason: reason,
          original_date: current.original_date ?? current.date,
          original_time: current.original_time ?? current.time,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calls"] }),
  });

  const rateSatisfaction = useMutation({
    mutationFn: async ({ id, rating }: { id: string; rating: number }) => {
      const { error } = await supabase
        .from("call_calendar")
        .update({ satisfaction_rating: rating })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["calls"] }),
  });

  return {
    calls: callsQuery.data ?? [],
    isLoading: callsQuery.isLoading,
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
        .order("title");
      if (error) throw error;
      return data as CallNoteTemplate[];
    },
  });
}

export function useCallMetrics(dateRange?: { from: string; to: string }) {
  const supabase = useSupabase();
  const { user } = useAuth();

  const metricsQuery = useQuery({
    queryKey: ["call-metrics", dateRange?.from, dateRange?.to],
    queryFn: async () => {
      let query = supabase
        .from("call_calendar")
        .select("status, duration_minutes, actual_duration_seconds, satisfaction_rating, call_type, date");

      if (dateRange) {
        query = query.gte("date", dateRange.from).lte("date", dateRange.to);
      }

      const { data, error } = await query;
      if (error) throw error;

      const total = data.length;
      const realise = data.filter((c) => c.status === "realise");
      const noShow = data.filter((c) => c.status === "no_show");
      const annule = data.filter((c) => c.status === "annule");
      const reporte = data.filter((c) => c.status === "reporte");

      const completionRate = total > 0 ? Math.round((realise.length / total) * 100) : 0;
      const noShowRate = total > 0 ? Math.round((noShow.length / total) * 100) : 0;

      const durations = realise
        .map((c) => c.actual_duration_seconds)
        .filter((d): d is number => d !== null);
      const avgDuration = durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length / 60)
        : 0;

      const ratings = data
        .map((c) => c.satisfaction_rating)
        .filter((r): r is number => r !== null);
      const avgSatisfaction = ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : 0;

      // Calls by type
      const byType: Record<string, number> = {};
      data.forEach((c) => {
        byType[c.call_type] = (byType[c.call_type] || 0) + 1;
      });

      // Calls by day of week (0=Mon..6=Sun)
      const byDay: number[] = [0, 0, 0, 0, 0, 0, 0];
      data.forEach((c) => {
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
          "*, client:profiles!call_calendar_client_id_fkey(id, full_name, avatar_url), assigned_profile:profiles!call_calendar_assigned_to_fkey(id, full_name)"
        )
        .eq("id", callId!)
        .single();
      if (error) throw error;
      return data as CallCalendarWithRelations;
    },
    enabled: !!user && !!callId,
  });
}
