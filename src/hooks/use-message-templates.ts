"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

export interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  category: string;
  shortcut: string | null;
  is_shared: boolean;
  created_by: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

// ─── List all templates ───

export function useMessageTemplates(category?: string) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["message-templates", category],
    queryFn: async () => {
      let query = supabase
        .from("message_templates")
        .select("*")
        .order("usage_count", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as MessageTemplate[];
    },
    enabled: !!user,
  });
}

// ─── Search templates (imperative, for autocomplete) ───

export function useSearchTemplates() {
  const supabase = useSupabase();

  return async (query: string): Promise<MessageTemplate[]> => {
    if (!query) return [];

    // Search by shortcut (e.g. /welcome) or by content
    if (query.startsWith("/")) {
      const { data } = await supabase
        .from("message_templates")
        .select("*")
        .ilike("shortcut", `${query}%`)
        .order("usage_count", { ascending: false })
        .limit(5);
      return (data ?? []) as MessageTemplate[];
    }

    const { data } = await supabase
      .from("message_templates")
      .select("*")
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order("usage_count", { ascending: false })
      .limit(5);
    return (data ?? []) as MessageTemplate[];
  };
}

// ─── Create template ───

export function useCreateTemplate() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (template: {
      title: string;
      content: string;
      category?: string;
      shortcut?: string;
      is_shared?: boolean;
    }) => {
      const { data, error } = await (supabase as any)
        .from("message_templates")
        .insert({
          title: template.title,
          content: template.content,
          category: template.category ?? "general",
          shortcut: template.shortcut || null,
          is_shared: template.is_shared ?? false,
          created_by: user!.id,
        })
        .select()
        .single();
      if (error) throw error;
      return data as MessageTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-templates"] });
      toast.success("Template cree avec succes");
    },
    onError: () => toast.error("Erreur lors de la creation du template"),
  });
}

// ─── Update template ───

export function useUpdateTemplate() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<MessageTemplate> & { id: string }) => {
      const { error } = await (supabase as any)
        .from("message_templates")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-templates"] });
      toast.success("Template mis a jour");
    },
    onError: () => toast.error("Erreur lors de la mise a jour"),
  });
}

// ─── Delete template ───

export function useDeleteTemplate() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("message_templates")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-templates"] });
      toast.success("Template supprime");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}

// ─── Increment usage count ───

export function useIncrementTemplateUsage() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Use RPC for atomic increment
      const { error } = await (supabase as any).rpc("increment_template_usage", {
        template_id: id,
      });
      // Fallback if RPC doesn't exist yet
      if (error) {
        const { data: tmpl } = await (supabase as any)
          .from("message_templates")
          .select("usage_count")
          .eq("id", id)
          .single();
        if (tmpl) {
          await (supabase as any)
            .from("message_templates")
            .update({ usage_count: ((tmpl as any).usage_count ?? 0) + 1 })
            .eq("id", id);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["message-templates"] });
    },
  });
}
