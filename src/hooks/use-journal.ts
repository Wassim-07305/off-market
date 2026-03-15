"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useAwardXp } from "./use-auto-xp";
import { toast } from "sonner";
import type { JournalEntry, Mood } from "@/types/coaching";

export function useJournal(options?: { sharedOnly?: boolean }) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const awardXp = useAwardXp();

  const entriesQuery = useQuery({
    queryKey: ["journal", user?.id, options?.sharedOnly],
    queryFn: async () => {
      if (!user) return [];
      let query = supabase
        .from("journal_entries")
        .select("*")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });

      if (options?.sharedOnly) {
        query = query.eq("shared_with_coach" as never, true as never);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as JournalEntry[];
    },
    enabled: !!user,
  });

  const createEntry = useMutation({
    mutationFn: async (entry: {
      title: string;
      content: string;
      mood?: Mood;
      tags?: string[];
      is_private?: boolean;
      template?: string;
      media_urls?: string[];
      shared_with_coach?: boolean;
      prompt_id?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({ ...entry, author_id: user.id } as never)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as JournalEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal"] });
      toast.success("Entree ajoutee !");

      // Award XP for journal entry
      awardXp.mutate({ action: "journal_entry" });

      // Check streaks and award bonus XP if milestones reached
      checkStreakRewards(supabase, user!.id, awardXp);
    },
    onError: () => { toast.error("Erreur lors de la création de l'entrée"); },
  });

  const updateEntry = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<JournalEntry> & { id: string }) => {
      const { error } = await supabase
        .from("journal_entries")
        .update(updates as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal"] });
    },
    onError: () => { toast.error("Erreur lors de la mise à jour de l'entrée"); },
  });

  const deleteEntry = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("journal_entries")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal"] });
    },
    onError: () => { toast.error("Erreur lors de la suppression de l'entrée"); },
  });

  const toggleShare = useMutation({
    mutationFn: async ({
      id,
      shared,
    }: {
      id: string;
      shared: boolean;
    }) => {
      const { error } = await supabase
        .from("journal_entries")
        .update({ shared_with_coach: shared } as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["journal"] });
      toast.success(
        variables.shared
          ? "Entree partagee avec ton coach"
          : "Partage annule",
      );
    },
    onError: () => {
      toast.error("Erreur lors du partage");
    },
  });

  const uploadMedia = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Not authenticated");
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/journal/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("journal-media")
        .upload(path, file, { upsert: false });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("journal-media")
        .getPublicUrl(path);

      return urlData.publicUrl;
    },
    onError: () => {
      toast.error("Erreur lors de l'upload du media");
    },
  });

  return {
    entries: entriesQuery.data ?? [],
    isLoading: entriesQuery.isLoading,
    createEntry,
    updateEntry,
    deleteEntry,
    toggleShare,
    uploadMedia,
  };
}

// ─── Streak → XP reward helper ───────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function checkStreakRewards(supabase: any, userId: string, awardXp: any) {
  try {
    const { data: streak } = await supabase
      .from("streaks")
      .select("current_streak")
      .eq("profile_id", userId)
      .maybeSingle();
    if (!streak) return;

    const days = streak.current_streak;

    // 7-day streak bonus
    if (days === 7) {
      awardXp.mutate({
        action: "streak_7d",
        metadata: { streak_days: 7 },
      });
    }

    // 30-day streak bonus
    if (days === 30) {
      awardXp.mutate({
        action: "streak_30d",
        metadata: { streak_days: 30 },
      });
    }
  } catch {
    // Silently ignore streak check errors
  }
}

// ─── Coach view: entries shared by assigned clients ──────────────
export function useSharedJournalEntries() {
  const supabase = useSupabase();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["journal-shared", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("shared_with_coach" as never, true as never)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  return {
    entries: query.data ?? [],
    isLoading: query.isLoading,
  };
}
