"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type { Reward, RewardRedemption } from "@/types/gamification";

// ─── Active rewards catalog ─────────
export function useRewards() {
  const supabase = useSupabase();
  const { user } = useAuth();

  const rewardsQuery = useQuery({
    queryKey: ["rewards"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .eq("is_active", true)
        .order("cost_xp", { ascending: true });
      if (error) throw error;
      return data as Reward[];
    },
  });

  return {
    rewards: rewardsQuery.data ?? [],
    isLoading: rewardsQuery.isLoading,
  };
}

// ─── Redeem a reward via RPC ────────
export function useRedeemReward() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rewardId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase.rpc("redeem_reward", {
        p_user_id: user.id,
        p_reward_id: rewardId,
      });
      if (error) throw error;
      return data as string;
    },
    onSuccess: () => {
      toast.success("Recompense echangee avec succes !");
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
      queryClient.invalidateQueries({ queryKey: ["my-redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["xp"] });
      queryClient.invalidateQueries({ queryKey: ["xp-balance"] });
    },
    onError: (error: Error) => {
      const msg = error.message;
      if (msg.includes("XP insuffisant")) {
        toast.error("XP insuffisant pour cette recompense");
      } else if (msg.includes("Rupture de stock")) {
        toast.error("Cette recompense est en rupture de stock");
      } else {
        toast.error("Erreur lors de l'echange");
      }
    },
  });
}

// ─── User's past redemptions ────────
export function useMyRedemptions() {
  const supabase = useSupabase();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["my-redemptions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("reward_redemptions")
        .select("*, reward:rewards(*)")
        .eq("user_id", user.id)
        .order("redeemed_at", { ascending: false });
      if (error) throw error;
      return data as RewardRedemption[];
    },
  });

  return {
    redemptions: query.data ?? [],
    isLoading: query.isLoading,
  };
}

// ─── XP balance (total earned minus spent) ──
export function useXpBalance() {
  const supabase = useSupabase();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["xp-balance", user?.id],
    enabled: !!user,
    queryFn: async () => {
      if (!user) return 0;

      // Total earned XP
      const { data: txData, error: txError } = await supabase
        .from("xp_transactions")
        .select("xp_amount")
        .eq("profile_id", user.id);
      if (txError) throw txError;
      const totalEarned = (txData ?? []).reduce(
        (sum, t) => sum + t.xp_amount,
        0,
      );

      // Total spent XP (non-cancelled redemptions)
      const { data: rdData, error: rdError } = await supabase
        .from("reward_redemptions")
        .select("xp_spent, status")
        .eq("user_id", user.id)
        .neq("status", "cancelled");
      if (rdError) throw rdError;
      const totalSpent = (rdData ?? []).reduce(
        (sum, r) => sum + r.xp_spent,
        0,
      );

      return totalEarned - totalSpent;
    },
  });

  return {
    balance: query.data ?? 0,
    isLoading: query.isLoading,
  };
}

// ─── Admin: all rewards (including inactive) ──
export function useManageRewards() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const allRewardsQuery = useQuery({
    queryKey: ["admin-rewards"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rewards")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Reward[];
    },
  });

  const createReward = useMutation({
    mutationFn: async (
      reward: Omit<Reward, "id" | "created_at" | "created_by" | "is_active">,
    ) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("rewards")
        .insert({ ...reward, created_by: user.id })
        .select()
        .single();
      if (error) throw error;
      return data as Reward;
    },
    onSuccess: () => {
      toast.success("Recompense creee");
      queryClient.invalidateQueries({ queryKey: ["admin-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    },
    onError: () => toast.error("Erreur lors de la creation"),
  });

  const updateReward = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<Reward> & { id: string }) => {
      const { error } = await supabase
        .from("rewards")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Recompense mise a jour");
      queryClient.invalidateQueries({ queryKey: ["admin-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    },
    onError: () => toast.error("Erreur lors de la mise a jour"),
  });

  const toggleActive = useMutation({
    mutationFn: async ({
      id,
      is_active,
    }: {
      id: string;
      is_active: boolean;
    }) => {
      const { error } = await supabase
        .from("rewards")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rewards"] });
      queryClient.invalidateQueries({ queryKey: ["rewards"] });
    },
    onError: () => toast.error("Erreur lors de la mise a jour"),
  });

  return {
    rewards: allRewardsQuery.data ?? [],
    isLoading: allRewardsQuery.isLoading,
    createReward,
    updateReward,
    toggleActive,
  };
}

// ─── Admin: pending redemptions ─────
export function usePendingRedemptions() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["pending-redemptions"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reward_redemptions")
        .select(
          "*, reward:rewards(*), profile:profiles!reward_redemptions_user_id_fkey(id, full_name, avatar_url)",
        )
        .order("redeemed_at", { ascending: false });
      if (error) throw error;
      return data as RewardRedemption[];
    },
  });

  const fulfillRedemption = useMutation({
    mutationFn: async (redemptionId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("reward_redemptions")
        .update({
          status: "fulfilled",
          fulfilled_at: new Date().toISOString(),
          fulfilled_by: user.id,
        })
        .eq("id", redemptionId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Recompense marquee comme remplie");
      queryClient.invalidateQueries({ queryKey: ["pending-redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["my-redemptions"] });
    },
    onError: () => toast.error("Erreur lors de la mise a jour"),
  });

  const cancelRedemption = useMutation({
    mutationFn: async (redemptionId: string) => {
      const { error } = await supabase
        .from("reward_redemptions")
        .update({ status: "cancelled" })
        .eq("id", redemptionId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Echange annule");
      queryClient.invalidateQueries({ queryKey: ["pending-redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["my-redemptions"] });
      queryClient.invalidateQueries({ queryKey: ["xp-balance"] });
    },
    onError: () => toast.error("Erreur lors de l'annulation"),
  });

  return {
    redemptions: query.data ?? [],
    isLoading: query.isLoading,
    fulfillRedemption,
    cancelRedemption,
  };
}
