import type { SupabaseClient } from "@supabase/supabase-js";

export interface AuditLogEntry {
  userId: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log an audit event to the audit_logs table.
 * Fire-and-forget — errors are silently ignored to avoid
 * disrupting the main user flow.
 */
export async function logAudit(
  supabase: SupabaseClient,
  entry: AuditLogEntry,
): Promise<void> {
  try {
    await supabase.from("audit_logs").insert({
      user_id: entry.userId,
      action: entry.action,
      entity_type: entry.entityType ?? null,
      entity_id: entry.entityId ?? null,
      metadata: entry.metadata ?? {},
    });
  } catch {
    // Audit logging should never break the app
  }
}
