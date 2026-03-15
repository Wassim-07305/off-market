"use client";

import { useEffect, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { evaluateBadges } from "@/lib/badge-evaluator";
import { toast } from "sonner";

const BADGE_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * Periodically evaluates badge conditions for the current user.
 * Shows a toast notification when a new badge is earned.
 * Runs on mount and every 5 minutes.
 */
export function useBadgeCheck() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const runCheck = useCallback(async () => {
    if (!user) return;

    try {
      const result = await evaluateBadges(supabase, user.id);

      if (result.newBadges.length > 0) {
        // Invalidate badge-related queries so the UI updates
        queryClient.invalidateQueries({ queryKey: ["user-badges"] });
        queryClient.invalidateQueries({ queryKey: ["badges"] });
        queryClient.invalidateQueries({ queryKey: ["xp"] });

        // Show toast for each new badge
        for (const badge of result.newBadges) {
          toast.success(
            `${badge.icon ?? "🏆"} Badge debloque : ${badge.name}`,
            {
              description: badge.description ?? undefined,
              duration: 6000,
            },
          );
        }
      }
    } catch {
      // Silently ignore badge check errors — non-critical background task
    }
  }, [supabase, user, queryClient]);

  useEffect(() => {
    if (!user) return;

    // Run immediately on mount
    runCheck();

    // Then every 5 minutes
    intervalRef.current = setInterval(runCheck, BADGE_CHECK_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [user, runCheck]);
}
