"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type {
  Challenge,
  ChallengeParticipant,
  ChallengeType,
} from "@/types/gamification";

// ─── List active challenges with participant counts ─────────────────────────
export function useChallenges() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const challengesQuery = useQuery({
    queryKey: ["challenges"],
    enabled: !!user,
    queryFn: async () => {
      // Fetch active challenges
      const { data: challenges, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("is_active", true)
        .gte("ends_at", new Date().toISOString())
        .order("ends_at", { ascending: true });
      if (error) throw error;

      // Fetch participant counts per challenge
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: counts, error: countsError } = await (supabase as any)
        .from("challenge_participants")
        .select("challenge_id");
      if (countsError) throw countsError;

      const countMap = new Map<string, number>();
      for (const row of counts ?? []) {
        countMap.set(
          row.challenge_id,
          (countMap.get(row.challenge_id) ?? 0) + 1,
        );
      }

      // Fetch user participations
      let myParticipations: ChallengeParticipant[] = [];
      if (user) {
        const { data: parts } = await supabase
          .from("challenge_participants")
          .select("*")
          .eq("profile_id", user.id);
        myParticipations = (parts ?? []) as ChallengeParticipant[];
      }
      const myMap = new Map(myParticipations.map((p) => [p.challenge_id, p]));

      return (challenges as Challenge[]).map((c) => ({
        ...c,
        participant_count: countMap.get(c.id) ?? 0,
        is_joined: myMap.has(c.id),
        my_progress: myMap.get(c.id)?.progress ?? 0,
        my_completed: myMap.get(c.id)?.completed ?? false,
      }));
    },
  });

  // ─── My participations with challenge details ───────────────────────────
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

  // ─── Join a challenge ───────────────────────────────────────────────────
  const joinChallenge = useMutation({
    mutationFn: async (challengeId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("challenge_participants")
        .insert({ challenge_id: challengeId, profile_id: user.id } as never);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      queryClient.invalidateQueries({ queryKey: ["challenge-participations"] });
      toast.success("Tu as rejoint le challenge !");
    },
    onError: () => {
      toast.error("Erreur lors de l'inscription au challenge");
    },
  });

  // ─── Submit proof/entry for a challenge ────────────────────────────────
  const submitEntry = useMutation({
    mutationFn: async ({
      challengeId,
      content,
      proofUrl,
    }: {
      challengeId: string;
      content: string;
      proofUrl?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("challenge_entries")
        .insert({
          challenge_id: challengeId,
          user_id: user.id,
          content,
          proof_url: proofUrl ?? null,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      queryClient.invalidateQueries({ queryKey: ["challenge-entries"] });
      toast.success("Soumission envoyee !");
    },
    onError: () => {
      toast.error("Erreur lors de la soumission");
    },
  });

  // ─── Review entry (admin) ──────────────────────────────────────────────
  const reviewEntry = useMutation({
    mutationFn: async ({
      entryId,
      status,
      note,
    }: {
      entryId: string;
      status: "approved" | "rejected";
      note?: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("challenge_entries")
        .update({
          status: status,
          review_note: note ?? null,
          reviewed_by: user.id,
        })
        .eq("id", entryId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenge-entries"] });
      toast.success("Soumission evaluee !");
    },
    onError: () => {
      toast.error("Erreur lors de l'evaluation");
    },
  });

  // ─── Update progress ──────────────────────────────────────────────────
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
        .update(updates as never)
        .eq("challenge_id", challengeId)
        .eq("profile_id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      queryClient.invalidateQueries({ queryKey: ["challenge-participations"] });
    },
    onError: () => {
      toast.error("Erreur lors de la mise a jour de la progression");
    },
  });

  // ─── Create challenge (admin) ─────────────────────────────────────────
  const createChallenge = useMutation({
    mutationFn: async (challenge: {
      title: string;
      description?: string;
      challenge_type: ChallengeType;
      condition?: Record<string, unknown>;
      xp_reward: number;
      badge_reward?: string;
      starts_at: string;
      ends_at: string;
      is_active?: boolean;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from("challenges")
        .insert({
          ...challenge,
          created_by: user.id,
          is_active: challenge.is_active ?? true,
        } as never)
        .select()
        .single();
      if (error) throw error;
      return data as Challenge;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      toast.success("Challenge cree !");
    },
    onError: () => {
      toast.error("Erreur lors de la creation du challenge");
    },
  });

  // ─── Update challenge (admin) ─────────────────────────────────────────
  const updateChallenge = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string } & Partial<Challenge>) => {
      const { error } = await supabase
        .from("challenges")
        .update(updates as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["challenges"] });
      toast.success("Challenge mis a jour !");
    },
    onError: () => {
      toast.error("Erreur lors de la mise a jour du challenge");
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
    submitEntry,
    reviewEntry,
    updateProgress,
    createChallenge,
    updateChallenge,
  };
}

// ─── Single challenge with participants ──────────────────────────────────────
export function useChallenge(challengeId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["challenge", challengeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .eq("id", challengeId)
        .single();
      if (error) throw error;

      const { data: participants, error: pError } = await supabase
        .from("challenge_participants")
        .select("*, profile:profiles(id, full_name, avatar_url)")
        .eq("challenge_id", challengeId)
        .order("progress", { ascending: false });
      if (pError) throw pError;

      return {
        ...(data as Challenge),
        participants: participants as (ChallengeParticipant & {
          profile: { id: string; full_name: string; avatar_url: string | null };
        })[],
      };
    },
    enabled: !!challengeId,
  });
}

// ─── Leaderboard for a specific challenge ────────────────────────────────────
export function useChallengeLeaderboard(challengeId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["challenge-leaderboard", challengeId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("challenge_participants")
        .select("*, profile:profiles(id, full_name, avatar_url)")
        .eq("challenge_id", challengeId)
        .order("progress", { ascending: false });
      if (error) throw error;

      return (
        data as (ChallengeParticipant & {
          profile: { id: string; full_name: string; avatar_url: string | null };
        })[]
      ).map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
    },
    enabled: !!challengeId,
  });
}

// ─── Challenge entries (for review) ──────────────────────────────────────────
export function useChallengeEntries(challengeId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["challenge-entries", challengeId],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("challenge_entries")
        .select("*, profile:profiles(id, full_name, avatar_url)")
        .eq("challenge_id", challengeId)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data as {
        id: string;
        challenge_id: string;
        profile_id: string;
        content: string;
        proof_url: string | null;
        submitted_at: string;
        reviewed_by: string | null;
        review_status: string | null;
        review_note: string | null;
        profile: { id: string; full_name: string; avatar_url: string | null };
      }[];
    },
    enabled: !!challengeId,
  });
}
