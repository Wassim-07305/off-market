"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type { Profile, StudentDetail } from "@/types/database";
import { useMemo } from "react";

// ─── Types ───────────────────────────────────────────────────

export interface CoachAssignmentRow {
  id: string;
  coach_id: string;
  client_id: string;
  status: "active" | "paused" | "ended";
  notes: string | null;
  assigned_by: string | null;
  assigned_at: string;
  created_at: string;
  updated_at: string;
  coach: Profile;
  client: Profile & { student_details: StudentDetail[] };
}

export interface CoachMetrics {
  coach: Profile;
  clients: (Profile & { student_details: StudentDetail[] })[];
  totalClients: number;
  atRiskClients: number;
  averageEngagement: number;
  averageHealthScore: number;
  totalRevenue: number;
}

// ─── Fetch all assignments (active) with coach + client profiles ──

export function useCoachAssignments() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["coach-assignments"],
    enabled: !!user,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;
      const { data, error } = await sb
        .from("coach_assignments")
        .select(
          "*, coach:profiles!coach_assignments_coach_id_fkey(id, full_name, email, avatar_url, role), client:profiles!coach_assignments_client_id_fkey(id, full_name, email, avatar_url, role, student_details(*))",
        )
        .eq("status", "active")
        .order("assigned_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as CoachAssignmentRow[];
    },
  });
}

// ─── Fetch coaches (profiles with role = coach) ──────────────

export function useCoaches() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["coaches"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .in("role", ["coach", "admin"])
        .order("full_name");

      if (error) throw error;
      return (data ?? []) as Profile[];
    },
  });
}

// ─── Clients grouped by coach with metrics ───────────────────

export function useClientsGroupedByCoach() {
  const { data: assignments, isLoading, error } = useCoachAssignments();
  const { data: coaches } = useCoaches();

  const grouped = useMemo(() => {
    if (!assignments || !coaches)
      return {
        byCoach: new Map<string, CoachMetrics>(),
        unassignedClients: [] as Profile[],
      };

    const byCoach = new Map<string, CoachMetrics>();

    // Initialize all coaches (even those with 0 assignments)
    for (const coach of coaches) {
      byCoach.set(coach.id, {
        coach,
        clients: [],
        totalClients: 0,
        atRiskClients: 0,
        averageEngagement: 0,
        averageHealthScore: 0,
        totalRevenue: 0,
      });
    }

    // Group assignments
    for (const a of assignments) {
      const coachId = a.coach_id;
      let entry = byCoach.get(coachId);
      if (!entry) {
        entry = {
          coach: a.coach,
          clients: [],
          totalClients: 0,
          atRiskClients: 0,
          averageEngagement: 0,
          averageHealthScore: 0,
          totalRevenue: 0,
        };
        byCoach.set(coachId, entry);
      }
      entry.clients.push(a.client);
    }

    // Compute metrics per coach
    for (const [, entry] of byCoach) {
      const clients = entry.clients;
      entry.totalClients = clients.length;

      if (clients.length > 0) {
        let engagementSum = 0;
        let healthSum = 0;
        let revenueSum = 0;
        let atRisk = 0;

        for (const c of clients) {
          const d = c.student_details?.[0];
          engagementSum += d?.engagement_score ?? 0;
          healthSum += d?.health_score ?? 0;
          revenueSum += d?.revenue ?? 0;
          if (
            d?.tag === "at_risk" ||
            d?.flag === "red" ||
            d?.flag === "orange"
          ) {
            atRisk++;
          }
        }

        entry.atRiskClients = atRisk;
        entry.averageEngagement = Math.round(engagementSum / clients.length);
        entry.averageHealthScore = Math.round(healthSum / clients.length);
        entry.totalRevenue = revenueSum;
      }
    }

    return { byCoach, unassignedClients: [] as Profile[] };
  }, [assignments, coaches]);

  return {
    ...grouped,
    coaches: coaches ?? [],
    assignments: assignments ?? [],
    isLoading,
    error,
  };
}

// ─── Unassigned clients ──────────────────────────────────────

export function useUnassignedClients() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["unassigned-clients"],
    enabled: !!user,
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;

      // Get all client profile IDs that have an active assignment
      const { data: assigned, error: aErr } = await sb
        .from("coach_assignments")
        .select("client_id")
        .eq("status", "active");

      if (aErr) throw aErr;

      const assignedIds = ((assigned as { client_id: string }[]) ?? []).map(
        (a) => a.client_id,
      );

      // Query client profiles not in assigned list
      let query = supabase
        .from("profiles")
        .select("*, student_details(*)")
        .eq("role", "client")
        .order("full_name");

      if (assignedIds.length > 0) {
        query = query.not("id", "in", `(${assignedIds.join(",")})`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as unknown as (Profile & {
        student_details: StudentDetail[];
      })[];
    },
  });
}

// ─── Assign client to coach ─────────────────────────────────

export function useAssignClient() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      clientId,
      coachId,
    }: {
      clientId: string;
      coachId: string;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;

      // End any existing active assignment for this client
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

      // Also update student_details.assigned_coach for backward compat
      await sb
        .from("student_details")
        .update({ assigned_coach: coachId })
        .eq("profile_id", clientId);
    },
    onSuccess: () => {
      toast.success("Client assigne avec succès");
      queryClient.invalidateQueries({ queryKey: ["coach-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["unassigned-clients"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: () => {
      toast.error("Erreur lors de l'assignation");
    },
  });
}

// ─── Auto-assign: coach with fewest active clients ──────────

export function useAutoAssignCoach() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ clientId }: { clientId: string }) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any;

      // Count active assignments per coach
      const { data: coachesRaw, error: cErr } = await supabase
        .from("profiles")
        .select("id")
        .in("role", ["coach", "admin"]);

      if (cErr) throw cErr;
      const coachList = (coachesRaw ?? []) as { id: string }[];
      if (coachList.length === 0) throw new Error("Aucun coach disponible");

      const { data: assignments, error: aErr } = await sb
        .from("coach_assignments")
        .select("coach_id")
        .eq("status", "active");

      if (aErr) throw aErr;

      // Count per coach
      const counts = new Map<string, number>();
      for (const coach of coachList) {
        counts.set(coach.id, 0);
      }
      for (const a of (assignments as { coach_id: string }[]) ?? []) {
        counts.set(a.coach_id, (counts.get(a.coach_id) ?? 0) + 1);
      }

      // Find coach with fewest
      let minCoachId = coachList[0].id;
      let minCount = Infinity;
      for (const [id, count] of counts) {
        if (count < minCount) {
          minCount = count;
          minCoachId = id;
        }
      }

      // End existing active assignment
      await sb
        .from("coach_assignments")
        .update({ status: "ended", updated_at: new Date().toISOString() })
        .eq("client_id", clientId)
        .eq("status", "active");

      // Create new
      const { error } = await sb.from("coach_assignments").insert({
        client_id: clientId,
        coach_id: minCoachId,
        status: "active",
        assigned_by: user?.id ?? null,
      });

      if (error) throw error;

      await sb
        .from("student_details")
        .update({ assigned_coach: minCoachId })
        .eq("profile_id", clientId);

      return minCoachId;
    },
    onSuccess: () => {
      toast.success("Client assigne automatiquement");
      queryClient.invalidateQueries({ queryKey: ["coach-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["unassigned-clients"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: () => {
      toast.error("Erreur lors de l'assignation automatique");
    },
  });
}
