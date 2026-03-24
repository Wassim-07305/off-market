"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type { Challenge, ChallengeParticipant } from "@/types/gamification";

const MINI_CHALLENGE_DURATION_DAYS = 5;

export interface MiniChallengeStatus {
  /** The mini-challenge (community type, tagged "mini-challenge") */
  challenge: Challenge | null;
  /** User participation record */
  participation: ChallengeParticipant | null;
  /** Whether the user has joined */
  isJoined: boolean;
  /** Days remaining in the user's 5-day window (null if not joined) */
  daysRemaining: number | null;
  /** Whether the 5-day access has expired */
  isExpired: boolean;
  /** Whether data is loading */
  isLoading: boolean;
}

/**
 * Hook to manage the "mini-challenge 5 jours" for prospects.
 *
 * The 5-day window starts from the user's `joined_at` date in
 * challenge_participants, NOT from the challenge's start date.
 * This allows each prospect to have their own 5-day window.
 */
export function useMiniChallenge(): MiniChallengeStatus {
  const supabase = useSupabase();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["mini-challenge", user?.id],
    enabled: !!user,
    queryFn: async () => {
      // Find the active mini-challenge (community challenge with "mini-challenge" in condition)
      const { data: challenges } = await supabase
        .from("challenges")
        .select("*")
        .eq("is_active", true)
        .eq("challenge_type", "community")
        .order("created_at", { ascending: false });

      // Find the one tagged as mini-challenge via condition jsonb
      const miniChallenge =
        (challenges as Challenge[] | null)?.find(
          (c) =>
            c.condition &&
            typeof c.condition === "object" &&
            (c.condition as Record<string, unknown>).mini_challenge === true
        ) ?? null;

      if (!miniChallenge || !user) {
        return { challenge: miniChallenge, participation: null };
      }

      // Check if user has joined
      const { data: parts } = await supabase
        .from("challenge_participants")
        .select("*")
        .eq("challenge_id", miniChallenge.id)
        .eq("profile_id", user.id)
        .maybeSingle();

      return {
        challenge: miniChallenge,
        participation: (parts as ChallengeParticipant) ?? null,
      };
    },
  });

  const challenge = query.data?.challenge ?? null;
  const participation = query.data?.participation ?? null;
  const isJoined = !!participation;

  let daysRemaining: number | null = null;
  let isExpired = false;

  if (participation?.joined_at) {
    const joinedAt = new Date(participation.joined_at);
    const expiresAt = new Date(
      joinedAt.getTime() + MINI_CHALLENGE_DURATION_DAYS * 24 * 60 * 60 * 1000
    );
    const now = new Date();
    const msRemaining = expiresAt.getTime() - now.getTime();

    if (msRemaining <= 0) {
      daysRemaining = 0;
      isExpired = true;
    } else {
      daysRemaining = Math.ceil(msRemaining / (24 * 60 * 60 * 1000));
    }
  }

  return {
    challenge,
    participation,
    isJoined,
    daysRemaining,
    isExpired,
    isLoading: query.isLoading,
  };
}
