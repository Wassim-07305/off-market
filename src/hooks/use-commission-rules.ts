"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

export interface CommissionRule {
  id: string;
  setter_id: string;
  rate: number;
  split_first: number;
  split_second: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  setter?: { id: string; full_name: string; email: string } | null;
}

export function useCommissionRules() {
  const supabase = useSupabase();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const rulesQuery = useQuery({
    queryKey: ["commission-rules"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("commission_rules")
        .select(
          "*, setter:profiles!commission_rules_setter_id_fkey(id, full_name, email)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as CommissionRule[];
    },
    enabled: !!user,
  });

  const upsertRule = useMutation({
    mutationFn: async (rule: {
      setter_id: string;
      rate: number;
      split_first: number;
      split_second: number;
      is_active?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("commission_rules")
        .upsert(
          {
            ...rule,
            is_active: rule.is_active ?? true,
            updated_at: new Date().toISOString(),
          } as never,
          { onConflict: "setter_id" },
        )
        .select()
        .single();
      if (error) throw error;
      return data as CommissionRule;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commission-rules"] });
      toast.success("Regle de commission sauvegardee");
    },
    onError: () => {
      toast.error("Erreur lors de la sauvegarde de la regle");
    },
  });

  const deleteRule = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("commission_rules")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["commission-rules"] });
      toast.success("Regle supprimee");
    },
    onError: () => {
      toast.error("Erreur lors de la suppression");
    },
  });

  return {
    rules: rulesQuery.data ?? [],
    isLoading: rulesQuery.isLoading,
    upsertRule,
    deleteRule,
  };
}
