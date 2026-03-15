"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type { OnboardingOffer } from "@/types/database";

// ─── List all active offers sorted by sort_order ─────────────
export function useOnboardingOffers() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["onboarding-offers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("onboarding_offers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as OnboardingOffer[];
    },
  });
}

// ─── Select an offer for the current user ────────────────────
export function useSelectOffer() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (offerId: string) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_offer_id: offerId } as never)
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      queryClient.invalidateQueries({ queryKey: ["user-offer"] });
      toast.success("Offre sélectionnée !");
    },
    onError: () => {
      toast.error("Erreur lors de la sélection de l'offre");
    },
  });
}

// ─── Get the current user's selected offer with modules ──────
export function useUserOffer() {
  const supabase = useSupabase();
  const { user, profile } = useAuth();

  return useQuery({
    queryKey: ["user-offer", user?.id, profile?.onboarding_offer_id],
    queryFn: async () => {
      if (!user || !profile?.onboarding_offer_id) return null;
      const { data, error } = await supabase
        .from("onboarding_offers")
        .select("*")
        .eq("id", profile.onboarding_offer_id)
        .single();
      if (error) throw error;
      return (data ?? null) as OnboardingOffer | null;
    },
    enabled: !!user && !!profile?.onboarding_offer_id,
  });
}
