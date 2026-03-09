"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import confetti from "canvas-confetti";
import { useAuth } from "@/hooks/use-auth";
import { useOnboarding } from "@/hooks/use-onboarding";
import { getDefaultRouteForRole } from "@/lib/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Upload,
  Send,
  User,
  Phone,
  FileText,
} from "lucide-react";

// ─── Role labels ─────────────────────────────────────────────────
const ROLE_LABELS: Record<string, string> = {
  admin: "Administrateur",
  coach: "Coach",
  setter: "Setter",
  closer: "Closer",
  client: "Client",
};

// ─── Step definitions ────────────────────────────────────────────
type StepType = "welcome" | "avatar" | "text" | "textarea" | "summary";

interface Step {
  id: string;
  type: StepType;
  title: string;
  subtitle?: string;
  placeholder?: string;
}

const STEPS: Step[] = [
  {
    id: "welcome",
    type: "welcome",
    title: "Bienvenue chez Off Market",
    subtitle: "On va prendre 1 minute pour completer ton profil.",
  },
  {
    id: "avatar",
    type: "avatar",
    title: "Ta photo de profil",
    subtitle: "Ajoute une photo pour que l'equipe te reconnaisse facilement.",
  },
  {
    id: "phone",
    type: "text",
    title: "Ton numero de telephone",
    subtitle: "Pour que l'equipe puisse te contacter rapidement.",
    placeholder: "06 12 34 56 78",
  },
  {
    id: "bio",
    type: "textarea",
    title: "Presente-toi en quelques mots",
    subtitle: "Ton experience, ton parcours, ce que tu fais ici.",
    placeholder:
      "Ex: Coach business depuis 3 ans, specialise dans le scaling...",
  },
  {
    id: "summary",
    type: "summary",
    title: "Ton profil est pret !",
    subtitle: "Verifie que tout est correct avant de continuer.",
  },
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// ─── Animated background (same pattern as Rivia/ScalingFlow) ─────
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

// ─── Main page ───────────────────────────────────────────────────
export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const { user, profile } = useAuth();
  const {
    completeOnboarding,
    updateProfile,
    uploadAvatar,
  } = useOnboarding();

  const role = profile?.role ?? "client";
  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  // Form state
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");

  const currentStep = STEPS[step];
  const totalSteps = STEPS.length;
  const progress = ((step + 1) / totalSteps) * 100;
  const isFirst = step === 0;
  const isLast = step === totalSteps - 1;

  const saveCurrentStep = useCallback(async () => {
    const stepId = STEPS[step]?.id;
    if (stepId === "phone") {
      updateProfile.mutate({ phone: phone || null });
    } else if (stepId === "bio") {
      updateProfile.mutate({ bio: bio || null });
    }
  }, [step, phone, bio, updateProfile]);

  const goNext = useCallback(() => {
    if (step < totalSteps - 1) {
      if (step > 0) saveCurrentStep();
      setDirection(1);
      setStep((s) => s + 1);
    }
  }, [step, totalSteps, saveCurrentStep]);

  const goPrev = useCallback(() => {
    if (step > 0) {
      setDirection(-1);
      setStep((s) => s - 1);
    }
  }, [step]);

  const handleComplete = useCallback(async () => {
    if (!user) {
      toast.error("Erreur : utilisateur non connecte.");
      return;
    }
    try {
      // Save any remaining data
      saveCurrentStep();
      await completeOnboarding.mutateAsync();
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#C41E3A", "#E8374E", "#f43f5e", "#fb7185", "#ffffff"],
      });
      setTimeout(() => {
        window.location.href = getDefaultRouteForRole(role);
      }, 2000);
    } catch {
      toast.error("Erreur lors de la finalisation");
    }
  }, [user, role, saveCurrentStep, completeOnboarding]);

  const handleAvatarUpload = useCallback(
    async (file: File) => {
      if (file.size > MAX_FILE_SIZE) {
        toast.error("Fichier trop volumineux (max 5 Mo)");
        return;
      }
      try {
        const url = await uploadAvatar.mutateAsync(file);
        setAvatarUrl(url);
      } catch {
        // Error handled by mutation
      }
    },
    [uploadAvatar]
  );

  // Auto-focus inputs
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 350);
    return () => clearTimeout(timer);
  }, [step]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        const tag = (e.target as HTMLElement)?.tagName;
        if (tag === "TEXTAREA") return;
        e.preventDefault();
        if (isLast) {
          handleComplete();
        } else {
          goNext();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isLast, goNext, handleComplete]);

  // ─── Render step content ───────────────────────────────────────
  function renderStep(s: Step) {
    switch (s.type) {
      case "welcome":
        return (
          <div className="flex flex-col items-center text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
              className="mb-8"
            >
              <Image
                src="/logo.png"
                alt="Off Market"
                width={96}
                height={96}
                className="rounded-3xl"
                style={{
                  filter: "drop-shadow(0 0 30px rgba(196, 30, 58, 0.4))",
                }}
                priority
              />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mb-3 text-4xl font-bold tracking-tight text-white sm:text-5xl"
            >
              {firstName ? `Salut ${firstName} !` : s.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-3 max-w-md text-lg text-white/50"
            >
              {s.subtitle}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="mb-10 rounded-xl bg-white/5 px-4 py-2 text-sm text-white/40"
            >
              Ton role :{" "}
              <span className="font-medium text-red-400">
                {ROLE_LABELS[role] ?? role}
              </span>
            </motion.div>
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={goNext}
              className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-red-500 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-red-500/25 transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/40"
            >
              C&apos;est parti
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </div>
        );

      case "avatar":
        return (
          <div className="flex flex-col items-center">
            {avatarUrl ? (
              <div className="group relative mb-6">
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-32 w-32 rounded-3xl border-4 border-red-400/50 object-cover shadow-xl shadow-red-500/20"
                />
                <label className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-3xl bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file);
                      e.target.value = "";
                    }}
                  />
                  <span className="text-sm font-medium text-white">
                    Changer
                  </span>
                </label>
              </div>
            ) : (
              <label className="group mb-6 flex h-32 w-32 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/20 bg-white/5 transition-all duration-200 hover:border-red-400/50 hover:bg-white/10">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAvatarUpload(file);
                    e.target.value = "";
                  }}
                />
                {uploadAvatar.isPending ? (
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                ) : (
                  <>
                    <Upload className="mb-2 h-8 w-8 text-white/40 group-hover:text-red-400" />
                    <span className="text-xs font-medium text-white/40 group-hover:text-white/60">
                      Upload
                    </span>
                  </>
                )}
              </label>
            )}
            <p className="text-sm text-white/30">JPG, PNG — max 5 Mo</p>
          </div>
        );

      case "text":
        return (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="tel"
            placeholder={s.placeholder}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border-b-2 border-white/20 bg-transparent pb-3 text-2xl font-medium text-white placeholder-white/25 outline-none transition-colors focus:border-primary sm:text-3xl"
          />
        );

      case "textarea":
        return (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            placeholder={s.placeholder}
            rows={4}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full resize-none rounded-xl border-2 border-white/20 bg-white/5 px-5 py-4 text-lg text-white placeholder-white/25 outline-none transition-colors focus:border-primary"
          />
        );

      case "summary":
        return (
          <div className="space-y-4">
            {/* Avatar */}
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-14 w-14 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                  <User className="h-6 w-6 text-white/40" />
                </div>
              )}
              <div>
                <p className="text-sm text-white/40">Photo de profil</p>
                <p className="font-medium text-white">
                  {avatarUrl ? "Ajoutee" : "Non renseignee"}
                </p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <Phone className="h-6 w-6 text-white/40" />
              </div>
              <div>
                <p className="text-sm text-white/40">Telephone</p>
                <p className="font-medium text-white">
                  {phone || "Non renseigne"}
                </p>
              </div>
            </div>

            {/* Bio */}
            <div className="flex items-start gap-4 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                <FileText className="h-6 w-6 text-white/40" />
              </div>
              <div>
                <p className="text-sm text-white/40">Bio</p>
                <p className="font-medium text-white">
                  {bio || "Non renseignee"}
                </p>
              </div>
            </div>
          </div>
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
          disabled={isFirst}
          className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
            isFirst
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
            {/* Step title */}
            {currentStep.type !== "welcome" && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  {currentStep.title}
                </h2>
                {currentStep.subtitle && (
                  <p className="mt-2 text-base text-white/40">
                    {currentStep.subtitle}
                  </p>
                )}
              </div>
            )}

            {/* Step content */}
            {renderStep(currentStep)}

            {/* Navigation */}
            {currentStep.type !== "welcome" && (
              <div className="mt-8 flex items-center gap-4">
                {isLast ? (
                  <button
                    onClick={handleComplete}
                    disabled={completeOnboarding.isPending}
                    className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-primary to-red-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-red-500/40 disabled:opacity-50"
                  >
                    {completeOnboarding.isPending ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        C&apos;est parti !
                        <Send className="h-4 w-4" />
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={goNext}
                    className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-white transition-all hover:bg-primary-hover"
                  >
                    OK
                    <CheckCircle className="h-4 w-4" />
                  </button>
                )}
                <span className="text-sm text-white/25">
                  Appuie sur{" "}
                  <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">
                    Entree
                  </kbd>
                </span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
