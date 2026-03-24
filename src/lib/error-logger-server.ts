import { createAdminClient } from "@/lib/supabase/admin";

export interface ServerErrorLogEntry {
  message: string;
  stack?: string | null;
  route?: string | null;
  source: "api-error" | "manual";
  severity: "warning" | "error" | "critical";
  metadata?: Record<string, unknown>;
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
