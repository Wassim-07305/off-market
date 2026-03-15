"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type { FeedPost, PostType } from "@/types/feed";

// ─── Types ───────────────────────────────────────────────

export interface Community {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  icon: string | null;
  color: string;
  is_private: boolean;
  max_members: number | null;
  created_by: string | null;
  member_count: number;
  created_at: string;
  is_member?: boolean;
  my_role?: string | null;
}

export interface CommunityMember {
  id: string;
  community_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

// ─── List all communities ────────────────────────────────

export function useCommunities() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;
  const { user } = useAuth();

  return useQuery({
    queryKey: ["communities"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .order("member_count", { ascending: false });

      if (error) throw error;

      // Fetch user's memberships to mark is_member
      if (user) {
        const { data: memberships } = await supabase
          .from("community_members")
          .select("community_id, role")
          .eq("user_id", user.id);

        const memberMap = new Map(
          (memberships ?? []).map((m: { community_id: string; role: string }) => [
            m.community_id,
            m.role,
          ]),
        );

        return (data as Community[]).map((c) => ({
          ...c,
          is_member: memberMap.has(c.id),
          my_role: memberMap.get(c.id) ?? null,
        }));
      }

      return data as Community[];
    },
  });
}

// ─── Single community with members ───────────────────────

export function useCommunity(id?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;
  const { user } = useAuth();

  const communityQuery = useQuery({
    queryKey: ["community", id],
    enabled: !!id && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .eq("id", id!)
        .single();

      if (error) throw error;
      return data as Community;
    },
  });

  const membersQuery = useQuery({
    queryKey: ["community-members", id],
    enabled: !!id && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_members")
        .select(
          "*, profile:profiles!community_members_user_id_fkey(id, full_name, avatar_url)",
        )
        .eq("community_id", id!)
        .order("joined_at", { ascending: true });

      if (error) throw error;
      return data as CommunityMember[];
    },
  });

  return {
    community: communityQuery.data ?? null,
    members: membersQuery.data ?? [],
    isLoading: communityQuery.isLoading || membersQuery.isLoading,
  };
}

// ─── Join a public community ─────────────────────────────

export function useJoinCommunity() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (communityId: string) => {
      if (!user) throw new Error("Non authentifie");

      const { error } = await supabase
        .from("community_members")
        .insert({ community_id: communityId, user_id: user.id });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      queryClient.invalidateQueries({ queryKey: ["community"] });
      queryClient.invalidateQueries({ queryKey: ["community-members"] });
      toast.success("Vous avez rejoint la communaute !");
    },
    onError: () => {
      toast.error("Erreur lors de la connexion a la communaute");
    },
  });
}

// ─── Leave a community ──────────────────────────────────

export function useLeaveCommunity() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (communityId: string) => {
      if (!user) throw new Error("Non authentifie");

      const { error } = await supabase
        .from("community_members")
        .delete()
        .eq("community_id", communityId)
        .eq("user_id", user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      queryClient.invalidateQueries({ queryKey: ["community"] });
      queryClient.invalidateQueries({ queryKey: ["community-members"] });
      toast.success("Vous avez quitte la communaute");
    },
    onError: () => {
      toast.error("Erreur lors du depart de la communaute");
    },
  });
}

// ─── Create a community (admin/coach) ───────────────────

export function useCreateCommunity() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (payload: {
      name: string;
      description?: string;
      slug: string;
      icon?: string;
      color?: string;
      is_private?: boolean;
      max_members?: number | null;
    }) => {
      if (!user) throw new Error("Non authentifie");

      const { data: community, error } = await supabase
        .from("communities")
        .insert({
          ...payload,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join as admin
      await supabase.from("community_members").insert({
        community_id: (community as Community).id,
        user_id: user.id,
        role: "admin",
      });

      return community as Community;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      toast.success("Communaute creee avec succes !");
    },
    onError: () => {
      toast.error("Erreur lors de la creation de la communaute");
    },
  });
}

// ─── Update a community ─────────────────────────────────

export function useUpdateCommunity() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string; name?: string; description?: string | null; icon?: string | null; color?: string; is_private?: boolean; max_members?: number | null }) => {
      const { error } = await supabase
        .from("communities")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communities"] });
      queryClient.invalidateQueries({ queryKey: ["community"] });
      toast.success("Communaute mise a jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise a jour");
    },
  });
}

// ─── Community feed posts ────────────────────────────────

const PAGE_SIZE = 20;

export function useCommunityFeed(communityId?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = useSupabase() as any;
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const postsQuery = useQuery({
    queryKey: ["community-feed", communityId],
    enabled: !!communityId && !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feed_posts")
        .select(
          "*, author:profiles!feed_posts_author_id_fkey(id, full_name, avatar_url, role)",
        )
        .eq("community_id", communityId!)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(PAGE_SIZE);

      if (error) throw error;

      // Fetch user's likes
      if (user && (data as FeedPost[]).length > 0) {
        const postIds = (data as FeedPost[]).map((p) => p.id);
        const { data: likes } = await supabase
          .from("feed_likes")
          .select("post_id")
          .eq("profile_id", user.id)
          .in("post_id", postIds);

        const likedSet = new Set(
          (likes ?? []).map((l: { post_id: string }) => l.post_id),
        );
        return (data as FeedPost[]).map((p) => ({
          ...p,
          is_liked: likedSet.has(p.id),
        })) as FeedPost[];
      }

      return data as FeedPost[];
    },
  });

  const createPost = useMutation({
    mutationFn: async (post: {
      content: string;
      post_type: PostType;
      media_urls?: string[];
    }) => {
      if (!user) throw new Error("Non authentifie");
      const { data, error } = await supabase
        .from("feed_posts")
        .insert({
          ...post,
          author_id: user.id,
          community_id: communityId,
        })
        .select(
          "*, author:profiles!feed_posts_author_id_fkey(id, full_name, avatar_url, role)",
        )
        .single();
      if (error) throw error;
      return data as FeedPost;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["community-feed", communityId],
      });
      toast.success("Publication creee !");
    },
    onError: () => {
      toast.error("Erreur lors de la publication");
    },
  });

  return {
    posts: postsQuery.data ?? [],
    isLoading: postsQuery.isLoading,
    createPost,
  };
}
