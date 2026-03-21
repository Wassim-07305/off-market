"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useAuth } from "@/hooks/use-auth";
import {
  useOnboarding,
  useOnboardingProgress,
  useCompleteStep,
  useCsmWelcomeVideo,
  useOnboardingForm,
  getStepsForRole,
  type OnboardingStepKey,
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
import { AdminSetupStep } from "@/components/onboarding/admin-setup-step";
import { CoachToolsStep } from "@/components/onboarding/coach-tools-step";
import { SalesToolsStep } from "@/components/onboarding/sales-tools-step";

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

// ─── Step labels per role ─────────────────────────────────────────
const STEP_LABELS: Record<string, Record<string, string>> = {
  admin: {
    welcome_video: "Accueil",
    admin_setup: "Configuration",
    completion: "Termine !",
  },
  coach: {
    welcome_video: "Accueil",
    about_you: "Ton profil",
    coach_tools: "Tes outils",
    feature_tour: "Visite guidee",
    completion: "Termine !",
  },
  client: {
    welcome_video: "Accueil",
    about_you: "Ton profil",
    meet_csm: "Ton coach",
    feature_tour: "Visite guidee",
    message_test: "Premier message",
    completion: "Termine !",
  },
  prospect: {
    welcome_video: "Accueil",
    about_you: "Ton profil",
    feature_tour: "Decouvrir",
    completion: "Termine !",
  },
  setter: {
    welcome_video: "Accueil",
    about_you: "Ton profil",
    sales_tools: "Pipeline & appels",
    completion: "Termine !",
  },
  closer: {
    welcome_video: "Accueil",
    about_you: "Ton profil",
    sales_tools: "Appels & contrats",
    completion: "Termine !",
  },
};

// ─── Completed items per role (for CompletionStep) ────────────────
const COMPLETED_ITEMS: Record<string, string[]> = {
  admin: ["Video d'accueil regardee", "Plateforme configuree"],
  coach: [
    "Video d'accueil regardee",
    "Profil complete",
    "Outils de coaching decouverts",
    "Visite de la plateforme",
  ],
  client: [
    "Video d'accueil regardee",
    "Profil business complete",
    "CSM rencontre",
    "Visite de la plateforme",
    "Premier message envoye",
  ],
  prospect: [
    "Video d'accueil regardee",
    "Profil complete",
    "Plateforme decouverte",
  ],
  setter: [
    "Video d'accueil regardee",
    "Profil complete",
    "Pipeline et outils decouverts",
  ],
  closer: [
    "Video d'accueil regardee",
    "Profil complete",
    "Outils de closing decouverts",
  ],
};

// ─── Main page ───────────────────────────────────────────────────
export default function OnboardingPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const { completeOnboarding } = useOnboarding();
  const supabase = useSupabase();

  const role = profile?.role ?? "client";
  const roleSteps = getStepsForRole(role) as readonly OnboardingStepKey[];
  const { currentStepIndex } = useOnboardingProgress(undefined, role);
  const completeStep = useCompleteStep();
  const onboardingForm = useOnboardingForm();

  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  // Redirect if already onboarded
  useEffect(() => {
    if (profile?.onboarding_completed) {
      router.push(getDefaultRouteForRole(role));
    }
  }, [profile?.onboarding_completed, role, router]);

  // Determine current wizard step
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // Sync initial step from progress
  useEffect(() => {
    if (currentStepIndex > 0 && currentStepIndex < roleSteps.length) {
      setStep(currentStepIndex);
    }
  }, [currentStepIndex, roleSteps.length]);

  // Fetch assigned coach (CSM) — only for client role
  const csmQuery = useQuery({
    queryKey: ["my-csm", user?.id],
    queryFn: async () => {
      if (!user) return null;
      // Fetch assignment first
      const { data: assignment } = await supabase
        .from("coach_assignments")
        .select("coach_id")
        .eq("client_id", user.id)
        .eq("status", "active")
        .limit(1)
        .maybeSingle();

      if (!assignment) return null;

      // Then fetch coach profile
      const { data: coach } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, bio")
        .eq("id", assignment.coach_id)
        .maybeSingle();

      return coach as {
        id: string;
        full_name: string;
        avatar_url: string | null;
        bio: string | null;
      } | null;
    },
    enabled: !!user && role === "client",
  });

  const csmVideo = useCsmWelcomeVideo(csmQuery.data?.id);

  const totalSteps = roleSteps.length;
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
    (stepKey: OnboardingStepKey) => {
      completeStep.mutate({ stepKey });
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

      // Supprime le cache middleware pour forcer un re-fetch du profil
      document.cookie = "om_profile_cache=; path=/; max-age=0; SameSite=Lax";

      setTimeout(() => {
        window.location.href = getDefaultRouteForRole(role);
      }, 2500);
    } catch {
      toast.error("Erreur lors de la finalisation");
    }
  }, [user, role, completeStep, completeOnboarding]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
      </div>
    );
  }

  // ─── Render current step by key ─────────────────────────────────
  function renderStep() {
    const stepKey = roleSteps[step];

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

      case "admin_setup":
        return (
          <AdminSetupStep onNext={() => handleStepComplete("admin_setup")} />
        );

      case "coach_tools":
        return (
          <CoachToolsStep onNext={() => handleStepComplete("coach_tools")} />
        );

      case "sales_tools":
        return (
          <SalesToolsStep
            onNext={() => handleStepComplete("sales_tools")}
            variant={role === "closer" ? "closer" : "setter"}
          />
        );

      case "completion":
        return (
          <CompletionStep
            firstName={firstName}
            onComplete={handleComplete}
            isCompleting={completeOnboarding.isPending}
            completedItems={COMPLETED_ITEMS[role] ?? COMPLETED_ITEMS.client}
          />
        );

      default:
        return null;
    }
  }

  const labels = STEP_LABELS[role] ?? STEP_LABELS.client;

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-br  from-slate-950 via-red-950 to-slate-900 ">
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
            className="rounded-sm"
          />
          <span className="text-sm font-medium text-white/60">Off Market</span>
        </div>

        <span className="text-sm tabular-nums text-white/30">
          {step + 1}/{totalSteps}
        </span>
      </div>

      {/* Step labels */}
      <div className="relative z-10 mx-auto flex w-full max-w-2xl items-center justify-center gap-1 px-6 mb-4">
        {roleSteps.map((key, i) => (
          <div key={key} className="flex items-center gap-1">
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
              {labels[key] ?? key}
            </span>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-8 ">
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
