"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

export interface SavedSegment {
  id: string;
  name: string;
  description: string | null;
  filters: Record<string, unknown>;
  color: string | null;
  created_by: string;
  is_shared: boolean;
  created_at: string;
  updated_at: string;
  creator?: { full_name: string; avatar_url: string | null } | null;
}

export function useSavedSegments() {
  const supabase = useSupabase();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["saved-segments"],
    enabled: !!user,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("saved_segments")
        .select(
          "*, creator:profiles!saved_segments_created_by_fkey(full_name, avatar_url)",
        )
        .order("created_at", { ascending: false });
      if (error) {
        // Fallback without join if FK not available
        const { data: fallback, error: err2 } = await supabase
          .from("saved_segments")
          .select("*")
          .order("created_at", { ascending: false });
        if (err2) {
          console.warn("saved_segments query error:", err2.message);
          return [] as SavedSegment[];
        }
        return (fallback ?? []) as SavedSegment[];
      }
      return (data ?? []) as SavedSegment[];
    },
  });

  return {
    segments: query.data ?? [],
    mySegments: (query.data ?? []).filter((s) => s.created_by === user?.id),
    sharedSegments: (query.data ?? []).filter(
      (s) => s.is_shared && s.created_by !== user?.id,
    ),
    isLoading: query.isLoading,
  };
}

export function useCreateSegment() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (segment: {
      name: string;
      description?: string;
      filters: Record<string, unknown>;
      is_shared?: boolean;
      color?: string;
    }) => {
      if (!user) throw new Error("Non authentifie");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("saved_segments")
        .insert({
          ...segment,
          created_by: user.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data as SavedSegment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-segments"] });
      toast.success("Segment sauvegarde");
    },
    onError: () => {
      toast.error("Erreur lors de la sauvegarde du segment");
    },
  });
}

export function useUpdateSegment() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<SavedSegment> & { id: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("saved_segments")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-segments"] });
      toast.success("Segment mis a jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise a jour");
    },
  });
}

export function useDeleteSegment() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("saved_segments")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["saved-segments"] });
      toast.success("Segment supprime");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });
}

export function useApplySegment(segmentId: string | null) {
  const { segments } = useSavedSegments();
  const segment = segmentId
    ? (segments.find((s) => s.id === segmentId) ?? null)
    : null;
  return segment?.filters ?? null;
}
