import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import {
  rateLimit,
  RATE_LIMIT_PRESETS,
  type RateLimitConfig,
} from "@/lib/rate-limit";

/**
 * Determine which rate-limit preset applies to this pathname.
 */
function getRateLimitConfig(pathname: string): RateLimitConfig | null {
  if (pathname.startsWith("/api/ai/")) return RATE_LIMIT_PRESETS.ai;
  if (pathname.startsWith("/api/v1/")) return RATE_LIMIT_PRESETS.v1;
  if (pathname.startsWith("/api/")) return RATE_LIMIT_PRESETS.api;
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Rate limiting for API routes ──────────────────────────────────
  const rlConfig = getRateLimitConfig(pathname);

  if (rlConfig) {
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? request.headers.get("x-real-ip") ?? "unknown";
    const key = `${ip}:${pathname.startsWith("/api/ai/") ? "ai" : pathname.startsWith("/api/v1/") ? "v1" : "api"}`;

    const result = rateLimit(key, rlConfig);

    if (!result.allowed) {
      return NextResponse.json(
        { error: "Trop de requetes, veuillez reessayer plus tard" },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((result.resetAt - Date.now()) / 1000),
            ),
            "X-RateLimit-Limit": String(result.limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(result.resetAt / 1000)),
          },
        },
      );
    }

    // For allowed API requests, continue to auth middleware and attach
    // rate-limit headers to the response afterwards.
    const response = await updateSession(request);
    response.headers.set("X-RateLimit-Limit", String(result.limit));
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    response.headers.set(
      "X-RateLimit-Reset",
      String(Math.ceil(result.resetAt / 1000)),
    );
    return response;
  }

  // ── Non-API routes: auth session only ─────────────────────────────
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
