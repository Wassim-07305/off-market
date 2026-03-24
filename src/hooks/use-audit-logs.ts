"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type { AuditLog } from "@/types/database";

interface UseAuditLogsOptions {
  userId?: string;
  action?: string;
  from?: string;
  to?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export function useAuditLogs(options: UseAuditLogsOptions = {}) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const {
    userId,
    action,
    from: fromOpt,
    to: toOpt,
    dateFrom,
    dateTo,
    limit = 100,
  } = options;
  const from = fromOpt ?? dateFrom;
  const to = toOpt ?? dateTo;

  const query = useQuery({
    queryKey: ["audit-logs", userId, action, from, to, limit],
    enabled: !!user,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let q = (supabase as any)
        .from("audit_logs")
        .select(
          "*, user:profiles(id, full_name, email, avatar_url)",
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (userId) q = q.eq("user_id", userId);
      if (action) q = q.eq("action", action);
      if (from) q = q.gte("created_at", from);
      if (to) q = q.lte("created_at", to);

      const { data, error } = await q;
      if (error) {
        console.warn("Audit logs query error:", error.message);
        return [] as AuditLog[];
      }
      return (data ?? []) as AuditLog[];
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  return {
    logs: query.data ?? [],
    isLoading: query.isLoading,
  };
}

/**
 * Fetch distinct action types for filter dropdown.
 */
export function useAuditActions() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["audit-actions"],
    enabled: !!user,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from("audit_logs")
        .select("action")
        .limit(500);

      const rows = (data ?? []) as { action: string }[];
      const unique = [...new Set(rows.map((d) => d.action))].sort();
      return unique;
    },
    staleTime: 5 * 60 * 1000,
  });
}
