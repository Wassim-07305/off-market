"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type { Profile, StudentDetail } from "@/types/database";
import { useMemo } from "react";

// ─── Types ───────────────────────────────────────────────────

export interface CoachWithStats {
  coach: Profile;
  clientCount: number;
  totalRevenue: number;
  averageHealthScore: number;
  sessionsThisMonth: number;
  clients: (Profile & { student_details: StudentDetail[] })[];
  atRiskClients: number;
  retentionRate: number;
}

export interface CsmOverviewStats {
  totalCoaches: number;
  totalAssigned: number;
  totalUnassigned: number;
  sessionsThisWeek: number;
  averageSatisfaction: number;
}

// ─── All coaches with full stats ─────────────────────────────

export function useCoachesWithStats() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["csm-coaches-stats"],
    enabled: !!user,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;

      // 1. Fetch coaches
      const { data: coaches, error: cErr } = await supabase
        .from("profiles")
        .select("*")
        .in("role", ["coach", "admin"])
        .order("full_name");

      if (cErr) throw cErr;

      // 2. Fetch all active assignments with client profiles + student_details
      const { data: assignments, error: aErr } = await sb
        .from("coach_assignments")
        .select(
          "*, coach:profiles!coach_assignments_coach_id_fkey(id, full_name, email, avatar_url, role), client:profiles!coach_assignments_client_id_fkey(id, full_name, email, avatar_url, role, student_details(*))",
        )
        .eq("status", "active");

      if (aErr) throw aErr;

      // 3. Fetch calls this month for session count per coach
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split("T")[0];
      const startOfWeek = new Date(
        now.getTime() - now.getDay() * 24 * 60 * 60 * 1000,
      )
        .toISOString()
        .split("T")[0];

      const { data: callsMonth, error: callErr } = await supabase
        .from("call_calendar")
        .select("assigned_to, status, date")
        .gte("date", startOfMonth)
        .in("status", ["completed", "done"]);

      if (callErr) throw callErr;

      const { data: callsWeek, error: cwErr } = await supabase
        .from("call_calendar")
        .select("id")
        .gte("date", startOfWeek)
        .in("status", ["completed", "done"]);

      if (cwErr) throw cwErr;

      // 4. Group assignments by coach
      const coachMap = new Map<string, CoachWithStats>();

      for (const coach of (coaches ?? []) as Profile[]) {
        coachMap.set(coach.id, {
          coach,
          clientCount: 0,
          totalRevenue: 0,
          averageHealthScore: 0,
          sessionsThisMonth: 0,
          clients: [],
          atRiskClients: 0,
          retentionRate: 100,
        });
      }

      for (const a of (assignments ?? []) as {
        coach_id: string;
        client: Profile & { student_details: StudentDetail[] };
        coach: Profile;
      }[]) {
        let entry = coachMap.get(a.coach_id);
        if (!entry) {
          entry = {
            coach: a.coach,
            clientCount: 0,
            totalRevenue: 0,
            averageHealthScore: 0,
            sessionsThisMonth: 0,
            clients: [],
            atRiskClients: 0,
            retentionRate: 100,
          };
          coachMap.set(a.coach_id, entry);
        }
        entry.clients.push(a.client);
      }

      // 5. Compute metrics
      for (const [coachId, entry] of coachMap) {
        const clients = entry.clients;
        entry.clientCount = clients.length;

        if (clients.length > 0) {
          let healthSum = 0;
          let revenueSum = 0;
          let atRisk = 0;
          let activeCount = 0;

          for (const c of clients) {
            const d = c.student_details?.[0];
            healthSum += d?.health_score ?? 0;
            revenueSum += d?.revenue ?? 0;
            if (
              d?.tag === "at_risk" ||
              d?.flag === "red" ||
              d?.flag === "orange"
            ) {
              atRisk++;
            }
            if (d?.flag !== "red") {
              activeCount++;
            }
          }

          entry.totalRevenue = revenueSum;
          entry.averageHealthScore = Math.round(healthSum / clients.length);
          entry.atRiskClients = atRisk;
          entry.retentionRate =
            clients.length > 0
              ? Math.round((activeCount / clients.length) * 100)
              : 100;
        }

        // Count sessions this month for this coach
        const coachCalls = (
          callsMonth as { assigned_to: string; status: string }[]
        )?.filter((c) => c.assigned_to === coachId);
        entry.sessionsThisMonth = coachCalls?.length ?? 0;
      }

      // 6. Count unassigned clients
      const assignedIds = new Set(
        ((assignments ?? []) as { client_id: string }[]).map(
          (a) => a.client_id,
        ),
      );

      let unassignedQuery = supabase
        .from("profiles")
        .select("*, student_details(*)")
        .eq("role", "client")
        .order("full_name");

      const { data: allClients, error: ucErr } = await unassignedQuery;
      if (ucErr) throw ucErr;

      const unassigned = (
        (allClients ?? []) as (Profile & {
          student_details: StudentDetail[];
        })[]
      ).filter((c) => !assignedIds.has(c.id));

      // 7. Build overview stats
      const overview: CsmOverviewStats = {
        totalCoaches: coachMap.size,
        totalAssigned: assignedIds.size,
        totalUnassigned: unassigned.length,
        sessionsThisWeek: (callsWeek as { id: string }[])?.length ?? 0,
        averageSatisfaction:
          coachMap.size > 0
            ? Math.round(
                Array.from(coachMap.values()).reduce(
                  (s, e) => s + e.averageHealthScore,
                  0,
                ) / coachMap.size,
              )
            : 0,
      };

      return {
        coaches: Array.from(coachMap.values()).sort(
          (a, b) => b.clientCount - a.clientCount,
        ),
        unassignedClients: unassigned,
        overview,
      };
    },
  });
}

// ─── Reassign a client to a different coach ──────────────────

export function useReassignClient() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      clientId,
      newCoachId,
    }: {
      clientId: string;
      newCoachId: string;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;

      // End current active assignment
      await sb
        .from("coach_assignments")
        .update({ status: "ended", updated_at: new Date().toISOString() })
        .eq("client_id", clientId)
        .eq("status", "active");

      // Create new assignment
      const { error } = await sb.from("coach_assignments").insert({
        client_id: clientId,
        coach_id: newCoachId,
        status: "active",
        assigned_by: user?.id ?? null,
      });

      if (error) throw error;

      // Update student_details for backward compat
      await sb
        .from("student_details")
        .update({ assigned_coach: newCoachId })
        .eq("profile_id", clientId);
    },
    onSuccess: () => {
      toast.success("Client reassigne avec succes");
      queryClient.invalidateQueries({ queryKey: ["csm-coaches-stats"] });
      queryClient.invalidateQueries({ queryKey: ["coach-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["unassigned-clients"] });
    },
    onError: () => {
      toast.error("Erreur lors de la reassignation");
    },
  });
}

// ─── Bulk assign clients to a coach ──────────────────────────

export function useBulkAssign() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      clientIds,
      coachId,
    }: {
      clientIds: string[];
      coachId: string;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;

      for (const clientId of clientIds) {
        // End existing active assignment
        await sb
          .from("coach_assignments")
          .update({ status: "ended", updated_at: new Date().toISOString() })
          .eq("client_id", clientId)
          .eq("status", "active");

        // Create new assignment
        const { error } = await sb.from("coach_assignments").insert({
          client_id: clientId,
          coach_id: coachId,
          status: "active",
          assigned_by: user?.id ?? null,
        });

        if (error) throw error;

        // Update student_details
        await sb
          .from("student_details")
          .update({ assigned_coach: coachId })
          .eq("profile_id", clientId);
      }
    },
    onSuccess: (_data, variables) => {
      toast.success(
        `${variables.clientIds.length} client${variables.clientIds.length > 1 ? "s" : ""} assigne${variables.clientIds.length > 1 ? "s" : ""} avec succes`,
      );
      queryClient.invalidateQueries({ queryKey: ["csm-coaches-stats"] });
      queryClient.invalidateQueries({ queryKey: ["coach-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["unassigned-clients"] });
    },
    onError: () => {
      toast.error("Erreur lors de l'assignation en masse");
    },
  });
}
