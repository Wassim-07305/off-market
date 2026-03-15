"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/auth-store";
import type { RateLimitAction } from "@/lib/rate-limiter";
import { formatResetTime } from "@/lib/rate-limiter";

interface RateLimitStatusResult {
  remaining: number;
  limit: number;
  resetAt: string;
  isLimited: boolean;
  currentCount: number;
}

/**
 * Hook to poll rate limit status every 30s for a given action.
 * Shows toast warning when approaching limit (< 5 remaining).
 */
export function useRateLimitStatus(action: RateLimitAction) {
  const user = useAuthStore((s) => s.user);
  const hasWarnedRef = useRef(false);

  const query = useQuery<RateLimitStatusResult>({
    queryKey: ["rate-limit-status", action, user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return {
          remaining: 999,
          limit: 999,
          resetAt: new Date(Date.now() + 3600_000).toISOString(),
          isLimited: false,
          currentCount: 0,
        };
      }

      const { data, error } = await (supabase.rpc as CallableFunction)(
        "get_rate_limit_status",
        {
          p_user_id: user.id,
          p_action: action,
        },
      );

      if (error) {
        console.error("Rate limit status error:", error);
        return {
          remaining: 999,
          limit: 999,
          resetAt: new Date(Date.now() + 3600_000).toISOString(),
          isLimited: false,
          currentCount: 0,
        };
      }

      const result = data as {
        remaining: number;
        max_count: number;
        reset_at: string;
        is_limited: boolean;
        current_count: number;
      };

      return {
        remaining: result.remaining,
        limit: result.max_count,
        resetAt: result.reset_at,
        isLimited: result.is_limited,
        currentCount: result.current_count,
      };
    },
    enabled: !!user?.id,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });

  // Show toast warning when approaching limit
  useEffect(() => {
    if (!query.data) return;

    const { remaining, limit, isLimited, resetAt } = query.data;

    if (isLimited && !hasWarnedRef.current) {
      hasWarnedRef.current = true;
      toast.error(
        `Limite d'enrichissement atteinte. Reessayez a ${formatResetTime(resetAt)}.`,
      );
    } else if (
      remaining > 0 &&
      remaining <= 5 &&
      remaining < limit &&
      !hasWarnedRef.current
    ) {
      hasWarnedRef.current = true;
      toast.warning(
        `Attention : il vous reste ${remaining} enrichissements avant la limite.`,
      );
    }

    // Reset warning flag when remaining goes back up (new window)
    if (remaining > 5) {
      hasWarnedRef.current = false;
    }
  }, [query.data]);

  return {
    remaining: query.data?.remaining ?? 999,
    limit: query.data?.limit ?? 999,
    resetAt: query.data?.resetAt ?? "",
    isLimited: query.data?.isLimited ?? false,
    currentCount: query.data?.currentCount ?? 0,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
