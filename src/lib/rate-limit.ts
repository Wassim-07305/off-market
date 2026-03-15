/**
 * In-memory rate limiter for API routes.
 *
 * Uses a Map keyed by IP address with sliding-window counters.
 * Old entries are automatically cleaned up every 60 seconds.
 */

interface RateLimitEntry {
  count: number;
  resetAt: number; // timestamp in ms
}

const store = new Map<string, RateLimitEntry>();

// Auto-cleanup stale entries every 60 seconds
let cleanupInterval: ReturnType<typeof setInterval> | null = null;

function ensureCleanup() {
  if (cleanupInterval) return;
  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) {
        store.delete(key);
      }
    }
  }, 60_000);

  // Don't keep the process alive just for cleanup
  if (typeof cleanupInterval === "object" && "unref" in cleanupInterval) {
    cleanupInterval.unref();
  }
}

export interface RateLimitConfig {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Window duration in seconds */
  windowSeconds: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
}

/**
 * Check and consume a rate limit token for the given key.
 */
export function rateLimit(
  key: string,
  config: RateLimitConfig,
): RateLimitResult {
  ensureCleanup();

  const now = Date.now();
  const entry = store.get(key);

  // No existing entry or window expired — start fresh
  if (!entry || entry.resetAt <= now) {
    const resetAt = now + config.windowSeconds * 1000;
    store.set(key, { count: 1, resetAt });
    return {
      allowed: true,
      limit: config.limit,
      remaining: config.limit - 1,
      resetAt,
    };
  }

  // Window still active
  if (entry.count < config.limit) {
    entry.count++;
    return {
      allowed: true,
      limit: config.limit,
      remaining: config.limit - entry.count,
      resetAt: entry.resetAt,
    };
  }

  // Limit exceeded
  return {
    allowed: false,
    limit: config.limit,
    remaining: 0,
    resetAt: entry.resetAt,
  };
}

/** Rate limit presets for different API route categories */
export const RATE_LIMIT_PRESETS = {
  /** General API routes: 60 req/min */
  api: { limit: 60, windowSeconds: 60 } satisfies RateLimitConfig,
  /** AI routes (expensive): 10 req/min */
  ai: { limit: 10, windowSeconds: 60 } satisfies RateLimitConfig,
  /** Public REST API v1: 20 req/min */
  v1: { limit: 20, windowSeconds: 60 } satisfies RateLimitConfig,
} as const;
