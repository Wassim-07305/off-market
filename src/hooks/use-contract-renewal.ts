"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type {
  Contract,
  ContractStatus,
  ContractRenewalLog,
} from "@/types/billing";

// ─── Renewal Status for a Single Contract ────────────────────────────────

export function useContractRenewalStatus(contractId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["contract-renewal-status", contractId],
    enabled: !!contractId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contracts")
        .select(
          "id, auto_renew, renewal_status, end_date",
        )
        .eq("id", contractId)
        .single();
      if (error) throw error;
      return data as Pick<
        Contract,
        | "id"
        | "auto_renew"
        | "renewal_status"
        | "end_date"
      > & { renewal_period_months?: number; renewal_notice_days?: number; renewed_from_id?: string; start_date?: string };
    },
  });
}

// ─── Toggle Auto-Renew ───────────────────────────────────────────────────

export function useToggleAutoRenew() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      contractId,
      autoRenew,
      renewalPeriodMonths,
      renewalNoticeDays,
    }: {
      contractId: string;
      autoRenew: boolean;
      renewalPeriodMonths?: number;
      renewalNoticeDays?: number;
    }) => {
      const updates: Record<string, unknown> = {
        auto_renew: autoRenew,
      };
      if (renewalPeriodMonths !== undefined) {
        updates.renewal_period_months = renewalPeriodMonths;
      }
      if (renewalNoticeDays !== undefined) {
        updates.renewal_notice_days = renewalNoticeDays;
      }

      const { error } = await supabase
        .from("contracts")
        .update(updates as never)
        .eq("id", contractId);
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["contract-renewal-status", variables.contractId],
      });
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({
        queryKey: ["contract", variables.contractId],
      });
      toast.success(
        variables.autoRenew
          ? "Renouvellement automatique active"
          : "Renouvellement automatique desactive",
      );
    },
    onError: () => {
      toast.error("Erreur lors de la mise à jour du renouvellement");
    },
  });
}

// ─── Renewal History (Logs) ──────────────────────────────────────────────

export function useRenewalHistory(contractId: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["contract-renewal-history", contractId],
    enabled: !!contractId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contract_renewal_logs")
        .select("*")
        .eq("contract_id", contractId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ContractRenewalLog[];
    },
  });
}

// ─── Upcoming Renewals (within 30 days) ──────────────────────────────────

export function useUpcomingRenewals() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["contracts-upcoming-renewals"],
    enabled: !!user,
    queryFn: async () => {
      const now = new Date();
      const in30Days = new Date();
      in30Days.setDate(in30Days.getDate() + 30);

      const { data, error } = await supabase
        .from("contracts")
        .select(
          "*, client:profiles!contracts_client_id_fkey(id, full_name, email, avatar_url)",
        )
        .eq("auto_renew", true)
        .in("status", ["signed", "active"])
        .gte("end_date", now.toISOString().split("T")[0])
        .lte("end_date", in30Days.toISOString().split("T")[0])
        .order("end_date", { ascending: true });

      if (error) {
        console.warn("Upcoming renewals query:", error.message);
        return [] as Contract[];
      }
      return (data ?? []) as Contract[];
    },
  });
}

// ─── Manual Renewal ──────────────────────────────────────────────────────

export function useManualRenew() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      contractId,
      durationMonths,
    }: {
      contractId: string;
      durationMonths?: number;
    }) => {
      // Fetch original
      const { data: original, error: fetchError } = await supabase
        .from("contracts")
        .select("*")
        .eq("id", contractId)
        .single();
      if (fetchError) throw fetchError;

      const orig = original as Contract;
      const periodMonths = durationMonths ?? orig.renewal_period_months ?? 12;
      const newStartDate =
        orig.end_date ?? new Date().toISOString().split("T")[0];
      const endDate = new Date(newStartDate);
      endDate.setMonth(endDate.getMonth() + periodMonths);

      // Create renewed contract
      const { data: renewed, error: createError } = await supabase
        .from("contracts")
        .insert({
          template_id: orig.template_id,
          client_id: orig.client_id,
          title: `${orig.title} (Renouvellement)`,
          content: orig.content,
          created_by: user!.id,
          status: "draft" as ContractStatus,
          amount: orig.amount,
          start_date: newStartDate,
          end_date: endDate.toISOString().split("T")[0],
          renewed_from_id: contractId,
          auto_renew: orig.auto_renew,
          renewal_period_months: orig.renewal_period_months,
          renewal_notice_days: orig.renewal_notice_days,
        } as never)
        .select()
        .single();
      if (createError) throw createError;

      const renewedContract = renewed as unknown as Contract;

      // Mark original as renewed
      await supabase
        .from("contracts")
        .update({
          renewal_status: "renewed",
          renewed_to: renewedContract.id,
        } as never)
        .eq("id", contractId);

      // Log the action
      await supabase.from("contract_renewal_logs").insert({
        contract_id: contractId,
        action: "auto_renewed",
        details: {
          new_contract_id: renewedContract.id,
          period_months: periodMonths,
          new_end_date: endDate.toISOString().split("T")[0],
        },
      } as never);

      return renewedContract;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contracts"] });
      queryClient.invalidateQueries({
        queryKey: ["contracts-upcoming-renewals"],
      });
      queryClient.invalidateQueries({ queryKey: ["contracts-expiring"] });
      toast.success("Contrat renouvele avec succès");
    },
    onError: () => {
      toast.error("Erreur lors du renouvellement du contrat");
    },
  });
}
