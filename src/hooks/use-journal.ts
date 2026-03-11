"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type { JournalEntry, Mood } from "@/types/coaching";

export function useJournal() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const entriesQuery = useQuery({
    queryKey: ["journal", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });
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
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("journal_entries")
        .insert({ ...entry, author_id: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as JournalEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal"] });
    },
  });

  const updateEntry = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<JournalEntry> & { id: string }) => {
      const { error } = await supabase
        .from("journal_entries")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal"] });
    },
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
  });

  return {
    entries: entriesQuery.data ?? [],
    isLoading: entriesQuery.isLoading,
    createEntry,
    updateEntry,
    deleteEntry,
  };
}
