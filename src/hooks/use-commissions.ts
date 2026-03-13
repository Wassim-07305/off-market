"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import type {
  Commission,
  CommissionRole,
  CommissionStatus,
  CommissionSummary,
} from "@/types/billing";

interface UseCommissionsOptions {
  contractorId?: string;
  role?: CommissionRole;
  status?: CommissionStatus;
}

export function useCommissions(options: UseCommissionsOptions = {}) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { contractorId, role, status } = options;

  const commissionsQuery = useQuery({
    queryKey: ["commissions", contractorId, role, status],
    enabled: !!user,
    queryFn: async () => {
      let query = supabase
        .from("commissions")
        .select(
          "*, contractor:profiles!commissions_contractor_id_fkey(id, full_name, email)",
        )
        .order("created_at", { ascending: false });

      if (contractorId) query = query.eq("contractor_id", contractorId);
      if (role) query = query.eq("contractor_role", role);
      if (status) query = query.eq("status", status);

      const { data, error } = await query;
      if (error) throw error;
      return data as Commission[];
    },
  });

  const createCommission = useMutation({
    mutationFn: async (commission: {
      sale_id?: string;
      contractor_id: string;
      contractor_role: CommissionRole;
      sale_amount: number;
      commission_rate: number;
      commission_amount: number;
    }) => {
      const { data, error } = await supabase
        .from("commissions")
        .insert(commission)
        .select()
        .single();
      if (error) throw error;
      return data as Commission;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
    },
  });

  const markAsPaid = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("commissions")
        .update({ status: "paid", paid_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commissions"] });
    },
  });

  const commissions = commissionsQuery.data ?? [];

  // Build summary per contractor
  const summaryMap = new Map<string, CommissionSummary>();
  commissions.forEach((c) => {
    const existing = summaryMap.get(c.contractor_id);
    if (existing) {
      existing.total_owed += c.status === "pending" ? c.commission_amount : 0;
      existing.total_paid += c.status === "paid" ? c.commission_amount : 0;
      existing.remaining += c.status === "pending" ? c.commission_amount : 0;
      existing.count += 1;
    } else {
      summaryMap.set(c.contractor_id, {
        contractor_id: c.contractor_id,
        contractor_name: c.contractor?.full_name ?? "Inconnu",
        role: c.contractor_role,
        total_owed: c.status === "pending" ? c.commission_amount : 0,
        total_paid: c.status === "paid" ? c.commission_amount : 0,
        remaining: c.status === "pending" ? c.commission_amount : 0,
        count: 1,
      });
    }
  });

  const summaries = Array.from(summaryMap.values());

  return {
    commissions,
    summaries,
    isLoading: commissionsQuery.isLoading,
    createCommission,
    markAsPaid,
  };
}
