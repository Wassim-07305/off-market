"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";
import type { OnboardingStep } from "@/types/billing";

// ─── Step keys per role ──────────────────────────────────────────
export const ROLE_ONBOARDING_STEPS = {
  admin: ["welcome_video", "admin_setup", "completion"] as const,
  coach: [
    "welcome_video",
    "about_you",
    "coach_tools",
    "feature_tour",
    "completion",
  ] as const,
  client: [
    "welcome_video",
    "about_you",
    "meet_csm",
    "feature_tour",
    "message_test",
    "completion",
  ] as const,
  prospect: [
    "welcome_video",
    "about_you",
    "feature_tour",
    "completion",
  ] as const,
  setter: ["welcome_video", "about_you", "sales_tools", "completion"] as const,
  closer: ["welcome_video", "about_you", "sales_tools", "completion"] as const,
} as const;

// All possible step keys (union of all roles)
export const ALL_STEP_KEYS = [
  "welcome_video",
  "about_you",
  "meet_csm",
  "feature_tour",
  "message_test",
  "admin_setup",
  "coach_tools",
  "sales_tools",
  "completion",
] as const;

// Legacy alias — defaults to client flow
export const ONBOARDING_STEP_KEYS = ROLE_ONBOARDING_STEPS.client;

export type OnboardingStepKey = (typeof ALL_STEP_KEYS)[number];
export type AppRole = keyof typeof ROLE_ONBOARDING_STEPS;

export function getStepsForRole(role: string): readonly OnboardingStepKey[] {
  return ROLE_ONBOARDING_STEPS[role as AppRole] ?? ROLE_ONBOARDING_STEPS.client;
}

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

      // Auto-actions for clients only (not prospects — they have no coach assigned)
      const onboardingRole = profile?.role ?? "client";
      if (onboardingRole !== "prospect") {
        // Auto-action: create a welcome DM channel with the assigned coach
        try {
          const { data: assignment } = await supabase
            .from("coach_assignments")
            .select("coach_id")
            .eq("client_id", user.id)
            .eq("status", "active")
            .limit(1)
            .returns<{ coach_id: string }[]>()
            .maybeSingle();

          const coachId = (assignment as { coach_id?: string } | null)?.coach_id;
          if (coachId) {
            const { data: existingChannels } = await supabase
              .from("channels")
              .select("id, channel_members!inner(profile_id)")
              .eq("type", "dm")
              .returns<Array<{ id: string; channel_members: Array<{ profile_id: string }> }>>();

            const hasDm = (existingChannels ?? []).some((ch) => {
              const members = ch.channel_members ?? [];
              return members.some((m) => m.profile_id === coachId);
            });

            if (!hasDm) {
              const { data: newChannel } = await supabase
                .from("channels")
                .insert({ name: "DM", type: "dm", created_by: user.id } as never)
                .select("id")
                .returns<{ id: string }[]>()
                .single();

              if (newChannel) {
                await supabase.from("channel_members").insert([
                  { channel_id: (newChannel as { id: string }).id, profile_id: user.id },
                  { channel_id: (newChannel as { id: string }).id, profile_id: coachId },
                ] as never);

                await supabase.from("messages").insert({
                  channel_id: (newChannel as { id: string }).id,
                  sender_id: coachId,
                  content: `Bienvenue ! 🎉 Je suis ton coach attitré. N'hésite pas à me poser toutes tes questions ici.`,
                  content_type: "text",
                } as never);
              }
            }
          }
        } catch {
          console.warn("Auto-DM creation skipped");
        }

        // Auto-action: generate contract for client
        try {
          await fetch("/api/contracts/auto-generate", { method: "POST" });
        } catch {
          console.warn("Auto-contract generation skipped");
        }
      }

      // Auto-action: award Newcomer badge
      try {
        const { data: newcomerBadge } = await supabase
          .from("badges")
          .select("id")
          .eq("name", "Newcomer")
          .returns<{ id: string }[]>()
          .maybeSingle();
        if (newcomerBadge) {
          await supabase.from("user_badges").upsert(
            { profile_id: user.id, badge_id: (newcomerBadge as { id: string }).id, earned_at: new Date().toISOString() } as never,
            { onConflict: "profile_id,badge_id", ignoreDuplicates: true },
          );
        }
        // Award onboarding XP
        try {
          await supabase.rpc("award_xp" as never, {
            p_profile_id: user.id,
            p_action: "complete_onboarding",
            p_metadata: {},
          } as never);
        } catch {
          // XP award is non-critical
        }
      } catch {
        console.warn("Badge/XP award skipped");
      }

      // Auto-action: add prospect to CRM pipeline
      if (onboardingRole === "prospect") {
        try {
          await fetch("/api/onboarding/create-crm-contact", { method: "POST" });
        } catch {
          console.warn("Auto CRM contact creation skipped");
        }
      }

      // Auto-action: notify admins of onboarding completion
      try {
        const { data: admins } = await supabase
          .from("profiles")
          .select("id")
          .eq("role", "admin")
          .returns<{ id: string }[]>();

        if (admins?.length) {
          const userName =
            user.user_metadata?.full_name ?? user.email ?? "Un utilisateur";
          await supabase.from("notifications").insert(
            admins.map((admin) => ({
              recipient_id: admin.id,
              type: "system",
              title: "Onboarding terminé",
              body: `${userName} a terminé son onboarding.`,
              data: { link: `/admin/clients` },
            })) as never,
          );
        }
      } catch {
        // Non-critical
        console.warn("Admin notification skipped");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      queryClient.invalidateQueries({ queryKey: ["channels"] });
      queryClient.invalidateQueries({ queryKey: ["pipeline-contacts"] });
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

      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", `avatars/${path}`);
      const uploadRes = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
      });
      if (!uploadRes.ok) throw new Error("Upload failed");

      const { url: urlData_publicUrl } = await uploadRes.json();

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData_publicUrl } as never)
        .eq("id", user.id);
      if (updateError) throw updateError;

      return urlData_publicUrl;
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
export function useOnboardingProgress(userId?: string, role?: string) {
  const supabase = useSupabase();
  const { user, profile } = useAuth();
  const targetId = userId ?? user?.id;
  const effectiveRole = role ?? profile?.role ?? "client";
  const roleSteps = getStepsForRole(effectiveRole);

  const stepsQuery = useQuery({
    queryKey: ["onboarding-steps", targetId],
    queryFn: async () => {
      if (!targetId) return [];
      const { data, error } = await supabase
        .from("onboarding_progress")
        .select("*")
        .eq("user_id", targetId)
        .returns<Array<{ id: string; user_id: string; step: string; completed_at: string | null }>>();
      if (error) return []; // Table might not exist
      return (data ?? []) as Array<{
        id: string;
        user_id: string;
        step: string;
        completed_at: string | null;
      }>;
    },
    enabled: !!targetId,
    retry: false,
  });

  const completedKeys = new Set((stepsQuery.data ?? []).map((s) => s.step));

  const currentStepIndex = roleSteps.findIndex(
    (key) => !completedKeys.has(key),
  );

  return {
    steps: stepsQuery.data ?? [],
    completedKeys,
    roleSteps,
    currentStepIndex:
      currentStepIndex === -1 ? roleSteps.length : currentStepIndex,
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
    }: {
      stepKey: OnboardingStepKey;
      data?: Record<string, unknown>;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Check if already completed
      const { error } = await supabase.from("onboarding_progress").upsert(
        {
          user_id: user.id,
          step: stepKey,
          completed_at: new Date().toISOString(),
        } as never,
        { onConflict: "user_id,step", ignoreDuplicates: true },
      );
      if (error) console.warn("[onboarding] Step save skipped:", error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-steps"] });
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
      try {
        const { data, error } = await supabase
          .from("csm_welcome_videos" as never)
          .select("*")
          .eq("coach_id", coachId)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (error) return null; // Table might not exist
        return (data ?? null) as CsmWelcomeVideo | null;
      } catch {
        return null; // Table doesn't exist — not critical
      }
    },
    enabled: !!coachId,
    retry: false,
  });
}

// ─── Submit onboarding questionnaire data ────────────────────────
export function useOnboardingForm() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  return useMutation({
    mutationFn: async (formData: {
      business_type: string;
      current_revenue: string;
      goals: string;
      how_found_alexia: string;
    }) => {
      if (!user) throw new Error("Not authenticated");

      // Save ALL onboarding data via server API (bypasses RLS)
      const saveRes = await fetch("/api/onboarding/save-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_type: formData.business_type,
          current_revenue: formData.current_revenue,
          goals: formData.goals,
          how_found_alexia: formData.how_found_alexia,
        }),
      });
      if (!saveRes.ok) {
        const err = await saveRes.json().catch(() => ({}));
        console.error("[onboarding] Save profile failed:", err);
      }

      // Auto-assign a CSM/coach via API (bypasses RLS) — only for clients, not prospects
      const currentRole = profile?.role ?? "client";
      if (currentRole !== "prospect") {
        try {
          await fetch("/api/assign-coach", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              client_id: user.id,
              business_type: formData.business_type,
            }),
          });
        } catch {
          // Non-critical — onboarding should not fail because of auto-assignment
          console.warn("[onboarding] Auto-assign CSM skipped");
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding-steps"] });
      queryClient.invalidateQueries({ queryKey: ["coach-assignments"] });
      toast.success("Informations enregistrees !");
    },
    onError: (err) => {
      console.error("[onboarding] Form submit error:", err);
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
