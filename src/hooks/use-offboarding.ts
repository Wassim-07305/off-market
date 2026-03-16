"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type { OffboardingRequest, OffboardingDataActions } from "@/types/database";

// ─── List offboarding requests ─────────────────────────────

export function useOffboardingRequests() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["offboarding-requests"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("offboarding_requests")
        .select(
          "*, user:profiles!offboarding_requests_user_id_fkey(id, full_name, email, avatar_url, role), transfer_to:profiles!offboarding_requests_transfer_to_id_fkey(id, full_name, email, avatar_url)",
        )
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as OffboardingRequest[];
    },
    enabled: !!user,
  });
}

// ─── Check offboarding status for a user ───────────────────

export function useOffboardingStatus(userId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["offboarding-status", userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from("offboarding_requests")
        .select("*")
        .eq("user_id", userId)
        .in("status", ["pending", "in_progress"])
        .maybeSingle();
      if (error) throw error;
      return data as unknown as OffboardingRequest | null;
    },
    enabled: !!userId,
  });
}

// ─── Create an offboarding request ─────────────────────────

export function useCreateOffboarding() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      userId,
      transferToId,
      reason,
      dataActions,
    }: {
      userId: string;
      transferToId?: string;
      reason: string;
      dataActions: OffboardingDataActions;
    }) => {
      const { data, error } = await supabase
        .from("offboarding_requests")
        .insert({
          user_id: userId,
          transfer_to_id: transferToId ?? null,
          reason,
          data_actions: dataActions,
          requested_by: user!.id,
          status: "pending",
        } as never)
        .select()
        .single();
      if (error) throw error;
      return data as unknown as OffboardingRequest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offboarding-requests"] });
      toast.success("Demande d'offboarding creee");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la creation");
    },
  });
}

// ─── Process an offboarding request (execute transfers) ────

export function useProcessOffboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (requestId: string) => {
      const res = await fetch("/api/offboarding/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Erreur lors du traitement");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offboarding-requests"] });
      queryClient.invalidateQueries({ queryKey: ["all-users"] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Offboarding traite avec succes");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors du traitement de l'offboarding");
    },
  });
}
