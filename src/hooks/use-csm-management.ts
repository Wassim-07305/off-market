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
    staleTime: 5 * 60 * 1000,
    retry: 1,
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

      // 2. Fetch all active assignments — simple flat query, then enrich
      let assignments: unknown[] = [];
      try {
        const { data: aData, error: aErr } = await sb
          .from("coach_assignments")
          .select("id, coach_id, client_id, status, notes, assigned_at")
          .eq("status", "active");

        if (aErr) {
          console.warn("[CSM] assignments error:", aErr.message);
        }

        const rawAssignments = aData ?? [];

        // Enrich with client profiles if we have assignments
        const clientIds = rawAssignments.map((a: { client_id: string }) => a.client_id);
        const clientMap = new Map<string, unknown>();

        if (clientIds.length > 0) {
          // Try with student_details join, fallback without
          let clientProfiles: unknown[] | null = null;
          const { data: cpData, error: cpErr } = await sb
            .from("profiles")
            .select("*, student_details(*)")
            .in("id", clientIds);

          if (cpErr) {
            // student_details might not exist
            const { data: cpFallback } = await sb
              .from("profiles")
              .select("*")
              .in("id", clientIds);
            clientProfiles = (cpFallback ?? []).map((p: Profile) => ({
              ...p,
              student_details: [],
            }));
          } else {
            clientProfiles = cpData ?? [];
          }

          for (const cp of clientProfiles as { id: string }[]) {
            clientMap.set(cp.id, cp);
          }
        }

        // Build enriched assignments — filter out assignments where client profile was deleted
        assignments = rawAssignments
          .map((a: { coach_id: string; client_id: string }) => ({
            ...a,
            coach:
              (coaches ?? []).find(
                (c: { id: string }) => c.id === a.coach_id,
              ) ?? null,
            client: clientMap.get(a.client_id) ?? null,
          }))
          .filter((a: { client: unknown }) => a.client !== null);
      } catch (e) {
        console.warn("[CSM] assignments fetch failed:", e);
      }

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

      let callsMonth: { assigned_to: string; status: string }[] = [];
      let callsWeek: { id: string }[] = [];
      try {
        const { data: cmData } = await supabase
          .from("call_calendar")
          .select("assigned_to, status, date")
          .gte("date", startOfMonth)
          .in("status", ["realise", "completed", "done"]);
        callsMonth = (cmData ?? []) as typeof callsMonth;

        const { data: cwData } = await supabase
          .from("call_calendar")
          .select("id")
          .gte("date", startOfWeek)
          .in("status", ["realise", "completed", "done"]);
        callsWeek = (cwData ?? []) as typeof callsWeek;
      } catch (e) {
        console.warn("[CSM] calls fetch failed:", e);
      }

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
        if (a.client) entry.clients.push(a.client);
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
        const coachCalls = callsMonth.filter((c) => c.assigned_to === coachId);
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
      if (ucErr) console.warn("[CSM] unassigned query:", ucErr.message);

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
        sessionsThisWeek: callsWeek.length,
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

// ─── Unassign a client from their coach ──────────────────────
export function useUnassignClient() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      const { error } = await supabase
        .from("coach_assignments")
        .delete()
        .eq("client_id", clientId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Client desassigne");
      queryClient.invalidateQueries({ queryKey: ["csm-coaches-stats"] });
      queryClient.invalidateQueries({ queryKey: ["coach-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: () => {
      toast.error("Erreur lors de la desassignation");
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

      // Delete old assignment then create new (avoids UNIQUE constraint)
      await sb
        .from("coach_assignments")
        .delete()
        .eq("client_id", clientId);

      const { error } = await sb.from("coach_assignments").insert({
        client_id: clientId,
        coach_id: newCoachId,
        status: "active",
      });

      if (error) throw error;

      // Update student_details for backward compat
      await sb
        .from("student_details")
        .update({ assigned_coach: newCoachId })
        .eq("profile_id", clientId);
    },
    onSuccess: () => {
      toast.success("Client reassigne avec succès");
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

      // End all existing active assignments for these clients
      const { error: endErr } = await sb
        .from("coach_assignments")
        .update({ status: "ended", updated_at: new Date().toISOString() })
        .in("client_id", clientIds)
        .eq("status", "active");

      if (endErr) throw endErr;

      // Create new assignments in batch
      const newAssignments = clientIds.map((clientId) => ({
        client_id: clientId,
        coach_id: coachId,
        status: "active",
        assigned_by: user?.id ?? null,
      }));

      const { error: insertErr } = await sb
        .from("coach_assignments")
        .upsert(newAssignments);

      if (insertErr) throw insertErr;

      // Update student_details in batch
      const { error: sdErr } = await sb
        .from("student_details")
        .update({ assigned_coach: coachId })
        .in("profile_id", clientIds);

      if (sdErr) throw sdErr;
    },
    onSuccess: (_data, variables) => {
      toast.success(
        `${variables.clientIds.length} client${variables.clientIds.length > 1 ? "s" : ""} assigne${variables.clientIds.length > 1 ? "s" : ""} avec succès`,
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

// ─── Update coach specialties ─────────────────────────────────
export function useUpdateCoachSpecialties() {
  const sb = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      coachId,
      specialties,
    }: {
      coachId: string;
      specialties: string[];
    }) => {
      const { error } = await sb
        .from("profiles")
        .update({ specialties } as never)
        .eq("id", coachId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Specialites mises a jour");
      queryClient.invalidateQueries({ queryKey: ["csm-coaches-stats"] });
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour des specialites");
    },
  });
}
