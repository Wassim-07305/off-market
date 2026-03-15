"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import { useMemo } from "react";

// ─── Types ─────────────────────────────────────────────────────

export interface Ritual {
  id: string;
  profile_id: string;
  title: string;
  description: string | null;
  frequency: "quotidien" | "hebdomadaire" | "mensuel";
  time_of_day: string | null;
  is_active: boolean;
  streak_count: number;
  last_completed_at: string | null;
  created_at: string;
}

type CreateRitualInput = {
  title: string;
  description?: string;
  frequency: "quotidien" | "hebdomadaire" | "mensuel";
  time_of_day?: string;
};

type UpdateRitualInput = {
  id: string;
  title?: string;
  description?: string;
  frequency?: "quotidien" | "hebdomadaire" | "mensuel";
  time_of_day?: string;
  is_active?: boolean;
};

// ─── Helpers ───────────────────────────────────────────────────

function isRitualDueToday(ritual: Ritual): boolean {
  const now = new Date();
  const lastCompleted = ritual.last_completed_at
    ? new Date(ritual.last_completed_at)
    : null;

  if (!ritual.is_active) return false;

  // Check if already completed in the current period
  if (lastCompleted) {
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastDate = new Date(
      lastCompleted.getFullYear(),
      lastCompleted.getMonth(),
      lastCompleted.getDate()
    );

    if (ritual.frequency === "quotidien") {
      if (lastDate >= today) return false; // already done today
    } else if (ritual.frequency === "hebdomadaire") {
      // Same ISO week
      const getWeekStart = (d: Date) => {
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.getFullYear(), d.getMonth(), diff);
      };
      if (getWeekStart(lastDate).getTime() === getWeekStart(today).getTime()) {
        return false;
      }
    } else if (ritual.frequency === "mensuel") {
      if (
        lastDate.getMonth() === today.getMonth() &&
        lastDate.getFullYear() === today.getFullYear()
      ) {
        return false;
      }
    }
  }

  return true;
}

function isCompletedToday(ritual: Ritual): boolean {
  if (!ritual.last_completed_at) return false;
  const last = new Date(ritual.last_completed_at);
  const today = new Date();
  return (
    last.getDate() === today.getDate() &&
    last.getMonth() === today.getMonth() &&
    last.getFullYear() === today.getFullYear()
  );
}

// ─── Hooks ─────────────────────────────────────────────────────

export function useRituals() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["rituals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("rituals")
        .select("*")
        .eq("profile_id", user!.id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as Ritual[];
    },
  });
}

export function useTodayRituals() {
  const { data: rituals, ...rest } = useRituals();

  const todayRituals = useMemo(() => {
    if (!rituals) return [];
    return rituals.filter(
      (r) => r.is_active && (isRitualDueToday(r) || isCompletedToday(r))
    );
  }, [rituals]);

  return { data: todayRituals, ...rest };
}

export function useCreateRitual() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CreateRitualInput) => {
      if (!user) throw new Error("Non connecte");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("rituals")
        .insert({
          profile_id: user.id,
          title: input.title,
          description: input.description ?? null,
          frequency: input.frequency,
          time_of_day: input.time_of_day ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data as Ritual;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rituals"] });
      toast.success("Rituel cree avec succes");
    },
    onError: () => {
      toast.error("Erreur lors de la creation du rituel");
    },
  });
}

export function useUpdateRitual() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateRitualInput) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("rituals")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rituals"] });
      toast.success("Rituel mis a jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise a jour du rituel");
    },
  });
}

export function useDeleteRitual() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("rituals")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rituals"] });
      toast.success("Rituel supprime");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression du rituel");
    },
  });
}

export function useCompleteRitual() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // First fetch the current ritual to calculate streak
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: ritual, error: fetchError } = await (supabase as any)
        .from("rituals")
        .select("streak_count, last_completed_at, frequency")
        .eq("id", id)
        .single();
      if (fetchError) throw fetchError;

      const now = new Date();
      let newStreak = 1;

      if (ritual.last_completed_at) {
        const last = new Date(ritual.last_completed_at);
        const diffMs = now.getTime() - last.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (ritual.frequency === "quotidien" && diffDays <= 1) {
          newStreak = (ritual.streak_count ?? 0) + 1;
        } else if (ritual.frequency === "hebdomadaire" && diffDays <= 7) {
          newStreak = (ritual.streak_count ?? 0) + 1;
        } else if (ritual.frequency === "mensuel" && diffDays <= 31) {
          newStreak = (ritual.streak_count ?? 0) + 1;
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("rituals")
        .update({
          streak_count: newStreak,
          last_completed_at: now.toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rituals"] });
      toast.success("Rituel complete !");
    },
    onError: () => {
      toast.error("Erreur lors de la completion du rituel");
    },
  });
}

export { isCompletedToday };
