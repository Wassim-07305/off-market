"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

// ─── Follow status for a specific user ─────────────────────

export function useFollowStatus(targetId: string | null) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isFollowingQuery = useQuery({
    queryKey: ["follow-status", user?.id, targetId],
    enabled: !!user && !!targetId && user.id !== targetId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_follows")
        .select("id")
        .eq("follower_id", user!.id)
        .eq("following_id", targetId!)
        .maybeSingle();
      if (error) throw error;
      return !!data;
    },
  });

  const follow = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("user_follows")
        .insert({ follower_id: user!.id, following_id: targetId! } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["follow-status", user?.id, targetId],
      });
      queryClient.invalidateQueries({ queryKey: ["followers", targetId] });
      queryClient.invalidateQueries({ queryKey: ["following", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["follow-counts", targetId] });
      toast.success("Abonnement ajoute");
    },
    onError: () => toast.error("Erreur lors de l'abonnement"),
  });

  const unfollow = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", user!.id)
        .eq("following_id", targetId!);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["follow-status", user?.id, targetId],
      });
      queryClient.invalidateQueries({ queryKey: ["followers", targetId] });
      queryClient.invalidateQueries({ queryKey: ["following", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["follow-counts", targetId] });
      toast.success("Abonnement retire");
    },
    onError: () => toast.error("Erreur lors du desabonnement"),
  });

  return {
    isFollowing: isFollowingQuery.data ?? false,
    isLoading: isFollowingQuery.isLoading,
    follow,
    unfollow,
  };
}

// ─── Follow counts ──────────────────────────────────────────

export function useFollowCounts(userId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["follow-counts", userId],
    enabled: !!userId,
    queryFn: async () => {
      const [followers, following] = await Promise.all([
        supabase
          .from("user_follows")
          .select("id", { count: "exact", head: true })
          .eq("following_id", userId!),
        supabase
          .from("user_follows")
          .select("id", { count: "exact", head: true })
          .eq("follower_id", userId!),
      ]);

      return {
        followersCount: followers.count ?? 0,
        followingCount: following.count ?? 0,
      };
    },
  });
}

// ─── Followers list ─────────────────────────────────────────

export function useFollowers(userId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["followers", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_follows")
        .select(
          "follower_id, created_at, follower:profiles!user_follows_follower_id_fkey(id, full_name, avatar_url, role, bio)",
        )
        .eq("following_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as {
        follower_id: string;
        created_at: string;
        follower: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          role: string;
          bio: string | null;
        } | null;
      }[];
    },
  });
}

// ─── Following list ─────────────────────────────────────────

export function useFollowing(userId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["following", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_follows")
        .select(
          "following_id, created_at, following:profiles!user_follows_following_id_fkey(id, full_name, avatar_url, role, bio)",
        )
        .eq("follower_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as {
        following_id: string;
        created_at: string;
        following: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          role: string;
          bio: string | null;
        } | null;
      }[];
    },
  });
}
