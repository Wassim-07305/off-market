"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type { OnboardingStep } from "@/types/billing";

export function useOnboarding() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  const currentStep = (profile?.onboarding_step ?? 0) as OnboardingStep;

  const updateStep = useMutation({
    mutationFn: async (step: OnboardingStep) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_step: step })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  const nextStep = () => {
    const next = Math.min(currentStep + 1, 7) as OnboardingStep;
    updateStep.mutate(next);
  };

  const prevStep = () => {
    const prev = Math.max(currentStep - 1, 0) as OnboardingStep;
    updateStep.mutate(prev);
  };

  const completeOnboarding = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_step: 7, onboarding_completed: true })
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (data: {
      phone?: string | null;
      bio?: string | null;
      avatar_url?: string | null;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  const uploadAvatar = useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error("Not authenticated");
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/avatar_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", user.id);
      if (updateError) throw updateError;

      return urlData.publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
    onError: () => {
      toast.error("Erreur lors de l'upload de l'avatar");
    },
  });

  return {
    currentStep,
    isComplete: currentStep >= 7,
    updateStep,
    nextStep,
    prevStep,
    completeOnboarding,
    updateProfile,
    uploadAvatar,
    isUpdating: updateStep.isPending,
  };
}

// Admin hook: get onboarding status for a specific client
export function useClientOnboarding(clientId: string) {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  const clientQuery = useQuery({
    queryKey: ["client-onboarding", clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, onboarding_step")
        .eq("id", clientId)
        .single();
      if (error) throw error;
      return data as {
        id: string;
        full_name: string;
        email: string;
        avatar_url: string | null;
        onboarding_step: number;
      };
    },
    enabled: !!clientId,
  });

  const setStep = useMutation({
    mutationFn: async (step: OnboardingStep) => {
      const { error } = await supabase
        .from("profiles")
        .update({ onboarding_step: step })
        .eq("id", clientId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["client-onboarding", clientId],
      });
    },
  });

  return {
    client: clientQuery.data,
    isLoading: clientQuery.isLoading,
    currentStep: (clientQuery.data?.onboarding_step ?? 0) as OnboardingStep,
    setStep,
  };
}
