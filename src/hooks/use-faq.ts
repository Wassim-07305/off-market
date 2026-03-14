"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  occurrence_count: number;
  auto_answer_enabled: boolean;
  source_message_id: string | null;
  created_by: string;
  last_asked_at: string;
  created_at: string;
  updated_at: string;
}

export interface FaqQuestionLog {
  id: string;
  faq_entry_id: string;
  asked_by: string;
  channel_id: string | null;
  message_id: string | null;
  similarity_score: number;
  created_at: string;
}

export interface FaqEntryWithLogs extends FaqEntry {
  faq_question_logs: FaqQuestionLog[];
}

// ─── List all FAQ entries ───

export function useFaqEntries(category?: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["faq-entries", category],
    queryFn: async () => {
      let query = supabase
        .from("faq_entries")
        .select("*")
        .order("occurrence_count", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as FaqEntry[];
    },
  });
}

// ─── Single FAQ entry with logs ───

export function useFaqEntry(id: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["faq-entry", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faq_entries")
        .select("*, faq_question_logs(*)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data as FaqEntryWithLogs;
    },
    enabled: !!id,
  });
}

// ─── Create FAQ entry ───

export function useCreateFaqEntry() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      question: string;
      answer: string;
      category?: string;
      source_message_id?: string;
      auto_answer_enabled?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("faq_entries")
        .insert({
          question: input.question,
          answer: input.answer,
          category: input.category ?? "general",
          source_message_id: input.source_message_id ?? null,
          auto_answer_enabled: input.auto_answer_enabled ?? false,
          created_by: user?.id ?? "",
          occurrence_count: 1,
          last_asked_at: new Date().toISOString(),
        })
        .select()
        .single();
      if (error) throw error;
      return data as FaqEntry;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq-entries"] });
      toast.success("Question FAQ ajoutee");
    },
    onError: () => {
      toast.error("Erreur lors de l'ajout de la question FAQ");
    },
  });
}

// ─── Update FAQ entry ───

export function useUpdateFaqEntry() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<FaqEntry> & { id: string }) => {
      const { data, error } = await supabase
        .from("faq_entries")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as FaqEntry;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["faq-entries"] });
      queryClient.invalidateQueries({ queryKey: ["faq-entry", data.id] });
      toast.success("Question FAQ mise a jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise a jour");
    },
  });
}

// ─── Delete FAQ entry ───

export function useDeleteFaqEntry() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("faq_entries")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq-entries"] });
      toast.success("Question FAQ supprimee");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });
}

// ─── Log a question occurrence ───

export function useLogFaqQuestion() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      faq_entry_id: string;
      asked_by: string;
      channel_id?: string;
      message_id?: string;
      similarity_score?: number;
    }) => {
      // Insert log
      const { error: logError } = await supabase
        .from("faq_question_logs")
        .insert({
          faq_entry_id: input.faq_entry_id,
          asked_by: input.asked_by,
          channel_id: input.channel_id ?? null,
          message_id: input.message_id ?? null,
          similarity_score: input.similarity_score ?? 1.0,
        });
      if (logError) throw logError;

      // Increment counter and update last_asked_at
      const { data: entry, error: fetchError } = await supabase
        .from("faq_entries")
        .select("occurrence_count")
        .eq("id", input.faq_entry_id)
        .single();
      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from("faq_entries")
        .update({
          occurrence_count: (entry.occurrence_count ?? 0) + 1,
          last_asked_at: new Date().toISOString(),
        })
        .eq("id", input.faq_entry_id);
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faq-entries"] });
      queryClient.invalidateQueries({ queryKey: ["faq-alerts"] });
    },
  });
}

// ─── FAQ alerts (5+ occurrences in last 7 days) ───

export function useFaqAlerts() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["faq-alerts"],
    queryFn: async () => {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Get all entries
      const { data: entries, error: entriesError } = await supabase
        .from("faq_entries")
        .select("*")
        .order("occurrence_count", { ascending: false });
      if (entriesError) throw entriesError;

      // Get logs from last 7 days
      const { data: recentLogs, error: logsError } = await supabase
        .from("faq_question_logs")
        .select("faq_entry_id")
        .gte("created_at", sevenDaysAgo.toISOString());
      if (logsError) throw logsError;

      // Count occurrences per entry in last 7 days
      const weeklyCount: Record<string, number> = {};
      for (const log of recentLogs ?? []) {
        weeklyCount[log.faq_entry_id] =
          (weeklyCount[log.faq_entry_id] ?? 0) + 1;
      }

      // Filter entries with 5+ in last week
      return (entries ?? [])
        .filter((e) => (weeklyCount[e.id] ?? 0) >= 5)
        .map((e) => ({
          ...e,
          weekly_count: weeklyCount[e.id] ?? 0,
        })) as (FaqEntry & { weekly_count: number })[];
    },
    refetchInterval: 60000, // Refresh every minute
  });
}

// ─── Search FAQ (text search) ───

export function useSearchFaq(query: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["faq-search", query],
    queryFn: async () => {
      if (!query || query.length < 3) return [];

      const { data, error } = await supabase
        .from("faq_entries")
        .select("*")
        .or(`question.ilike.%${query}%,answer.ilike.%${query}%`)
        .order("occurrence_count", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []) as FaqEntry[];
    },
    enabled: query.length >= 3,
  });
}

// ─── FAQ categories (distinct) ───

export function useFaqCategories() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["faq-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("faq_entries")
        .select("category")
        .order("category");
      if (error) throw error;
      const unique = [...new Set((data ?? []).map((d) => d.category))];
      return unique;
    },
  });
}
