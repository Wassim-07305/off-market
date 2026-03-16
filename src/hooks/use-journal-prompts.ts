"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useMemo, useState, useCallback } from "react";

export interface JournalPrompt {
  id: string;
  text: string;
  category: string;
  day_of_week: number | null;
  is_active: boolean;
  order_index: number;
  sort_order: number;
  created_at: string;
}

export type PromptCategory =
  | "gratitude"
  | "reflection"
  | "goal"
  | "mindset"
  | "business";

export const PROMPT_CATEGORIES: Record<
  PromptCategory,
  { label: string; color: string }
> = {
  gratitude: { label: "Gratitude", color: "bg-pink-500/10 text-pink-600" },
  reflection: {
    label: "Reflexion",
    color: "bg-blue-500/10 text-blue-600",
  },
  goal: { label: "Objectifs", color: "bg-emerald-500/10 text-emerald-600" },
  mindset: { label: "Mindset", color: "bg-purple-500/10 text-purple-600" },
  business: { label: "Business", color: "bg-orange-500/10 text-orange-600" },
};

export function useJournalPrompts() {
  const supabase = useSupabase();

  const promptsQuery = useQuery({
    queryKey: ["journal-prompts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_prompts")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as JournalPrompt[];
    },
  });

  return {
    prompts: promptsQuery.data ?? [],
    isLoading: promptsQuery.isLoading,
  };
}

/** Get today's daily prompt — based on day_of_week or rotation by day-of-year */
export function useDailyPrompt() {
  const { prompts, isLoading } = useJournalPrompts();

  const prompt = useMemo(() => {
    if (prompts.length === 0) return null;

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0=Sunday, 1=Monday, ...

    // First, try day-of-week specific prompt
    const dailyPrompt = prompts.find((p) => p.day_of_week === dayOfWeek);
    if (dailyPrompt) return dailyPrompt;

    // Fallback: rotate through non-daily prompts based on day-of-year
    const nonDaily = prompts.filter((p) => p.day_of_week === null);
    if (nonDaily.length === 0) return prompts[0];

    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24),
    );
    return nonDaily[dayOfYear % nonDaily.length];
  }, [prompts]);

  return { prompt, isLoading };
}

/** Alias for backward compatibility */
export function useTodayPrompt() {
  return useDailyPrompt();
}

/** Get prompts filtered by category */
export function usePromptsByCategory(category: PromptCategory) {
  const { prompts, isLoading } = useJournalPrompts();

  const filtered = useMemo(
    () => prompts.filter((p) => p.category === category),
    [prompts, category],
  );

  return { prompts: filtered, isLoading };
}

/** Get a random prompt with shuffle capability */
export function useRandomPrompt() {
  const { prompts, isLoading } = useJournalPrompts();
  const [index, setIndex] = useState<number | null>(null);

  const prompt = useMemo(() => {
    if (prompts.length === 0) return null;
    if (index !== null && index < prompts.length) return prompts[index];
    // Initial random
    return prompts[Math.floor(Math.random() * prompts.length)];
  }, [prompts, index]);

  const shuffle = useCallback(() => {
    if (prompts.length <= 1) return;
    let newIdx: number;
    do {
      newIdx = Math.floor(Math.random() * prompts.length);
    } while (prompts[newIdx]?.id === prompt?.id);
    setIndex(newIdx);
  }, [prompts, prompt]);

  return { prompt, shuffle, isLoading };
}
