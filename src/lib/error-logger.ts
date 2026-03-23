import { createClient } from "@/lib/supabase/client";

export interface ErrorLogEntry {
  message: string;
  stack?: string | null;
  component_stack?: string | null;
  page?: string | null;
  route?: string | null;
  user_id?: string | null;
  user_email?: string | null;
  user_role?: string | null;
  source: "error-boundary" | "unhandled-error" | "unhandled-rejection" | "api-error" | "manual";
  severity: "warning" | "error" | "critical";
  user_agent?: string | null;
  viewport?: string | null;
  metadata?: Record<string, unknown>;
}

// Dedup: avoid logging the same error multiple times in quick succession
const recentErrors = new Map<string, number>();
const DEDUP_WINDOW_MS = 5_000;

function getErrorKey(entry: ErrorLogEntry): string {
  return `${entry.message}::${entry.page}::${entry.source}`;
}

export async function logError(entry: ErrorLogEntry): Promise<void> {
  try {
    // Dedup check
    const key = getErrorKey(entry);
    const now = Date.now();
    const lastSeen = recentErrors.get(key);
    if (lastSeen && now - lastSeen < DEDUP_WINDOW_MS) return;
    recentErrors.set(key, now);

    // Clean old entries
    if (recentErrors.size > 100) {
      for (const [k, t] of recentErrors) {
        if (now - t > DEDUP_WINDOW_MS) recentErrors.delete(k);
      }
    }

    // Enrich with browser info
    if (typeof window !== "undefined") {
      entry.page = entry.page ?? window.location.pathname;
      entry.route = entry.route ?? window.location.pathname + window.location.search;
      entry.user_agent = entry.user_agent ?? navigator.userAgent;
      entry.viewport = entry.viewport ?? `${window.innerWidth}x${window.innerHeight}`;
    }

    // Try to get user info from Supabase session
    if (!entry.user_id) {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          entry.user_id = user.id;
          entry.user_email = user.email ?? null;
          entry.user_role = user.user_metadata?.role ?? null;
        }
      } catch {
        // Auth not available, continue without user info
      }
    }

    // Insert into error_logs table
    const supabase = createClient();
    await supabase.from("error_logs").insert({
      message: entry.message?.slice(0, 2000) ?? "Unknown error",
      stack: entry.stack?.slice(0, 5000) ?? null,
      component_stack: entry.component_stack?.slice(0, 5000) ?? null,
      page: entry.page ?? null,
      route: entry.route ?? null,
      user_id: entry.user_id ?? null,
      user_email: entry.user_email ?? null,
      user_role: entry.user_role ?? null,
      source: entry.source,
      severity: entry.severity,
      user_agent: entry.user_agent ?? null,
      viewport: entry.viewport ?? null,
      metadata: entry.metadata ?? {},
    });
  } catch (e) {
    // Never let the error logger itself crash the app
    console.warn("[ErrorLogger] Failed to log error:", e);
  }
}
