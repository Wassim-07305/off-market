"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import { useMemo } from "react";

// ─── Types ───────────────────────────────────────────────────

export type ContentPlatform = "instagram" | "linkedin" | "tiktok";
export type ContentStatus = "draft" | "scheduled" | "published" | "archived";

export interface SocialContentItem {
  id: string;
  title: string;
  caption: string | null;
  media_urls: string[];
  platform: ContentPlatform;
  status: ContentStatus;
  scheduled_at: string | null;
  published_at: string | null;
  created_by: string;
  tags: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContentFilters {
  status?: ContentStatus;
  platform?: ContentPlatform;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreateContentInput {
  title: string;
  caption?: string;
  media_urls?: string[];
  platform: ContentPlatform;
  status?: ContentStatus;
  scheduled_at?: string;
  tags?: string[];
  notes?: string;
}

export interface UpdateContentInput {
  id: string;
  title?: string;
  caption?: string;
  media_urls?: string[];
  platform?: ContentPlatform;
  status?: ContentStatus;
  scheduled_at?: string | null;
  published_at?: string | null;
  tags?: string[];
  notes?: string;
}

// ─── List content with filters ───────────────────────────────

export function useSocialContent(filters?: ContentFilters) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["social-content", filters],
    enabled: !!user,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let query = (supabase as any)
        .from("social_content")
        .select("*")
        .order("created_at", { ascending: false });

      if (filters?.status) {
        query = query.eq("status", filters.status);
      }
      if (filters?.platform) {
        query = query.eq("platform", filters.platform);
      }
      if (filters?.dateFrom) {
        query = query.gte("created_at", filters.dateFrom);
      }
      if (filters?.dateTo) {
        query = query.lte("created_at", filters.dateTo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as SocialContentItem[];
    },
  });
}

// ─── Create content ──────────────────────────────────────────

export function useCreateContent() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateContentInput) => {
      if (!user) throw new Error("Non authentifie");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("social_content")
        .insert({
          title: input.title,
          caption: input.caption || null,
          media_urls: input.media_urls || [],
          platform: input.platform,
          status: input.status || "draft",
          scheduled_at: input.scheduled_at || null,
          tags: input.tags || [],
          notes: input.notes || null,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data as SocialContentItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-content"] });
      toast.success("Contenu créé avec succès");
    },
    onError: () => toast.error("Erreur lors de la creation du contenu"),
  });
}

// ─── Update content ──────────────────────────────────────────

export function useUpdateContent() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateContentInput) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("social_content")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as SocialContentItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-content"] });
      toast.success("Contenu mis à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });
}

// ─── Delete content ──────────────────────────────────────────

export function useDeleteContent() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("social_content")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-content"] });
      toast.success("Contenu supprime");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}

// ─── Schedule content ────────────────────────────────────────

export function useScheduleContent() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, date }: { id: string; date: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("social_content")
        .update({
          status: "scheduled",
          scheduled_at: date,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as SocialContentItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-content"] });
      toast.success("Contenu planifie");
    },
    onError: () => toast.error("Erreur lors de la planification"),
  });
}

// ─── Publish content ─────────────────────────────────────────

export function usePublishContent() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("social_content")
        .update({
          status: "published",
          published_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as SocialContentItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-content"] });
      toast.success("Contenu publie");
    },
    onError: () => toast.error("Erreur lors de la publication"),
  });
}

// ─── Content Calendar (grouped by day) ───────────────────────

export function useContentCalendar(month: number, year: number) {
  const supabase = useSupabase();
  const { user } = useAuth();

  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endMonth = month === 12 ? 1 : month + 1;
  const endYear = month === 12 ? year + 1 : year;
  const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

  return useQuery({
    queryKey: ["social-content-calendar", month, year],
    enabled: !!user,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("social_content")
        .select("*")
        .or(
          `and(scheduled_at.gte.${startDate},scheduled_at.lt.${endDate}),and(published_at.gte.${startDate},published_at.lt.${endDate})`,
        )
        .order("scheduled_at", { ascending: true });

      if (error) throw error;
      const items = (data ?? []) as SocialContentItem[];

      // Group by day
      const grouped: Record<string, SocialContentItem[]> = {};
      for (const item of items) {
        const dateStr =
          item.scheduled_at?.slice(0, 10) ||
          item.published_at?.slice(0, 10) ||
          item.created_at.slice(0, 10);
        if (!grouped[dateStr]) grouped[dateStr] = [];
        grouped[dateStr].push(item);
      }
      return grouped;
    },
  });
}

// ─── Content Stats ───────────────────────────────────────────

export function useContentStats() {
  const { data: allContent } = useSocialContent();

  return useMemo(() => {
    const items = allContent ?? [];
    return {
      total: items.length,
      draft: items.filter((i) => i.status === "draft").length,
      scheduled: items.filter((i) => i.status === "scheduled").length,
      published: items.filter((i) => i.status === "published").length,
      archived: items.filter((i) => i.status === "archived").length,
      byPlatform: {
        instagram: items.filter((i) => i.platform === "instagram").length,
        linkedin: items.filter((i) => i.platform === "linkedin").length,
        tiktok: items.filter((i) => i.platform === "tiktok").length,
      },
    };
  }, [allContent]);
}
