"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────

export interface MiroBoard {
  id: string;
  title: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface MiroCard {
  id: string;
  board_id: string;
  x: number;
  y: number;
  width: number;
  title: string | null;
  content: string | null;
  card_type: string;
  style: Record<string, unknown>;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MiroSection {
  id: string;
  board_id: string;
  name: string;
  x: number;
  y: number;
  sort_order: number;
  created_at: string;
}

export interface MiroConnection {
  id: string;
  board_id: string;
  from_card_id: string;
  to_card_id: string;
  created_at: string;
}

// ─── Boards ──────────────────────────────────────────────────

export function useMiroBoards() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["miro-boards"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("miro_boards")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as MiroBoard[];
    },
  });
}

export function useCreateMiroBoard() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (title?: string) => {
      const { data, error } = await supabase
        .from("miro_boards")
        .insert({ title: title ?? "Nouveau tableau", created_by: user?.id } as never)
        .select()
        .single();

      if (error) throw error;
      return data as MiroBoard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["miro-boards"] });
      toast.success("Tableau créé");
    },
    onError: () => {
      toast.error("Erreur lors de la creation du tableau");
    },
  });
}

export function useUpdateMiroBoard() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title }: { id: string; title: string }) => {
      const { data, error } = await supabase
        .from("miro_boards")
        .update({ title, updated_at: new Date().toISOString() } as never)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as MiroBoard;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["miro-boards"] });
    },
  });
}

export function useDeleteMiroBoard() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("miro_boards")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["miro-boards"] });
      toast.success("Tableau supprime");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });
}

// ─── Cards ───────────────────────────────────────────────────

export function useMiroCards(boardId: string | undefined) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["miro-cards", boardId],
    enabled: !!user && !!boardId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("miro_cards")
        .select("*")
        .eq("board_id", boardId!)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as MiroCard[];
    },
  });
}

export function useCreateMiroCard() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (card: {
      board_id: string;
      x: number;
      y: number;
      width?: number;
      title?: string;
      content?: string;
      card_type?: string;
      style?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase
        .from("miro_cards")
        .insert(card as never)
        .select()
        .single();

      if (error) throw error;
      return data as MiroCard;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["miro-cards", data.board_id],
      });
    },
    onError: () => {
      toast.error("Erreur lors de la creation de la carte");
    },
  });
}

export function useUpdateMiroCard() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      boardId,
      ...updates
    }: {
      id: string;
      boardId: string;
      x?: number;
      y?: number;
      width?: number;
      title?: string | null;
      content?: string | null;
      card_type?: string;
      style?: Record<string, unknown>;
    }) => {
      const { data, error } = await supabase
        .from("miro_cards")
        .update({ ...updates, updated_at: new Date().toISOString() } as never)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { ...(data as MiroCard), boardId } as MiroCard & { boardId: string };
    },
    onMutate: async ({ id, boardId, ...updates }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ["miro-cards", boardId] });
      const previous = queryClient.getQueryData<MiroCard[]>([
        "miro-cards",
        boardId,
      ]);

      queryClient.setQueryData<MiroCard[]>(["miro-cards", boardId], (old) =>
        old?.map((c) => (c.id === id ? { ...c, ...updates } : c)),
      );

      return { previous, boardId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["miro-cards", context.boardId],
          context.previous,
        );
      }
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["miro-cards", vars.boardId] });
    },
  });
}

export function useDeleteMiroCard() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, boardId }: { id: string; boardId: string }) => {
      const { error } = await supabase.from("miro_cards").delete().eq("id", id);

      if (error) throw error;
      return { boardId };
    },
    onMutate: async ({ id, boardId }) => {
      await queryClient.cancelQueries({ queryKey: ["miro-cards", boardId] });
      const previous = queryClient.getQueryData<MiroCard[]>([
        "miro-cards",
        boardId,
      ]);

      queryClient.setQueryData<MiroCard[]>(["miro-cards", boardId], (old) =>
        old?.filter((c) => c.id !== id),
      );

      return { previous, boardId };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["miro-cards", context.boardId],
          context.previous,
        );
      }
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: ["miro-cards", vars.boardId] });
    },
  });
}

// ─── Sections ─────────────────────────────────────────────────

export function useMiroSections(boardId: string | undefined) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["miro-sections", boardId],
    enabled: !!user && !!boardId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("miro_sections")
        .select("*")
        .eq("board_id", boardId!)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as MiroSection[];
    },
  });
}

export function useCreateMiroSection() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (section: {
      board_id: string;
      name: string;
      x: number;
      y: number;
      sort_order?: number;
    }) => {
      const { data, error } = await supabase
        .from("miro_sections")
        .insert(section as never)
        .select()
        .single();

      if (error) throw error;
      return data as MiroSection;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["miro-sections", data.board_id],
      });
    },
    onError: () => {
      toast.error("Erreur lors de la creation de la section");
    },
  });
}

export function useUpdateMiroSection() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      boardId,
      ...updates
    }: {
      id: string;
      boardId: string;
      name?: string;
      x?: number;
      y?: number;
      sort_order?: number;
    }) => {
      const { data, error } = await supabase
        .from("miro_sections")
        .update(updates as never)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return { ...(data as MiroSection), boardId } as MiroSection & { boardId: string };
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["miro-sections", vars.boardId],
      });
    },
  });
}

export function useDeleteMiroSection() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, boardId }: { id: string; boardId: string }) => {
      const { error } = await supabase
        .from("miro_sections")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { boardId };
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["miro-sections", vars.boardId],
      });
    },
    onError: () => {
      toast.error("Erreur lors de la suppression de la section");
    },
  });
}

// ─── Connections ──────────────────────────────────────────────

export function useMiroConnections(boardId: string | undefined) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["miro-connections", boardId],
    enabled: !!user && !!boardId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("miro_connections")
        .select("*")
        .eq("board_id", boardId!);

      if (error) throw error;
      return data as MiroConnection[];
    },
  });
}

export function useCreateMiroConnection() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (connection: {
      board_id: string;
      from_card_id: string;
      to_card_id: string;
    }) => {
      const { data, error } = await supabase
        .from("miro_connections")
        .insert(connection as never)
        .select()
        .single();

      if (error) throw error;
      return data as MiroConnection;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["miro-connections", data.board_id],
      });
    },
    onError: () => {
      toast.error("Erreur lors de la creation du connecteur");
    },
  });
}

export function useDeleteMiroConnection() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, boardId }: { id: string; boardId: string }) => {
      const { error } = await supabase
        .from("miro_connections")
        .delete()
        .eq("id", id);

      if (error) throw error;
      return { boardId };
    },
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({
        queryKey: ["miro-connections", vars.boardId],
      });
    },
    onError: () => {
      toast.error("Erreur lors de la suppression du connecteur");
    },
  });
}
