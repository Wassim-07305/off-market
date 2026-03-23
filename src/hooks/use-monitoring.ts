"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type { AuditLog } from "@/types/database";

// ── Types ──

interface HealthCheckResponse {
  status: "ok" | "degraded" | "down";
  timestamp: string;
  checks: {
    database: {
      status: "ok" | "degraded" | "down";
      latency_ms: number;
      error?: string;
    };
  };
  version: string;
  uptime_seconds: number;
}

interface UsageMetrics {
  activeUsers24h: number;
  messagesToday: number;
  callsThisWeek: number;
  formSubmissionsThisWeek: number;
}

// ── Health Check ──

export function useHealthCheck() {
  return useQuery<HealthCheckResponse>({
    queryKey: ["health-check"],
    queryFn: async () => {
      const res = await fetch("/api/health");
      if (!res.ok && res.status !== 503) {
        throw new Error("Health check failed");
      }
      return res.json();
    },
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

// ── Usage Metrics ──

export function useUsageMetrics() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery<UsageMetrics>({
    queryKey: ["usage-metrics"],
    enabled: !!user,
    staleTime: 60 * 1000,
    queryFn: async () => {
      const now = new Date();

      // 24h ago
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

      // Start of today
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

      // Start of this week (Monday)
      const dayOfWeek = now.getDay();
      const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday).toISOString();

      // Active users (last 24h)
      const { count: activeUsers24h } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .gte("last_sign_in_at", yesterday);

      // Messages today
      const { count: messagesToday } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .gte("created_at", todayStart);

      // Calls this week
      const { count: callsThisWeek } = await supabase
        .from("call_calendar")
        .select("id", { count: "exact", head: true })
        .gte("created_at", weekStart);

      // Form submissions this week
      const { count: formSubmissionsThisWeek } = await supabase
        .from("form_submissions")
        .select("id", { count: "exact", head: true })
        .gte("submitted_at", weekStart);

      return {
        activeUsers24h: activeUsers24h ?? 0,
        messagesToday: messagesToday ?? 0,
        callsThisWeek: callsThisWeek ?? 0,
        formSubmissionsThisWeek: formSubmissionsThisWeek ?? 0,
      };
    },
  });
}

// ── Audit Logs (for monitoring page) ──

export function useMonitoringAuditLogs(limit = 20) {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery<AuditLog[]>({
    queryKey: ["monitoring-audit-logs", limit],
    enabled: !!user,
    staleTime: 30 * 1000,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("audit_logs")
        .select(
          "*, user:profiles!audit_logs_user_id_fkey(id, full_name, email, avatar_url)",
        )
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.warn("Audit logs query error:", error.message);
        return [] as AuditLog[];
      }
      return (data ?? []) as AuditLog[];
    },
  });
}
