"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type { Badge, UserBadge } from "@/types/gamification";

export function useBadges() {
  const supabase = useSupabase();
  const { user } = useAuth();

  // All available badges
  const allBadgesQuery = useQuery({
    queryKey: ["badges"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("badges")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true });
      if (error) throw error;
      return data as Badge[];
    },
  });

  // User's earned badges
  const userBadgesQuery = useQuery({
    queryKey: ["user-badges", user?.id],
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

  const allBadges = allBadgesQuery.data ?? [];
  const earnedBadges = userBadgesQuery.data ?? [];
  const earnedBadgeIds = new Set(earnedBadges.map((ub) => ub.badge_id));

  return {
    allBadges,
    earnedBadges,
    earnedBadgeIds,
    isLoading: allBadgesQuery.isLoading || userBadgesQuery.isLoading,
  };
}
