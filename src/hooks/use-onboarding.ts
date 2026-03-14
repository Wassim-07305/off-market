"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type { OnboardingStep } from "@/types/billing";

// ─── Step keys for the enhanced onboarding flow ──────────────────
export const ONBOARDING_STEP_KEYS = [
  "welcome_video",
  "about_you",
  "meet_csm",
  "feature_tour",
  "message_test",
  "completion",
] as const;

export type OnboardingStepKey = (typeof ONBOARDING_STEP_KEYS)[number];

export interface OnboardingStepRecord {
  id: string;
  profile_id: string;
  step_key: string;
  completed: boolean;
  data: Record<string, unknown>;
  completed_at: string | null;
  created_at: string;
}

export interface CsmWelcomeVideo {
  id: string;
  coach_id: string;
  video_url: string;
  thumbnail_url: string | null;
  is_active: boolean;
  created_at: string;
}

// ─── Main onboarding hook (existing + enhanced) ──────────────────
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
        .update({ onboarding_step: step } as never)
        .eq("id", user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });

  const nextStep = () => {
    const next = Math.min(currentStep + 1, 7) as OnboardingStep;
    updateStep.mutate(next, {
      onSuccess: () => {
        // Award XP for completing the current step
        try {
          supabase.rpc(
            "award_xp" as never,
            {
              p_profile_id: user!.id,
              p_action: "onboarding_step",
              p_metadata: { step: currentStep },
            } as never,
          );
        } catch {
          // Silently ignore — XP is bonus, not critical
        }
      },
    });
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
        .update({ onboarding_step: 7, onboarding_completed: true } as never)
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
        .update(data as never)
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
        .update({ avatar_url: urlData.publicUrl } as never)
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

// ─── Enhanced onboarding progress (granular step tracking) ───────
export function useOnboardingProgress(userId?: string) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const targetId = userId ?? user?.id;

  const stepsQuery = useQuery({
    queryKey: ["onboarding-steps", targetId],
    queryFn: async () => {
      if (!targetId) return [];
      const { data, error } = await supabase
        .from("onboarding_steps" as never)
        .select("*")
        .eq("profile_id", targetId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as OnboardingStepRecord[];
    },
    enabled: !!targetId,
  });

  const completedKeys = new Set(
    (stepsQuery.data ?? [])
      .filter((s) => s.completed)
      .map((s) => s.step_key),
  );

  const currentStepIndex = ONBOARDING_STEP_KEYS.findIndex(
    (key) => !completedKeys.has(key),
  );

  return {
    steps: stepsQuery.data ?? [],
    completedKeys,
    currentStepIndex: currentStepIndex === -1 ? ONBOARDING_STEP_KEYS.length : currentStepIndex,
    isAllComplete: currentStepIndex === -1,
    isLoading: stepsQuery.isLoading,
  };
}

// ─── Complete a specific onboarding step ─────────────────────────
export function useCompleteStep() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      stepKey,
      data,
    }: {
      stepKey: OnboardingStepKey;
      data?: Record<string, unknown>;
    }) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase
        .from("onboarding_steps" as never)
        .upsert(
          {
            profile_id: user.id,
            step_key: stepKey,
            completed: true,
            data: data ?? {},
            completed_at: new Date().toISOString(),
          } as never,
          { onConflict: "profile_id,step_key" },
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-steps"] });
    },
    onError: () => {
      toast.error("Erreur lors de la sauvegarde de l'etape");
    },
  });
}

// ─── CSM welcome video ───────────────────────────────────────────
export function useCsmWelcomeVideo(coachId?: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: ["csm-welcome-video", coachId],
    queryFn: async () => {
      if (!coachId) return null;
      const { data, error } = await supabase
        .from("csm_welcome_videos" as never)
        .select("*")
        .eq("coach_id", coachId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as CsmWelcomeVideo | null;
    },
    enabled: !!coachId,
  });
}

// ─── Submit onboarding questionnaire data ────────────────────────
export function useOnboardingForm() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (formData: {
      business_type: string;
      current_revenue: string;
      goals: string;
      how_found_alexia: string;
    }) => {
      if (!user) throw new Error("Not authenticated");
      // Save to onboarding_responses (existing table from migration 011)
      const { error } = await supabase
        .from("onboarding_responses" as never)
        .upsert(
          {
            user_id: user.id,
            step: "about_you",
            data: formData,
          } as never,
          { onConflict: "user_id" },
        );
      if (error) throw error;

      // Also mark onboarding_steps
      await supabase
        .from("onboarding_steps" as never)
        .upsert(
          {
            profile_id: user.id,
            step_key: "about_you",
            completed: true,
            data: formData,
            completed_at: new Date().toISOString(),
          } as never,
          { onConflict: "profile_id,step_key" },
        );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-steps"] });
      toast.success("Informations enregistrees !");
    },
    onError: () => {
      toast.error("Erreur lors de l'enregistrement");
    },
  });
}

// ─── Admin hook: get onboarding status for a specific client ─────
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
        .update({ onboarding_step: step } as never)
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
