"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
interface Replay {
  id: string;
  coach_id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  category: string | null;
  duration_seconds: number | null;
  recorded_at: string;
  created_at: string;
  coach?: any;
}

export function useReplays(filters?: {
  category?: string;
  search?: string;
  coachId?: string;
}) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["replays", filters?.category, filters?.search, filters?.coachId],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from("replays")
        .select("*, coach:profiles!replays_coach_id_fkey(*)")
        .order("recorded_at", { ascending: false });

      if (filters?.category && filters.category !== "all") {
        query = query.eq("category", filters.category);
      }

      if (filters?.coachId) {
        query = query.eq("coach_id", filters.coachId);
      }

      if (filters?.search?.trim()) {
        query = query.ilike("title", `%${filters.search.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Replay[];
    },
  });
}

export function useReplayCategories() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["replay-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("replays")
        .select("category")
        .not("category", "is", null);
      if (error) throw error;

      const categories = [
        ...new Set(
          ((data as any[]) ?? []).map((r: any) => r.category).filter(Boolean),
        ),
      ] as string[];
      return categories.sort();
    },
  });
}

export function useReplayMutations() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["replays"] });
    queryClient.invalidateQueries({ queryKey: ["replay-categories"] });
  };

  const createReplay = useMutation({
    mutationFn: async (replay: Omit<Replay, "id" | "created_at" | "coach">) => {
      const { data, error } = await supabase
        .from("replays")
        .insert(replay as any)
        .select()
        .single();
      if (error) throw error;
      return data as Replay;
    },
    onSuccess: invalidate,
  });

  const updateReplay = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string } & Partial<Replay>) => {
      const { error } = await supabase
        .from("replays")
        .update(updates as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  const deleteReplay = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("replays").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
  });

  return { createReplay, updateReplay, deleteReplay };
}
