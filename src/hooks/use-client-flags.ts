"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type {
  ClientFlag,
  ClientFlagValue,
  ClientFlagHistoryEntry,
} from "@/types/roadmap";

// ─── Single client flag ──────────────────────────────────────

export function useClientFlag(clientId?: string) {
  const supabase = useSupabase();
  const { user } = useAuth();

  const effectiveClientId = clientId ?? user?.id;

  return useQuery({
    queryKey: ["client-flag", effectiveClientId],
    enabled: !!effectiveClientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_flags")
        .select(
          "*, client:profiles!client_flags_client_id_fkey(id, full_name, avatar_url), changer:profiles!client_flags_changed_by_fkey(id, full_name)",
        )
        .eq("client_id", effectiveClientId!)
        .maybeSingle();

      if (error) throw error;
      return data as ClientFlag | null;
    },
  });
}

// ─── Set / update client flag ────────────────────────────────

export function useSetClientFlag() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      clientId,
      flag,
      reason,
    }: {
      clientId: string;
      flag: ClientFlagValue;
      reason?: string;
    }) => {
      if (!user) throw new Error("Non authentifie");

      const { data: existing } = await supabase
        .from("client_flags")
        .select("id")
        .eq("client_id", clientId)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from("client_flags")
          .update({
            flag,
            reason: reason ?? null,
            changed_by: user.id,
            notified: false,
          })
          .eq("client_id", clientId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("client_flags").insert({
          client_id: clientId,
          flag,
          reason: reason ?? null,
          changed_by: user.id,
        });
        if (error) throw error;
      }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["client-flag", variables.clientId],
      });
      queryClient.invalidateQueries({ queryKey: ["flagged-clients"] });
      queryClient.invalidateQueries({
        queryKey: ["client-flag-history", variables.clientId],
      });
      toast.success("Drapeau mis a jour");
    },
    onError: () => {
      toast.error("Erreur lors de la mise a jour du drapeau");
    },
  });
}

// ─── All flagged clients (orange/red) ────────────────────────

export function useFlaggedClients() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["flagged-clients"],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_flags")
        .select(
          "*, client:profiles!client_flags_client_id_fkey(id, full_name, avatar_url, email), changer:profiles!client_flags_changed_by_fkey(id, full_name)",
        )
        .in("flag", ["orange", "red"])
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return data as ClientFlag[];
    },
  });
}

// ─── Flag history for a client ───────────────────────────────

export function useFlagHistory(clientId?: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["client-flag-history", clientId],
    enabled: !!clientId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("client_flag_history")
        .select(
          "*, changer:profiles!client_flag_history_changed_by_fkey(id, full_name)",
        )
        .eq("client_id", clientId!)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as ClientFlagHistoryEntry[];
    },
  });
}
