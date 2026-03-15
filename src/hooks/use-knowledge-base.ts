"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type { KnowledgeBasePage, KBCategory } from "@/types/database";

// ─── Liste des pages (filtrables par parent) ─────────────────────

export function useKnowledgeBasePages(parentId?: string | null) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["knowledge-base", "pages", parentId ?? "root"],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from("knowledge_base_entries")
        .select("*, creator:profiles!created_by(id, full_name, avatar_url)")
        .order("sort_order", { ascending: true })
        .order("title", { ascending: true });

      if (parentId) {
        query = query.eq("parent_id", parentId);
      } else {
        query = query.is("parent_id", null);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as KnowledgeBasePage[];
    },
  });
}

// ─── Toutes les pages (pour l'arborescence) ──────────────────────

export function useAllKnowledgeBasePages() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["knowledge-base", "all-pages"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge_base_entries")
        .select("*, creator:profiles!created_by(id, full_name, avatar_url)")
        .order("sort_order", { ascending: true })
        .order("title", { ascending: true });

      if (error) throw error;
      return data as KnowledgeBasePage[];
    },
  });
}

// ─── Page individuelle ───────────────────────────────────────────

export function useKnowledgeBasePage(id: string | undefined) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["knowledge-base", "page", id],
    enabled: !!user && !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge_base_entries")
        .select("*, creator:profiles!created_by(id, full_name, avatar_url)")
        .eq("id", id!)
        .single();

      if (error) throw error;
      return data as KnowledgeBasePage;
    },
  });
}

// ─── Creer une page ──────────────────────────────────────────────

interface CreatePageInput {
  title: string;
  content?: string;
  category?: KBCategory;
  parent_id?: string | null;
  icon?: string | null;
  cover_image_url?: string | null;
  is_template?: boolean;
}

export function useCreatePage() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePageInput) => {
      if (!user) throw new Error("Non authentifie");

      const insertPayload = {
        title: input.title,
        content: input.content ?? "",
        category: input.category ?? "general",
        parent_id: input.parent_id ?? null,
        icon: input.icon ?? null,
        cover_image_url: input.cover_image_url ?? null,
        is_template: input.is_template ?? false,
        source_type: "manual",
        created_by: user.id,
      };

      const { data, error } = await supabase
        .from("knowledge_base_entries")
        .insert(insertPayload as never)
        .select("*, creator:profiles!created_by(id, full_name, avatar_url)")
        .single();

      if (error) throw error;
      return data as KnowledgeBasePage;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
      toast.success("Page creee");
    },
    onError: () => toast.error("Erreur lors de la creation"),
  });
}

// ─── Mettre a jour une page ──────────────────────────────────────

interface UpdatePageInput {
  id: string;
  title?: string;
  content?: string;
  category?: KBCategory;
  parent_id?: string | null;
  icon?: string | null;
  cover_image_url?: string | null;
  is_template?: boolean;
  is_published?: boolean;
  sort_order?: number;
}

export function useUpdatePage() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdatePageInput) => {
      const updatePayload = {
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("knowledge_base_entries")
        .update(updatePayload as never)
        .eq("id", id)
        .select("*, creator:profiles!created_by(id, full_name, avatar_url)")
        .single();

      if (error) throw error;
      return data as KnowledgeBasePage;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
      // Pas de toast pour la sauvegarde auto
      if (variables.title !== undefined && variables.content === undefined) {
        toast.success("Page mise a jour");
      }
    },
    onError: () => toast.error("Erreur lors de la sauvegarde"),
  });
}

// ─── Supprimer une page ──────────────────────────────────────────

export function useDeletePage() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("knowledge_base_entries")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge-base"] });
      toast.success("Page supprimee");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });
}

// ─── Recherche full-text ─────────────────────────────────────────

export function useSearchPages(query: string) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["knowledge-base", "search", query],
    enabled: !!user && query.trim().length >= 2,
    queryFn: async () => {
      // Recherche via ilike sur titre + contenu
      const q = `%${query.trim()}%`;
      const { data, error } = await supabase
        .from("knowledge_base_entries")
        .select("*, creator:profiles!created_by(id, full_name, avatar_url)")
        .or(`title.ilike.${q},content.ilike.${q}`)
        .order("updated_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      return data as KnowledgeBasePage[];
    },
  });
}

// ─── Breadcrumb (ancetres d'une page) ────────────────────────────

export function usePageBreadcrumb(
  pageId: string | undefined,
  allPages: KnowledgeBasePage[] | undefined,
) {
  if (!pageId || !allPages) return [];

  const breadcrumb: KnowledgeBasePage[] = [];
  let current = allPages.find((p) => p.id === pageId);

  while (current) {
    breadcrumb.unshift(current);
    if (current.parent_id) {
      current = allPages.find((p) => p.id === current!.parent_id);
    } else {
      break;
    }
  }

  return breadcrumb;
}

// ─── Construire l'arbre hierarchique ─────────────────────────────

export function buildPageTree(pages: KnowledgeBasePage[]): KnowledgeBasePage[] {
  const map = new Map<string, KnowledgeBasePage>();
  const roots: KnowledgeBasePage[] = [];

  // Creer une copie avec children vide
  for (const page of pages) {
    map.set(page.id, { ...page, children: [] });
  }

  // Relier parents et enfants
  for (const page of map.values()) {
    if (page.parent_id && map.has(page.parent_id)) {
      map.get(page.parent_id)!.children!.push(page);
    } else {
      roots.push(page);
    }
  }

  return roots;
}
