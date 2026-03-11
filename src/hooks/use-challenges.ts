"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type { Challenge, ChallengeParticipant } from "@/types/gamification";

export function useChallenges() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Active challenges
  const challengesQuery = useQuery({
    queryKey: ["challenges"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("is_active", true)
        .gte("ends_at", new Date().toISOString())
        .order("ends_at", { ascending: true });
      if (error) throw error;
      return data as Challenge[];
    },
  });

  // My participations
  const participationsQuery = useQuery({
    queryKey: ["challenge-participations", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("challenge_participants")
        .select("*, challenge:challenges(*)")
        .eq("profile_id", user.id)
        .order("joined_at", { ascending: false });
      if (error) throw error;
      return data as (ChallengeParticipant & { challenge: Challenge })[];
    },
    enabled: !!user,
  });

  // Join a challenge
  const joinChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("challenge_participants")
        .insert({ challenge_id: challengeId, profile_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge-participations"] });
    },
  });

  // Update progress
  const updateProgress = useMutation({
    mutationFn: async ({
      challengeId,
      progress,
    }: {
      challengeId: string;
      progress: number;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const updates: Record<string, unknown> = { progress };
      if (progress >= 100) {
        updates.completed = true;
        updates.completed_at = new Date().toISOString();
      }
      const { error } = await supabase
        .from("challenge_participants")
        .update(updates)
        .eq("challenge_id", challengeId)
        .eq("profile_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge-participations"] });
    },
  });

  const challenges = challengesQuery.data ?? [];
  const participations = participationsQuery.data ?? [];
  const joinedChallengeIds = new Set(participations.map((p) => p.challenge_id));

  return {
    challenges,
    participations,
    joinedChallengeIds,
    isLoading: challengesQuery.isLoading,
    joinChallenge,
    updateProgress,
  };
}
