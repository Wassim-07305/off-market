"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { GoogleCalendarEvent } from "@/types/google-calendar";

interface StatusResponse {
  connected: boolean;
  google_email: string | null;
}

export function useGoogleCalendarStatus() {
  return useQuery<StatusResponse>({
    queryKey: ["google-calendar-status"],
    queryFn: async () => {
      const res = await fetch("/api/google-calendar/status");
      if (!res.ok) throw new Error("Failed to fetch status");
      return res.json();
    },
    staleTime: 5 * 60_000, // 5 min
  });
}

export function useGoogleCalendarEvents(weekStart: Date, enabled = true) {
  const timeMin = weekStart.toISOString();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);
  const timeMax = weekEnd.toISOString();

  return useQuery<GoogleCalendarEvent[]>({
    queryKey: ["google-calendar-events", timeMin, timeMax],
    queryFn: async () => {
      const params = new URLSearchParams({ timeMin, timeMax });
      const res = await fetch(`/api/google-calendar/events?${params}`);
      if (!res.ok) throw new Error("Failed to fetch events");
      const data = await res.json();
      return data.events;
    },
    staleTime: 2 * 60_000, // 2 min
    enabled,
  });
}

export function useDisconnectGoogleCalendar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/google-calendar/disconnect", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Disconnect failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["google-calendar-status"] });
      queryClient.removeQueries({ queryKey: ["google-calendar-events"] });
      toast.success("Google Agenda deconnecte");
    },
    onError: () => {
      toast.error("Erreur lors de la déconnexion");
    },
  });
}
