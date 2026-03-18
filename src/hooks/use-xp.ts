"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type {
  XpTransaction,
  XpConfig,
  LevelConfig,
  UserXpSummary,
  UserBadge,
} from "@/types/gamification";

export function useXp() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch all XP for current user
  const xpQuery = useQuery({
    queryKey: ["xp", user?.id],
    staleTime: 5 * 60 * 1000, // 5 min — gamification, mis a jour par mutations
    queryFn: async () => {
      if (!user) return { transactions: [], total: 0 };
      const { data, error } = await supabase
        .from("xp_transactions")
        .select("*")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const transactions = data as XpTransaction[];
      const total = transactions.reduce((sum, t) => sum + t.xp_amount, 0);
      return { transactions, total };
    },
    enabled: !!user,
  });

  // Fetch levels config
  const levelsQuery = useQuery({
    queryKey: ["level-config"],
    enabled: !!user,
    staleTime: Infinity, // Config de niveaux — ne change jamais en cours de session
    queryFn: async () => {
      const { data, error } = await supabase
        .from("level_config")
        .select("*")
        .order("min_xp", { ascending: true });
      if (error) throw error;
      return data as LevelConfig[];
    },
  });

  // Fetch user badges
  const badgesQuery = useQuery({
    queryKey: ["user-badges", user?.id],
    staleTime: 5 * 60 * 1000, // 5 min — badges mis a jour par mutations XP
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_badges")
        .select("*, badge:badges(*)")
        .eq("profile_id", user.id)
        .order("earned_at", { ascending: false });
      if (error) throw error;
      return data as UserBadge[];
    },
    enabled: !!user,
  });

  // Fetch rank from leaderboard view
  const rankQuery = useQuery({
    queryKey: ["my-rank", user?.id],
    staleTime: 5 * 60 * 1000, // 5 min — rang mis a jour par mutations XP
    queryFn: async () => {
      if (!user) return 0;
      const { data, error } = await supabase
        .from("leaderboard")
        .select("rank")
        .eq("profile_id", user.id)
        .single();
      if (error) return 0;
      return (data as { rank: number }).rank;
    },
    enabled: !!user,
  });

  // Award XP via the DB function
  const awardXp = useMutation({
    mutationFn: async ({
      action,
      metadata,
    }: {
      action: string;
      metadata?: Record<string, unknown>;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.rpc("award_xp", {
        p_profile_id: user.id,
        p_action: action,
        p_metadata: metadata ?? {},
      });
      if (error) throw error;
      return data as number;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["xp"] });
      queryClient.invalidateQueries({ queryKey: ["my-rank"] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
    onError: () => {
      toast.error("Erreur lors de l'attribution des XP");
    },
  });

  // Compute summary
  const levels = levelsQuery.data ?? [];
  const totalXp = xpQuery.data?.total ?? 0;
  const currentLevel =
    [...levels].reverse().find((l) => totalXp >= l.min_xp) ?? levels[0];
  const nextLevel = levels.find((l) => l.min_xp > totalXp) ?? null;
  const progressToNext =
    nextLevel && currentLevel
      ? Math.min(
          Math.round(
            ((totalXp - currentLevel.min_xp) /
              (nextLevel.min_xp - currentLevel.min_xp)) *
              100,
          ),
          100,
        )
      : 100;

  const summary: UserXpSummary = {
    totalXp,
    level: currentLevel ?? {
      level: 1,
      name: "Debutant",
      min_xp: 0,
      icon: "🌱",
      color: "#71717A",
    },
    nextLevel,
    progressToNext,
    badges: badgesQuery.data ?? [],
    rank: rankQuery.data ?? 0,
  };

  return {
    summary,
    transactions: xpQuery.data?.transactions ?? [],
    isLoading: xpQuery.isLoading || levelsQuery.isLoading,
    awardXp,
  };
}

export function useXpConfig() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const configQuery = useQuery({
    queryKey: ["xp-config"],
    enabled: !!user,
    staleTime: Infinity, // Config XP — ne change jamais sauf mutation admin
    queryFn: async () => {
      const { data, error } = await supabase
        .from("xp_config")
        .select("*")
        .order("xp_amount", { ascending: false });
      if (error) throw error;
      return data as XpConfig[];
    },
  });

  const updateConfig = useMutation({
    mutationFn: async ({
      id,
      xp_amount,
      is_active,
    }: {
      id: string;
      xp_amount?: number;
      is_active?: boolean;
    }) => {
      const updates: Record<string, unknown> = {};
      if (xp_amount !== undefined) updates.xp_amount = xp_amount;
      if (is_active !== undefined) updates.is_active = is_active;
      const { error } = await supabase
        .from("xp_config")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["xp-config"] });
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour de la configuration XP");
    },
  });

  return {
    config: configQuery.data ?? [],
    isLoading: configQuery.isLoading,
    updateConfig,
  };
}
