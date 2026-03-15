"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";

/**
 * Lightweight hook that exposes an `awardXp` mutation.
 * Designed to be called from other hooks' `onSuccess` callbacks
 * to automatically grant XP when certain actions happen.
 *
 * Uses the `award_xp` RPC function which handles XP config lookup,
 * deduplication, and streak multipliers server-side.
 */
export function useAwardXp() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const awardXp = useMutation({
    mutationFn: async ({
      action,
      metadata,
    }: {
      action: string;
      metadata?: Record<string, unknown>;
    }) => {
      if (!user) throw new Error("Not authenticated");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).rpc("award_xp", {
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
      queryClient.invalidateQueries({ queryKey: ["user-badges"] });
    },
  });

  return awardXp;
}
