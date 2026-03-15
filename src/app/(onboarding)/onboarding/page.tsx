"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import {
  useOnboarding,
  useOnboardingProgress,
  useCompleteStep,
  useCsmWelcomeVideo,
  useOnboardingForm,
  ONBOARDING_STEP_KEYS,
} from "@/hooks/use-onboarding";
import { useSupabase } from "@/hooks/use-supabase";
import { useQuery } from "@tanstack/react-query";
import { getDefaultRouteForRole } from "@/lib/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { WelcomeStep } from "@/components/onboarding/welcome-step";
import { AboutYouStep } from "@/components/onboarding/about-you-step";
import type { AboutYouFormData } from "@/components/onboarding/about-you-step";
import { MeetCsmStep } from "@/components/onboarding/meet-csm-step";
import { FeatureTourStep } from "@/components/onboarding/feature-tour-step";
import { MessageTestStep } from "@/components/onboarding/message-test-step";
import { CompletionStep } from "@/components/onboarding/completion-step";

// ─── Animated background ─────────────────────────────────────────
function AnimatedBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden">
      <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-red-500/10 blur-3xl animate-pulse" />
      <div
        className="absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-rose-500/10 blur-3xl"
        style={{ animation: "pulse 4s ease-in-out infinite 1s" }}
      />
      <div
        className="absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-red-400/10 blur-3xl"
        style={{ animation: "pulse 5s ease-in-out infinite 2s" }}
      />
    </div>
  );
}

// ─── Step labels for progress bar ────────────────────────────────
const STEP_LABELS = [
  "Accueil",
  "Ton profil",
  "Ton coach",
  "Visite guidee",
  "Premier message",
  "Termine !",
];

// ─── Main page ───────────────────────────────────────────────────
export default function OnboardingPage() {
  const { user, profile } = useAuth();
  const { completeOnboarding } = useOnboarding();
  const { currentStepIndex } = useOnboardingProgress();
  const completeStep = useCompleteStep();
  const onboardingForm = useOnboardingForm();
  const supabase = useSupabase();

  const role = profile?.role ?? "client";
  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  // Determine current wizard step — start from the first incomplete step
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Sync initial step from progress
  useEffect(() => {
    if (
      currentStepIndex > 0 &&
      currentStepIndex < ONBOARDING_STEP_KEYS.length
    ) {
      setStep(currentStepIndex);
    }
  }, [currentStepIndex]);

  // Fetch assigned coach (CSM) for the current user
  const csmQuery = useQuery({
    queryKey: ["my-csm", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from("coach_assignments" as never)
        .select(
          "coach:profiles!coach_assignments_coach_id_fkey(id, full_name, avatar_url, bio)",
        )
        .eq("client_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();
      const row = data as {
        coach: {
          id: string;
          full_name: string;
          avatar_url: string | null;
          bio: string | null;
        };
      } | null;
      return row?.coach ?? null;
    },
    enabled: !!user,
  });

  const csmVideo = useCsmWelcomeVideo(csmQuery.data?.id);

  const totalSteps = ONBOARDING_STEP_KEYS.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const goNext = useCallback(() => {
    if (step < totalSteps - 1) {
      setDirection(1);
      setStep((s) => s + 1);
    }
  }, [step, totalSteps]);

  const goPrev = useCallback(() => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  }, [step]);

  const handleStepComplete = useCallback(
    (
      stepKey: (typeof ONBOARDING_STEP_KEYS)[number],
      data?: Record<string, unknown>,
    ) => {
      completeStep.mutate({ stepKey, data });
      goNext();
    },
    [completeStep, goNext],
  );

  const handleAboutYouSubmit = useCallback(
    (data: AboutYouFormData) => {
      onboardingForm.mutate(data, {
        onSuccess: () => {
          goNext();
        },
      });
    },
    [onboardingForm, goNext],
  );

  const handleComplete = useCallback(async () => {
    if (!user) {
      toast.error("Erreur : utilisateur non connecte.");
      return;
    }
    try {
      completeStep.mutate({ stepKey: "completion" });
      await completeOnboarding.mutateAsync();
      setTimeout(() => {
        window.location.href = getDefaultRouteForRole(role);
      }, 2500);
    } catch {
      toast.error("Erreur lors de la finalisation");
    }
  }, [user, role, completeStep, completeOnboarding]);

  // ─── Render current step ──────────────────────────────────────
  function renderStep() {
    const stepKey = ONBOARDING_STEP_KEYS[step];

    switch (stepKey) {
      case "welcome_video":
        return (
          <WelcomeStep
            firstName={firstName}
            onNext={() => handleStepComplete("welcome_video")}
          />
        );

      case "about_you":
        return (
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Parle-nous de toi
              </h2>
              <p className="mt-2 text-base text-white/40">
                Ces informations nous permettent de personnaliser ton
                experience.
              </p>
            </div>
            <AboutYouStep
              onSubmit={handleAboutYouSubmit}
              isSubmitting={onboardingForm.isPending}
            />
          </div>
        );

      case "meet_csm":
        return (
          <div>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Ton coach dedie
              </h2>
              <p className="mt-2 text-base text-white/40">
                Il t&apos;accompagnera tout au long de ton parcours.
              </p>
            </div>
            <MeetCsmStep
              csm={csmQuery.data ?? null}
              videoUrl={csmVideo.data?.video_url ?? null}
              thumbnailUrl={csmVideo.data?.thumbnail_url ?? null}
              onNext={() => handleStepComplete("meet_csm")}
              isLoading={csmQuery.isLoading}
            />
          </div>
        );

      case "feature_tour":
        return (
          <div>
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Decouvre la plateforme
              </h2>
              <p className="mt-2 text-base text-white/40">
                Un apercu des outils a ta disposition.
              </p>
            </div>
            <FeatureTourStep
              onNext={() => handleStepComplete("feature_tour")}
            />
          </div>
        );

      case "message_test":
        return (
          <div>
            <MessageTestStep
              onNext={() => handleStepComplete("message_test")}
            />
          </div>
        );

      case "completion":
        return (
          <CompletionStep
            firstName={firstName}
            onComplete={handleComplete}
            isCompleting={completeOnboarding.isPending}
          />
        );

      default:
        return null;
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br from-slate-950 via-red-950 to-slate-900">
      <AnimatedBackground />

      {/* Progress bar */}
      <div className="fixed left-0 right-0 top-0 z-50 h-1 bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-red-400"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </div>

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-5">
        <button
          onClick={goPrev}
          disabled={step === 0}
          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
            step === 0
              ? "cursor-not-allowed opacity-0"
              : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
          }`}
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="Off Market"
            width={24}
            height={24}
            className="rounded-md"
          />
          <span className="text-sm font-medium text-white/60">Off Market</span>
        </div>

        <span className="text-sm tabular-nums text-white/30">
          {step + 1}/{totalSteps}
        </span>
      </div>

      {/* Step labels */}
      <div className="relative z-10 mx-auto flex w-full max-w-2xl items-center justify-center gap-1 px-6 mb-4">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-1">
            <div
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                i <= step ? "bg-primary" : "bg-white/15"
              }`}
            />
            <span
              className={`text-[10px] transition-colors duration-300 hidden sm:inline ${
                i === step ? "text-white/70 font-medium" : "text-white/25"
              }`}
            >
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-8">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ y: direction > 0 ? 40 : -40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: direction > 0 ? -40 : 40, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
