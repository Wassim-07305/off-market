"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type { Badge, BadgeCategory, BadgeRarity } from "@/types/gamification";

// ─── All badges (including inactive) for admin ─────────
export function useAdminBadges() {
  const supabase = useSupabase();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["admin-badges"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .order("category", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Badge[];
    },
  });

  return {
    badges: query.data ?? [],
    isLoading: query.isLoading,
  };
}

// ─── Badge earners (who earned a specific badge) ────────
export function useBadgeEarners(badgeId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["badge-earners", badgeId],
    enabled: !!badgeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_badges")
        .select("*, profile:profiles(id, full_name, avatar_url)")
        .eq("badge_id", badgeId!)
        .order("earned_at", { ascending: false });
      if (error) throw error;
      return data as Array<{
        id: string;
        profile_id: string;
        badge_id: string;
        earned_at: string;
        profile: {
          id: string;
          full_name: string;
          avatar_url: string | null;
        } | null;
      }>;
    },
  });
}

// ─── CRUD mutations ─────────────────────────────────────
export function useCreateBadge() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (badge: {
      name: string;
      description: string | null;
      icon: string | null;
      category: BadgeCategory;
      rarity: BadgeRarity;
      condition: Record<string, unknown>;
      xp_reward: number;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("badges")
        .insert(badge)
        .select()
        .single();
      if (error) throw error;
      return data as Badge;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-badges"] });
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      toast.success("Badge créé avec succès");
    },
    onError: () => {
      toast.error("Erreur lors de la creation du badge");
    },
  });
}

export function useUpdateBadge() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Badge> & { id: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("badges")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-badges"] });
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      toast.success("Badge mis à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du badge");
    },
  });
}

export function useToggleBadgeActive() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      is_active,
    }: {
      id: string;
      is_active: boolean;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("badges")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["admin-badges"] });
      queryClient.invalidateQueries({ queryKey: ["badges"] });
      toast.success(variables.is_active ? "Badge active" : "Badge desactive");
    },
    onError: () => {
      toast.error("Erreur lors du changement de statut");
    },
  });
}
