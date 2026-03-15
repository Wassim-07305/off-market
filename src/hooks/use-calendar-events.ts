"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type {
  CalendarEvent,
  CalendarEventRow,
} from "@/types/calendar";
import { EVENT_COLORS } from "@/types/calendar";

// Row shapes returned by Supabase selects (tables not in Database type map)
interface SessionRow {
  id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  session_type: string;
  client?: { full_name: string } | null;
}

interface CallRow {
  id: string;
  title: string;
  date: string;
  time: string;
  duration_minutes: number;
  status: string;
  call_type: string;
  client?: { full_name: string } | null;
}

/**
 * Aggregates events from sessions, call_calendar, and calendar_events
 * for a given date range.
 */
export function useCalendarEvents(rangeStart: Date, rangeEnd: Date) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const startISO = rangeStart.toISOString();
  const endISO = rangeEnd.toISOString();

  // Format date as YYYY-MM-DD in local time
  const toLocal = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const startDate = toLocal(rangeStart);
  const endDate = toLocal(rangeEnd);

  const eventsQuery = useQuery({
    queryKey: ["calendar-events", startISO, endISO],
    enabled: !!user,
    queryFn: async () => {
      // Fetch sessions, calls, and custom events in parallel
      const [sessionsResult, callsResult, customResult] = await Promise.all([
        // 1. Sessions in range
        supabase
          .from("sessions")
          .select(
            "id, title, scheduled_at, duration_minutes, status, session_type, client:profiles!sessions_client_id_fkey(full_name)",
          )
          .gte("scheduled_at", startISO)
          .lte("scheduled_at", endISO)
          .neq("status", "cancelled"),
        // 2. Calls in range
        supabase
          .from("call_calendar")
          .select(
            "id, title, date, time, duration_minutes, status, call_type, client:profiles!call_calendar_client_id_fkey(full_name)",
          )
          .gte("date", startDate)
          .lte("date", endDate)
          .neq("status", "annule"),
        // 3. Custom calendar events
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase as any)
          .from("calendar_events")
          .select("*")
          .gte("start_at", startISO)
          .lte("start_at", endISO),
      ]);

      const sessions = (sessionsResult.data ?? []) as unknown as SessionRow[];
      const calls = (callsResult.data ?? []) as unknown as CallRow[];
      const customEvents = (customResult.data ?? []) as unknown as CalendarEventRow[];

      const merged: CalendarEvent[] = [];

      // Map sessions
      for (const s of sessions) {
        const clientName = s.client?.full_name;
        const endAt = s.duration_minutes
          ? new Date(
              new Date(s.scheduled_at).getTime() +
                s.duration_minutes * 60_000,
            ).toISOString()
          : undefined;
        merged.push({
          id: `session-${s.id}`,
          title: s.title,
          description: clientName ? `Session avec ${clientName}` : undefined,
          start: s.scheduled_at,
          end: endAt,
          type: "session",
          color: EVENT_COLORS.session,
          metadata: {
            session_id: s.id,
            session_type: s.session_type,
            status: s.status,
          },
        });
      }

      // Map calls
      for (const c of calls) {
        const clientName = c.client?.full_name;
        const startDT = `${c.date}T${c.time}`;
        const endDT = c.duration_minutes
          ? new Date(
              new Date(startDT).getTime() + c.duration_minutes * 60_000,
            ).toISOString()
          : undefined;
        merged.push({
          id: `call-${c.id}`,
          title: c.title,
          description: clientName ? `Appel avec ${clientName}` : undefined,
          start: startDT,
          end: endDT,
          type: "call",
          color: EVENT_COLORS.call,
          metadata: {
            call_id: c.id,
            call_type: c.call_type,
            status: c.status,
          },
        });
      }

      // Map custom events
      for (const e of customEvents) {
        merged.push({
          id: `event-${e.id}`,
          title: e.title,
          description: e.description ?? undefined,
          start: e.start_at,
          end: e.end_at ?? undefined,
          type: "event",
          color: e.color || EVENT_COLORS.event,
          attendees: e.attendees,
          created_by: e.created_by ?? undefined,
          metadata: { event_id: e.id },
        });
      }

      // Sort by start date
      merged.sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
      );

      return merged;
    },
  });

  // Create custom event
  const createEvent = useMutation({
    mutationFn: async (event: {
      title: string;
      description?: string;
      start_at: string;
      end_at?: string;
      color?: string;
      attendees?: string[];
    }) => {
      if (!user) throw new Error("Non authentifié");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("calendar_events")
        .insert({
          ...event,
          created_by: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success("Événement créé");
    },
    onError: () => {
      toast.error("Erreur lors de la création de l'événement");
    },
  });

  // Update custom event
  const updateEvent = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string } & Record<string, unknown>) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("calendar_events")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success("Événement mis à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });

  // Delete custom event
  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("calendar_events")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] });
      toast.success("Événement supprimé");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  return {
    events: eventsQuery.data ?? [],
    isLoading: eventsQuery.isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
