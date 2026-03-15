import type { SupabaseClient } from "@supabase/supabase-js";

export type RateLimitAction =
  | "linkedin_enrich"
  | "instagram_enrich"
  | "bulk_enrich"
  | "ai_query";

interface RateLimitResult {
  allowed: boolean;
  current_count: number;
  max_count: number;
  remaining: number;
  window_start: string;
  reset_at: string;
}

interface RateLimitStatus {
  remaining: number;
  limit: number;
  resetAt: string;
  isLimited: boolean;
  currentCount: number;
}

// Default limits (fallback if DB config is unavailable)
const DEFAULT_LIMITS: Record<RateLimitAction, { maxCount: number; windowMinutes: number }> = {
  linkedin_enrich: { maxCount: 30, windowMinutes: 60 },
  instagram_enrich: { maxCount: 50, windowMinutes: 60 },
  bulk_enrich: { maxCount: 100, windowMinutes: 1440 }, // 24h
  ai_query: { maxCount: 60, windowMinutes: 60 },
};

/**
 * Check rate limit via Supabase RPC. Returns the result with allowed flag.
 * Increments the counter if allowed.
 */
export async function checkRateLimit(
  supabase: SupabaseClient,
  userId: string,
  action: RateLimitAction,
  maxCount?: number,
  windowMinutes?: number,
): Promise<RateLimitResult> {
  const defaults = DEFAULT_LIMITS[action];
  const max = maxCount ?? defaults.maxCount;
  const minutes = windowMinutes ?? defaults.windowMinutes;

  // Convert minutes to PostgreSQL interval string
  const intervalStr = minutes >= 1440
    ? `${Math.floor(minutes / 1440)} days`
    : `${minutes} minutes`;

  const { data, error } = await supabase.rpc("check_rate_limit", {
    p_user_id: userId,
    p_action: action,
    p_max_count: max,
    p_window_interval: intervalStr,
  });

  if (error) {
    console.error("Rate limit check failed:", error);
    // Fail open: allow the request if rate limiting is broken
    return {
      allowed: true,
      current_count: 0,
      max_count: max,
      remaining: max,
      window_start: new Date().toISOString(),
      reset_at: new Date(Date.now() + minutes * 60_000).toISOString(),
    };
  }

  return data as RateLimitResult;
}

/**
 * Get current rate limit status without incrementing.
 */
export async function getRateLimitStatus(
  supabase: SupabaseClient,
  userId: string,
  action: RateLimitAction,
): Promise<RateLimitStatus> {
  const { data, error } = await supabase.rpc("get_rate_limit_status", {
    p_user_id: userId,
    p_action: action,
  });

  if (error) {
    console.error("Rate limit status fetch failed:", error);
    const defaults = DEFAULT_LIMITS[action];
    return {
      remaining: defaults.maxCount,
      limit: defaults.maxCount,
      resetAt: new Date(Date.now() + defaults.windowMinutes * 60_000).toISOString(),
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
}

/**
 * Map enrichment type to rate limit action
 */
export function enrichmentTypeToAction(
  type: string,
): RateLimitAction {
  switch (type) {
    case "linkedin":
      return "linkedin_enrich";
    case "instagram":
      return "instagram_enrich";
    case "all":
      return "bulk_enrich";
    default:
      // For tiktok, facebook, website — use linkedin_enrich limits as general enrichment
      return "linkedin_enrich";
  }
}

/**
 * Format rate limit error message in French
 */
export function formatRateLimitError(resetAt: string): string {
  const resetDate = new Date(resetAt);
  const now = new Date();
  const diffMs = resetDate.getTime() - now.getTime();
  const diffMin = Math.ceil(diffMs / 60_000);

  if (diffMin <= 1) {
    return "Limite atteinte. Reessayez dans moins d'une minute.";
  }
  if (diffMin < 60) {
    return `Limite atteinte. Reessayez dans ${diffMin} minutes.`;
  }

  const hours = Math.floor(diffMin / 60);
  const mins = diffMin % 60;
  if (mins === 0) {
    return `Limite atteinte. Reessayez dans ${hours}h.`;
  }
  return `Limite atteinte. Reessayez dans ${hours}h${mins.toString().padStart(2, "0")}.`;
}

/**
 * Format reset time for display
 */
export function formatResetTime(resetAt: string): string {
  const date = new Date(resetAt);
  return date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Build rate limit headers for API responses
 */
export function buildRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.max_count),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": result.reset_at,
  };
}
