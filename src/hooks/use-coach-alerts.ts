"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────

export type AlertType =
  | "no_checkin"
  | "revenue_drop"
  | "inactive_7d"
  | "inactive_14d"
  | "low_mood"
  | "flag_change"
  | "session_missed"
  | "goal_at_risk"
  | "payment_overdue";

export type AlertSeverity = "low" | "medium" | "high" | "critical";

export interface CoachAlert {
  id: string;
  coach_id: string;
  client_id: string;
  alert_type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string | null;
  is_resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

export interface CoachAlertWithClient extends CoachAlert {
  client: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  } | null;
}

// ── useCoachAlerts ─────────────────────────────────────────────────────────

export function useCoachAlerts() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["coach-alerts", user?.id],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("coach_alerts")
        .select(
          "*, client:profiles!coach_alerts_client_id_fkey(id, full_name, avatar_url)",
        )
        .eq("coach_id", user?.id)
        .eq("is_resolved", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CoachAlertWithClient[];
    },
    enabled: !!user,
    refetchInterval: 60000,
  });
}

// ── useAllAlerts ───────────────────────────────────────────────────────────
// Returns ALL alerts (including resolved) for the current coach

export function useAllAlerts() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["all-alerts", user?.id],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("coach_alerts")
        .select(
          "*, client:profiles!coach_alerts_client_id_fkey(id, full_name, avatar_url)",
        )
        .eq("coach_id", user?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as CoachAlertWithClient[];
    },
    enabled: !!user,
  });
}

// ── useMarkAlertRead ───────────────────────────────────────────────────────

export function useMarkAlertRead() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("coach_alerts")
        .update({ is_resolved: true, resolved_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["all-alerts"] });
    },
    onError: () => {
      toast.error("Erreur lors du marquage de l'alerte");
    },
  });
}

// ── useResolveAlert ────────────────────────────────────────────────────────

export function useResolveAlert() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from("coach_alerts")
        .update({
          is_resolved: true,
          resolved_at: new Date().toISOString(),
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["all-alerts"] });
      toast.success("Alerte resolue");
    },
    onError: () => {
      toast.error("Erreur lors de la resolution de l'alerte");
    },
  });
}

// ── useGenerateAlerts ──────────────────────────────────────────────────────

export function useGenerateAlerts() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Non authentifie");

      const alerts: Array<{
        coach_id: string;
        client_id: string;
        alert_type: AlertType;
        severity: AlertSeverity;
        title: string;
        description: string | null;
      }> = [];

      // Fetch all clients assigned to this coach (or all if admin)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: clientProfiles, error: profilesErr } = await (
        supabase as any
      )
        .from("profiles")
        .select("id, full_name, last_seen_at")
        .eq("role", "client");
      if (profilesErr) throw profilesErr;
      const clients = (clientProfiles ?? []) as Array<{
        id: string;
        full_name: string;
        last_seen_at: string | null;
      }>;

      const now = new Date();

      for (const client of clients) {
        // ── inactive_7d / inactive_14d ───────────────────────────────
        if (client.last_seen_at) {
          const lastLogin = new Date(client.last_seen_at);
          const daysSince = Math.floor(
            (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24),
          );
          if (daysSince >= 14) {
            alerts.push({
              coach_id: user.id,
              client_id: client.id,
              alert_type: "inactive_14d",
              severity: "high",
              title: `${client.full_name} ne s'est pas connecte(e) depuis ${daysSince} jours`,
              description: null,
            });
          } else if (daysSince >= 7) {
            alerts.push({
              coach_id: user.id,
              client_id: client.id,
              alert_type: "inactive_7d",
              severity: "medium",
              title: `${client.full_name} ne s'est pas connecte(e) depuis ${daysSince} jours`,
              description: null,
            });
          }
        }

        // ── no_checkin (10+ days without journal entry) ──────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: recentCheckins } = await (supabase as any)
          .from("journal_entries")
          .select("created_at")
          .eq("user_id", client.id)
          .order("created_at", { ascending: false })
          .limit(1);

        const lastCheckin = recentCheckins?.[0];
        if (lastCheckin) {
          const checkinDate = new Date(lastCheckin.created_at);
          const daysSinceCheckin = Math.floor(
            (now.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24),
          );
          if (daysSinceCheckin >= 10) {
            alerts.push({
              coach_id: user.id,
              client_id: client.id,
              alert_type: "no_checkin",
              severity: "medium",
              title: `${client.full_name} n'a pas fait de check-in depuis ${daysSinceCheckin} jours`,
              description: null,
            });
          }
        }

        // ── low_mood (last 3 check-ins with mood <= 2) ──────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: moodEntries } = await (supabase as any)
          .from("journal_entries")
          .select("mood")
          .eq("user_id", client.id)
          .not("mood", "is", null)
          .order("created_at", { ascending: false })
          .limit(3);

        if (moodEntries && moodEntries.length >= 3) {
          const allLow = moodEntries.every(
            (e: { mood: number }) => e.mood <= 2,
          );
          if (allLow) {
            alerts.push({
              coach_id: user.id,
              client_id: client.id,
              alert_type: "low_mood",
              severity: "high",
              title: `${client.full_name} a un moral bas sur ses 3 derniers check-ins`,
              description: null,
            });
          }
        }

        // ── session_missed (no_show sessions) ────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: noShowSessions } = await (supabase as any)
          .from("sessions")
          .select("id")
          .eq("client_id", client.id)
          .eq("status", "no_show")
          .gte(
            "scheduled_at",
            new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          )
          .limit(1);

        if (noShowSessions && noShowSessions.length > 0) {
          alerts.push({
            coach_id: user.id,
            client_id: client.id,
            alert_type: "session_missed",
            severity: "critical",
            title: `${client.full_name} a manque une session cette semaine`,
            description: null,
          });
        }
      }

      // Avoid duplicates: check existing unresolved alerts
      if (alerts.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existing } = await (supabase as any)
          .from("coach_alerts")
          .select("client_id, alert_type")
          .eq("coach_id", user.id)
          .eq("is_resolved", false);

        const existingSet = new Set(
          (existing ?? []).map(
            (a: { client_id: string; alert_type: string }) =>
              `${a.client_id}:${a.alert_type}`,
          ),
        );

        const newAlerts = alerts.filter(
          (a) => !existingSet.has(`${a.client_id}:${a.alert_type}`),
        );

        if (newAlerts.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await (supabase as any)
            .from("coach_alerts")
            .insert(newAlerts);
          if (error) throw error;
          return newAlerts.length;
        }
      }

      return 0;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["coach-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["all-alerts"] });
      if (count && count > 0) {
        toast.success(`${count} nouvelle(s) alerte(s) generee(s)`);
      } else {
        toast.success("Aucune nouvelle alerte detectee");
      }
    },
    onError: () => {
      toast.error("Erreur lors de la generation des alertes");
    },
  });
}
