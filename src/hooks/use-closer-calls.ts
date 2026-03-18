"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { useMemo } from "react";
import { toast } from "sonner";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { QueryClient } from "@tanstack/react-query";

/** Auto-generate setter commissions when a closer call is closed */
async function generateCommission(
  supabase: SupabaseClient,
  closerCallId: string,
  setterId: string,
  saleAmount: number,
  queryClient: QueryClient,
) {
  try {
    // Check if commissions already exist for this closer call
    const { data: existing } = await supabase
      .from("commissions")
      .select("id")
      .eq("closer_call_id", closerCallId);
    if (existing && existing.length > 0) return; // Already generated

    // Fetch commission rule for this setter
    const { data: rule } = await supabase
      .from("commission_rules")
      .select("rate, split_first, split_second")
      .eq("setter_id", setterId)
      .eq("is_active", true)
      .single();

    // Default: 5% rate, 70/30 split
    const rate = rule?.rate ?? 5;
    const splitFirst = rule?.split_first ?? 70;
    const splitSecond = rule?.split_second ?? 30;

    const totalCommission = saleAmount * (rate / 100);
    const firstAmount =
      Math.round(totalCommission * (splitFirst / 100) * 100) / 100;
    const secondAmount =
      Math.round(totalCommission * (splitSecond / 100) * 100) / 100;

    const commissions = [];

    // First payment (due now)
    if (firstAmount > 0) {
      commissions.push({
        contractor_id: setterId,
        contractor_role: "setter",
        sale_amount: saleAmount,
        commission_rate: rate / 100,
        commission_amount: firstAmount,
        percentage: rate,
        amount: firstAmount,
        status: "pending",
        split_type: "first_payment",
        closer_call_id: closerCallId,
      });
    }

    // Second payment (due later)
    if (secondAmount > 0) {
      commissions.push({
        contractor_id: setterId,
        contractor_role: "setter",
        sale_amount: saleAmount,
        commission_rate: rate / 100,
        commission_amount: secondAmount,
        percentage: rate,
        amount: secondAmount,
        status: "pending",
        split_type: "second_payment",
        closer_call_id: closerCallId,
      });
    }

    if (commissions.length > 0) {
      const { error } = await supabase.from("commissions").insert(commissions);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
      const name = "ce setter";
      toast.success(
        `Commission generee : ${totalCommission.toFixed(2)} EUR (${rate}%) pour ${name}`,
      );
    }
  } catch (err) {
    console.error("Auto-commission error:", err);
    toast.error("Erreur lors de la generation auto de la commission");
  }
}

export interface CloserCall {
  id: string;
  client_id: string;
  lead_id: string | null;
  closer_id: string | null;
  setter_id: string | null;
  date: string;
  status: "closé" | "non_closé";
  revenue: number;
  nombre_paiements: number;
  link: string | null;
  debrief: string | null;
  notes: string | null;
  created_at: string;
  client?: { id: string; full_name: string; avatar_url: string | null } | null;
  closer?: { id: string; full_name: string; avatar_url: string | null } | null;
  setter?: { id: string; full_name: string; avatar_url: string | null } | null;
}

export interface CloserCallStats {
  totalCalls: number;
  closedCalls: number;
  nonClosedCalls: number;
  noShowCount: number;
  closingRate: number;
  showUpRate: number;
  totalCA: number;
  avgBasket: number;
  totalOffers: number;
}

export function useCloserCalls() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const closerCallsQuery = useQuery({
    queryKey: ["closer-calls"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("closer_calls")
        .select(
          "*, client:profiles!closer_calls_client_id_fkey(id, full_name, avatar_url), closer:profiles!closer_calls_closer_id_fkey(id, full_name, avatar_url), setter:profiles!closer_calls_setter_id_fkey(id, full_name, avatar_url)",
        )
        .order("date", { ascending: false });
      if (error) throw error;
      return data as CloserCall[];
    },
    enabled: !!user,
  });

  const createCloserCall = useMutation({
    mutationFn: async (call: {
      client_id?: string;
      lead_id?: string | null;
      closer_id?: string | null;
      setter_id?: string | null;
      date: string;
      status?: "closé" | "non_closé";
      revenue?: number;
      nombre_paiements?: number;
      link?: string | null;
      debrief?: string | null;
      notes?: string | null;
    }) => {
      const payload = {
        ...call,
        closer_id: call.closer_id ?? user?.id,
        status: call.status ?? "non_closé",
        revenue: call.revenue ?? 0,
        nombre_paiements: call.nombre_paiements ?? 0,
      };
      const { data, error } = await supabase
        .from("closer_calls")
        .insert(payload as never)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: async (rawData) => {
      queryClient.invalidateQueries({ queryKey: ["closer-calls"] });
      toast.success("Call cree");
      // Auto-generate commission if closed + setter
      const d = rawData as unknown as CloserCall;
      if (d?.status === "closé" && d?.setter_id && d?.revenue > 0) {
        await generateCommission(
          supabase,
          d.id,
          d.setter_id,
          d.revenue,
          queryClient,
        );
      }
    },
    onError: () => {
      toast.error("Erreur lors de la creation du call");
    },
  });

  const updateCloserCall = useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: { id: string } & Record<string, unknown>) => {
      const { error } = await supabase
        .from("closer_calls")
        .update(updates as never)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["closer-calls"] });
      toast.success("Call mis a jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise a jour");
    },
  });

  const deleteCloserCall = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("closer_calls")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["closer-calls"] });
      toast.success("Call supprime");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  const closerCalls = closerCallsQuery.data ?? [];

  const stats: CloserCallStats = useMemo(() => {
    const totalCalls = closerCalls.length;
    const closedCalls = closerCalls.filter((c) => c.status === "closé").length;
    const nonClosedCalls = closerCalls.filter(
      (c) => c.status === "non_closé",
    ).length;
    // No-show = calls avec status non_closé et revenue 0 (heuristique)
    const noShowCount = 0;
    const closingRate =
      totalCalls > 0 ? Math.round((closedCalls / totalCalls) * 100) : 0;
    const showUpRate =
      totalCalls > 0 ? 100 - Math.round((noShowCount / totalCalls) * 100) : 0;
    const totalCA = closerCalls
      .filter((c) => c.status === "closé")
      .reduce((sum, c) => sum + (c.revenue ?? 0), 0);
    const avgBasket = closedCalls > 0 ? Math.round(totalCA / closedCalls) : 0;
    const totalOffers = closerCalls.filter(
      (c) => c.revenue > 0 || c.status === "closé",
    ).length;

    return {
      totalCalls,
      closedCalls,
      nonClosedCalls,
      noShowCount,
      closingRate,
      showUpRate,
      totalCA,
      avgBasket,
      totalOffers,
    };
  }, [closerCalls]);

  return {
    closerCalls,
    stats,
    isLoading: closerCallsQuery.isLoading,
    createCloserCall,
    updateCloserCall,
    deleteCloserCall,
  };
}
