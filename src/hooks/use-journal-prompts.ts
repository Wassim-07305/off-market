"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";

export interface JournalPrompt {
  id: string;
  text: string;
  category: string;
  is_active: boolean;
  order_index: number;
  created_at: string;
}

export function useJournalPrompts() {
  const supabase = useSupabase();

  const promptsQuery = useQuery({
    queryKey: ["journal-prompts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_prompts")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });
      if (error) throw error;
      return data as JournalPrompt[];
    },
  });

  return {
    prompts: promptsQuery.data ?? [],
    isLoading: promptsQuery.isLoading,
  };
}

export function useTodayPrompt() {
  const { prompts, isLoading } = useJournalPrompts();

  // Rotate through prompts based on day-of-year
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      (1000 * 60 * 60 * 24),
  );
  const prompt =
    prompts.length > 0 ? prompts[dayOfYear % prompts.length] : null;

  return { prompt, isLoading };
}
