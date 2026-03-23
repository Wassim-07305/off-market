"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type {
  UpsellRule,
  UpsellTrigger,
  UpsellTriggerStatus,
} from "@/types/upsell";

// ─── Admin: list all upsell rules ────────
export function useUpsellRules() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["upsell-rules"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("upsell_rules")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as UpsellRule[];
    },
  });
}

// ─── Admin: create upsell rule ───────────
export function useCreateUpsellRule() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      rule: Omit<UpsellRule, "id" | "created_at" | "created_by">,
    ) => {
      const { data, error } = await (supabase as any)
        .from("upsell_rules")
        .insert({ ...rule, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data as UpsellRule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upsell-rules"] });
      toast.success("Regle d'upsell creee");
    },
    onError: () => {
      toast.error("Erreur lors de la creation de la regle");
    },
  });
}

// ─── Admin: update upsell rule ───────────
export function useUpdateUpsellRule() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<UpsellRule> & { id: string }) => {
      const { error } = await (supabase as any)
        .from("upsell_rules")
        .update(updates)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upsell-rules"] });
      toast.success("Regle mise à jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour");
    },
  });
}

// ─── Admin: upsell dashboard data ────────
export function useUpsellDashboard() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["upsell-dashboard"],
    enabled: !!user,
    queryFn: async () => {
      const { data: triggers, error } = await (supabase as any)
        .from("upsell_triggers")
        .select(
          "*, rule:upsell_rules(*), client:profiles!upsell_triggers_client_id_fkey(id, full_name, email, avatar_url)",
        )
        .order("triggered_at", { ascending: false });
      if (error) throw error;

      const all = (triggers ?? []) as UpsellTrigger[];
      const pending = all.filter((t) => t.status === "pending");
      const converted = all.filter((t) => t.status === "converted");
      const conversionRate =
        all.length > 0 ? (converted.length / all.length) * 100 : 0;

      return {
        triggers: all,
        pending,
        converted,
        total: all.length,
        conversionRate,
      };
    },
  });
}

// ─── Client: my pending upsell offers ────
export function useMyUpsellOffers() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["my-upsell-offers", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("upsell_triggers")
        .select("*, rule:upsell_rules(*)")
        .eq("client_id", user!.id)
        .in("status", ["pending", "notified"])
        .order("triggered_at", { ascending: false });
      if (error) throw error;
      return data as UpsellTrigger[];
    },
  });
}

// ─── Client upsell triggers (for CRM detail) ────
export function useClientUpsellTriggers(clientId: string | undefined) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["client-upsell-triggers", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("upsell_triggers")
        .select("*, rule:upsell_rules(*)")
        .eq("client_id", clientId)
        .order("triggered_at", { ascending: false });
      if (error) {
        console.warn("upsell_triggers:", error.message);
        return [] as UpsellTrigger[];
      }
      return (data ?? []) as UpsellTrigger[];
    },
  });
}

// ─── Check if client meets upsell thresholds ────
export function useTriggerUpsellCheck() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      // Fetch active rules
      const { data: rules, error: rulesError } = await (supabase as any)
        .from("upsell_rules")
        .select("*")
        .eq("is_active", true);
      if (rulesError) throw rulesError;

      // Fetch client's student detail for revenue
      const { data: detail } = await (supabase as any)
        .from("student_details")
        .select("current_revenue, lifetime_value")
        .eq("profile_id", clientId)
        .single();

      // Fetch existing triggers to avoid duplicates
      const { data: existing } = await (supabase as any)
        .from("upsell_triggers")
        .select("rule_id")
        .eq("client_id", clientId);
      const existingRuleIds = new Set(
        ((existing ?? []) as { rule_id: string }[]).map((e) => e.rule_id),
      );

      const triggered: string[] = [];

      for (const rule of (rules ?? []) as UpsellRule[]) {
        if (existingRuleIds.has(rule.id)) continue;

        const config = rule.trigger_config as Record<string, unknown>;
        let shouldTrigger = false;

        if (rule.trigger_type === "revenue_threshold") {
          const threshold = (config.threshold as number) ?? 0;
          const revenue = (detail as any)?.current_revenue ?? 0;
          shouldTrigger = revenue >= threshold;
        }

        if (shouldTrigger) {
          const { error } = await (supabase as any)
            .from("upsell_triggers")
            .insert({
              rule_id: rule.id,
              client_id: clientId,
              status: "pending",
            });
          if (!error) triggered.push(rule.id);
        }
      }

      return { triggeredCount: triggered.length };
    },
    onSuccess: (data) => {
      if (data.triggeredCount > 0) {
        queryClient.invalidateQueries({ queryKey: ["upsell-dashboard"] });
        queryClient.invalidateQueries({ queryKey: ["my-upsell-offers"] });
        toast.success(`${data.triggeredCount} upsell(s) declenche(s)`);
      }
    },
  });
}

// ─── Dismiss upsell ──────────────────────
export function useDismissUpsell() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (triggerId: string) => {
      const { error } = await (supabase as any)
        .from("upsell_triggers")
        .update({ status: "dismissed" as UpsellTriggerStatus })
        .eq("id", triggerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-upsell-offers"] });
      queryClient.invalidateQueries({ queryKey: ["upsell-dashboard"] });
    },
  });
}

// ─── Convert upsell ──────────────────────
export function useConvertUpsell() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (triggerId: string) => {
      const { error } = await (supabase as any)
        .from("upsell_triggers")
        .update({
          status: "converted" as UpsellTriggerStatus,
          converted_at: new Date().toISOString(),
        })
        .eq("id", triggerId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-upsell-offers"] });
      queryClient.invalidateQueries({ queryKey: ["upsell-dashboard"] });
      toast.success("Upsell converti avec succès !");
    },
  });
}

// ─── Types for opportunity-based upsell system ──────
interface UpsellOpportunityData {
  id: string;
  student_id: string;
  trigger_type: string;
  trigger_value: string | null;
  offer_name: string;
  offer_type: string;
  amount: number | null;
  status: string;
  message: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  student?: unknown;
}

// ─── Upsell Opportunities (for dashboard) ──────
export function useUpsellOpportunities() {
  const supabase = useSupabase();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["upsell-opportunities"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("upsell_opportunities")
        .select(
          "*, student:student_details(id, profile_id, profile:profiles!student_details_profile_id_fkey(full_name, email, avatar_url))",
        )
        .order("created_at", { ascending: false });
      if (error) {
        console.warn("upsell_opportunities:", error.message);
        return [] as UpsellOpportunityData[];
      }
      return (data ?? []) as UpsellOpportunityData[];
    },
  });

  const opps = query.data ?? [];
  const detected = opps.filter((o) => o.status === "detected").length;
  const proposed = opps.filter((o) => o.status === "proposed").length;
  const accepted = opps.filter((o) => o.status === "accepted").length;
  const declined = opps.filter((o) => o.status === "declined").length;
  const totalRevenue = opps
    .filter((o) => o.status === "accepted")
    .reduce((sum, o) => sum + (o.amount ?? 0), 0);
  const conversionRate =
    opps.length > 0 ? Math.round((accepted / opps.length) * 100) : 0;
  const averageLTV = accepted > 0 ? Math.round(totalRevenue / accepted) : 0;

  return {
    opportunities: opps,
    stats: {
      detected,
      proposed,
      accepted,
      declined,
      totalRevenue,
      conversionRate,
      averageLTV,
    },
    isLoading: query.isLoading,
  };
}

// ─── Create upsell opportunity ──────────
export function useCreateUpsell() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (opp: Record<string, unknown>) => {
      const { data, error } = await (supabase as any)
        .from("upsell_opportunities")
        .insert({ ...opp, status: (opp.status as string) ?? "detected" })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upsell-opportunities"] });
      toast.success("Opportunite d'upsell creee");
    },
    onError: () => toast.error("Erreur lors de la creation"),
  });
}

// ─── Update upsell opportunity ──────────
export function useUpdateUpsell() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string } & Record<string, unknown>) => {
      const { error } = await (supabase as any)
        .from("upsell_opportunities")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["upsell-opportunities"] });
      toast.success("Opportunite mise à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
  });
}

// ─── Alumni section ────────────────────
export function useAlumni() {
  const supabase = useSupabase();
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ["alumni"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("student_details")
        .select(
          "id, profile_id, enrollment_date, completion_date, program, lifetime_value, health_score, tag, profile:profiles!student_details_profile_id_fkey(full_name, email, avatar_url)",
        )
        .not("completion_date", "is", null)
        .order("completion_date", { ascending: false });
      if (error) {
        console.warn("Alumni query:", error.message);
        return [] as Record<string, unknown>[];
      }
      return (data ?? []) as Record<string, unknown>[];
    },
  });

  const alumni = (query.data ?? []) as Array<{
    id: string;
    profile_id: string;
    enrollment_date: string;
    completion_date: string | null;
    program: string | null;
    lifetime_value: number;
    health_score: number;
    tag: string;
    profile?: { full_name: string; email: string; avatar_url: string | null };
  }>;

  const totalAlumni = alumni.length;
  const totalLTV = alumni.reduce((s, a) => s + (a.lifetime_value ?? 0), 0);
  const averageNPS =
    totalAlumni > 0
      ? Math.round(
          alumni.reduce((s, a) => s + (a.health_score ?? 0), 0) / totalAlumni,
        )
      : 0;
  const vipCount = alumni.filter((a) => a.tag === "vip").length;
  const retentionRate =
    totalAlumni > 0 ? Math.round((vipCount / totalAlumni) * 100) : 0;

  return {
    alumni,
    alumniStats: { totalAlumni, totalLTV, averageNPS, retentionRate },
    isLoading: query.isLoading,
  };
}
