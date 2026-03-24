import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface ServerErrorLogEntry {
  message: string;
  stack?: string | null;
  route?: string | null;
  source: "api-error" | "manual";
  severity: "warning" | "error" | "critical";
  metadata?: Record<string, unknown>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RouteHandler = (...args: any[]) => Promise<Response>;

/**
 * Wraps an API route handler to automatically log uncaught errors.
 * Usage: export const GET = withErrorLogging("/api/foo", handler);
 */
export function withErrorLogging<T extends RouteHandler>(route: string, handler: T): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await handler(...args);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const stack = err instanceof Error ? err.stack : undefined;
      const request = args[0] as Request;
      console.error(`[${route}] Unhandled error:`, message);
      await logServerError({
        message: `[${route}] ${message}`.slice(0, 2000),
        stack,
        route,
        source: "api-error",
        severity: "critical",
        metadata: { method: request?.method, url: request?.url },
      });
      return NextResponse.json(
        { error: "Erreur interne du serveur" },
        { status: 500 },
      );
    }
  }) as T;
}

// Dedup: avoid logging the same error multiple times in quick succession
const recentErrors = new Map<string, number>();
const DEDUP_WINDOW_MS = 5_000;

export async function logServerError(entry: ServerErrorLogEntry): Promise<void> {
  try {
    const key = `${entry.message}::${entry.route}::${entry.source}`;
    const now = Date.now();
    const lastSeen = recentErrors.get(key);
    if (lastSeen && now - lastSeen < DEDUP_WINDOW_MS) return;
    recentErrors.set(key, now);

    if (recentErrors.size > 100) {
      for (const [k, t] of recentErrors) {
        if (now - t > DEDUP_WINDOW_MS) recentErrors.delete(k);
      }
    }

    const admin = createAdminClient();
    await admin.from("error_logs").insert({
      message: entry.message?.slice(0, 2000) ?? "Unknown server error",
      stack: entry.stack?.slice(0, 5000) ?? null,
      component_stack: null,
      page: entry.route ?? null,
      route: entry.route ?? null,
      user_id: null,
      user_email: null,
      user_role: null,
      source: entry.source,
      severity: entry.severity,
      user_agent: "server",
      viewport: null,
      metadata: entry.metadata ?? {},
    });
  } catch (e) {
    console.warn("[ServerErrorLogger] Failed to log error:", e);
  }
}
