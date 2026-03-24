"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type {
  AvailabilitySlot,
  AvailabilityOverride,
  BookableSlot,
} from "@/types/streaks";

// ─── Coach/Admin: Manage availability ────────────────────────

export function useAvailabilitySlots(coachId?: string) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const effectiveCoachId = coachId ?? user?.id;

  const slotsQuery = useQuery({
    queryKey: ["availability-slots", effectiveCoachId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("availability_slots")
        .select("*")
        .eq("coach_id", effectiveCoachId!)
        .order("day_of_week")
        .order("start_time");
      if (error) throw error;
      return data as AvailabilitySlot[];
    },
    enabled: !!effectiveCoachId,
  });

  const createSlot = useMutation({
    mutationFn: async (slot: {
      day_of_week: number;
      start_time: string;
      end_time: string;
      slot_duration_minutes?: number;
    }) => {
      const { data, error } = await supabase
        .from("availability_slots")
        .insert({ ...slot, coach_id: user!.id } as never)
        .select()
        .single();
      if (error) throw error;
      return data as AvailabilitySlot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability-slots"] });
      toast.success("Creneau ajoute");
    },
    onError: () => toast.error("Erreur lors de l'ajout"),
  });

  const deleteSlot = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("availability_slots")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability-slots"] });
      toast.success("Creneau supprime");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const toggleSlot = useMutation({
    mutationFn: async ({
      id,
      is_active,
    }: {
      id: string;
      is_active: boolean;
    }) => {
      const { error } = await supabase
        .from("availability_slots")
        .update({ is_active } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability-slots"] });
    },
  });

  return {
    slots: slotsQuery.data ?? [],
    isLoading: slotsQuery.isLoading,
    createSlot,
    deleteSlot,
    toggleSlot,
  };
}

// ─── Overrides (blocked days) ─────────────────────────────────

export function useAvailabilityOverrides(coachId?: string) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const effectiveCoachId = coachId ?? user?.id;

  const overridesQuery = useQuery({
    queryKey: ["availability-overrides", effectiveCoachId],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("availability_overrides")
        .select("*")
        .eq("coach_id", effectiveCoachId!)
        .gte("override_date", today)
        .order("override_date");
      if (error) throw error;
      return data as AvailabilityOverride[];
    },
    enabled: !!effectiveCoachId,
  });

  const addOverride = useMutation({
    mutationFn: async (override: {
      override_date: string;
      is_blocked?: boolean;
      reason?: string;
    }) => {
      const { error } = await supabase.from("availability_overrides").upsert(
        {
          ...override,
          coach_id: user!.id,
          is_blocked: override.is_blocked ?? true,
        } as never,
        { onConflict: "coach_id,override_date" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability-overrides"] });
      toast.success("Indisponibilite ajoutee");
    },
    onError: () => toast.error("Erreur"),
  });

  const removeOverride = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("availability_overrides")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["availability-overrides"] });
      toast.success("Indisponibilite supprimee");
    },
  });

  return {
    overrides: overridesQuery.data ?? [],
    isLoading: overridesQuery.isLoading,
    addOverride,
    removeOverride,
  };
}

// ─── Client: Get bookable slots for a date range ─────────────

export function useBookableSlots(startDate: string, endDate: string) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["bookable-slots", startDate, endDate],
    queryFn: async () => {
      // 1. Get all active availability slots from all coaches
      const { data: slots, error: slotsErr } = await supabase
        .from("availability_slots")
        .select(
          "*, coach:profiles!availability_slots_coach_id_fkey(id, full_name)",
        )
        .eq("is_active", true);
      if (slotsErr) throw slotsErr;

      // 2. Get overrides for this date range
      const { data: overrides, error: ovErr } = await supabase
        .from("availability_overrides")
        .select("*")
        .gte("override_date", startDate)
        .lte("override_date", endDate);
      if (ovErr) throw ovErr;

      // 3. Get existing bookings for this range to exclude taken slots
      const { data: existingCalls, error: callsErr } = await supabase
        .from("call_calendar")
        .select("date, time, assigned_to, duration_minutes")
        .gte("date", startDate)
        .lte("date", endDate)
        .in("status", ["planifie", "realise"])
        .returns<Array<{ date: string; time: string; assigned_to: string; duration_minutes: number }>>();
      if (callsErr) throw callsErr;

      // Build blocked dates map: coachId -> Set<dateString>
      const blockedDates = new Map<string, Set<string>>();
      (overrides as AvailabilityOverride[]).forEach((o) => {
        if (o.is_blocked) {
          if (!blockedDates.has(o.coach_id))
            blockedDates.set(o.coach_id, new Set());
          blockedDates.get(o.coach_id)!.add(o.override_date);
        }
      });

      // Build taken slots map: "coachId|date|time" -> true
      const takenSlots = new Set<string>();
      (existingCalls ?? []).forEach((c) => {
        takenSlots.add(`${c.assigned_to}|${c.date}|${c.time}`);
      });

      // Generate bookable slots for each day in range
      const bookable: BookableSlot[] = [];
      const start = new Date(startDate);
      const end = new Date(endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        const dayOfWeek = d.getDay();

        (
          slots as (AvailabilitySlot & {
            coach: { id: string; full_name: string } | null;
          })[]
        ).forEach((slot) => {
          if (slot.day_of_week !== dayOfWeek) return;
          if (!slot.coach) return;

          // Check if day is blocked
          if (blockedDates.get(slot.coach_id)?.has(dateStr)) return;

          // Generate time slots
          const startParts = slot.start_time.split(":").map(Number);
          const endParts = slot.end_time.split(":").map(Number);
          const startMin = startParts[0] * 60 + startParts[1];
          const endMin = endParts[0] * 60 + endParts[1];

          for (
            let m = startMin;
            m + slot.slot_duration_minutes <= endMin;
            m += slot.slot_duration_minutes
          ) {
            const hours = Math.floor(m / 60)
              .toString()
              .padStart(2, "0");
            const mins = (m % 60).toString().padStart(2, "0");
            const timeStr = `${hours}:${mins}:00`;

            // Check if already taken
            if (takenSlots.has(`${slot.coach_id}|${dateStr}|${timeStr}`))
              return;

            // Don't show past slots
            const now = new Date();
            const slotDateTime = new Date(`${dateStr}T${timeStr}`);
            if (slotDateTime <= now) return;

            bookable.push({
              coach_id: slot.coach_id,
              coach_name: slot.coach.full_name,
              date: dateStr,
              time: timeStr,
              duration_minutes: slot.slot_duration_minutes,
            });
          }
        });
      }

      // Sort by date then time
      bookable.sort(
        (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time),
      );
      return bookable;
    },
    enabled: !!user && !!startDate && !!endDate,
  });
}

// ─── Client: Book a slot ──────────────────────────────────────

export function useBookCall() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (slot: BookableSlot) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("call_calendar")
        .insert({
          client_id: user.id,
          assigned_to: slot.coach_id,
          title: `Appel avec ${slot.coach_name}`,
          date: slot.date,
          time: slot.time,
          duration_minutes: slot.duration_minutes,
          call_type: "booking",
          status: "planifie",
        } as never)
        .select()
        .single();
      if (error) throw error;

      // Send confirmation email to client (fire-and-forget)
      if (user.email) {
        fetch("/api/bookings/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prospect_name: user.user_metadata?.full_name || user.email,
            prospect_email: user.email,
            date: slot.date,
            start_time: slot.time,
            coach_name: slot.coach_name,
          }),
        }).catch(() => {});
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookable-slots"] });
      queryClient.invalidateQueries({ queryKey: ["calls"] });
      toast.success("Appel reserve avec succès !");
    },
    onError: () => toast.error("Erreur lors de la reservation"),
  });
}
