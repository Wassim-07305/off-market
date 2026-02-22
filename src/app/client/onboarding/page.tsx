"use client";

import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, defaultTransition } from "@/lib/animations";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useContracts } from "@/hooks/use-contracts";
import { useAuth } from "@/hooks/use-auth";
import { ONBOARDING_STEPS } from "@/types/billing";
import {
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  User,
  FileText,
  CreditCard,
  GraduationCap,
  PartyPopper,
} from "lucide-react";

const STEP_ICONS = [Sparkles, User, FileText, CreditCard, GraduationCap, PartyPopper];

export default function ClientOnboardingPage() {
  const { user, profile } = useAuth();
  const { currentStep, isComplete, nextStep, prevStep, isUpdating } = useOnboarding();
  const { contracts, signContract } = useContracts({ clientId: user?.id, status: "sent" });

  const StepIcon = STEP_ICONS[currentStep] ?? Sparkles;

  if (isComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto text-center py-16"
      >
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
          <PartyPopper className="w-8 h-8 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">
          Bienvenue chez Off Market !
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Votre onboarding est termine. Vous avez acces a toutes les fonctionnalites.
        </p>
        <a
          href="/client/dashboard"
          className="inline-flex items-center gap-2 h-10 px-6 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Acceder au dashboard
          <ChevronRight className="w-4 h-4" />
        </a>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      {/* Progress */}
      <div className="flex items-center gap-1 mb-8">
        {ONBOARDING_STEPS.map((s, i) => (
          <div key={i} className="flex-1 flex items-center gap-1">
            <div
              className={`h-1.5 rounded-full flex-1 transition-colors ${
                i <= currentStep ? "bg-primary" : "bg-border"
              }`}
            />
          </div>
        ))}
      </div>

      {/* Step card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          exit="hidden"
          transition={defaultTransition}
          className="bg-surface border border-border rounded-2xl p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <StepIcon className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                Etape {currentStep + 1} / {ONBOARDING_STEPS.length}
              </p>
              <h2 className="text-xl font-semibold text-foreground">
                {ONBOARDING_STEPS[currentStep].label}
              </h2>
            </div>
          </div>

          {/* Step content */}
          {currentStep === 0 && <StepWelcome />}
          {currentStep === 1 && <StepProfile name={profile?.full_name ?? ""} />}
          {currentStep === 2 && (
            <StepContract
              contracts={contracts}
              onSign={(id) =>
                signContract.mutate({
                  id,
                  signatureData: {
                    ip_address: "client",
                    user_agent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
                  },
                })
              }
              isSigning={signContract.isPending}
            />
          )}
          {currentStep === 3 && <StepPayment />}
          {currentStep === 4 && <StepFormation />}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
            <button
              onClick={prevStep}
              disabled={currentStep === 0 || isUpdating}
              className="h-10 px-4 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted transition-colors disabled:opacity-30 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Precedent
            </button>
            <button
              onClick={nextStep}
              disabled={isUpdating}
              className="h-10 px-6 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {currentStep === 4 ? "Terminer" : "Suivant"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function StepWelcome() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-foreground leading-relaxed">
        Bienvenue dans votre espace Off Market ! Nous allons configurer votre compte en quelques
        etapes simples.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Ce processus prend environ 5 minutes et vous permettra d&apos;acceder a :
      </p>
      <ul className="space-y-2 text-sm text-muted-foreground">
        <li className="flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Votre espace de formation
        </li>
        <li className="flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500 shrink-0" /> La messagerie avec votre coach
        </li>
        <li className="flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500 shrink-0" /> Le suivi de votre progression
        </li>
      </ul>
    </div>
  );
}

function StepProfile({ name }: { name: string }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-foreground leading-relaxed">
        Votre profil est configure avec le nom : <strong>{name || "Non renseigne"}</strong>
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Vous pourrez completer votre profil plus tard dans les reglages (photo, bio, etc.).
      </p>
    </div>
  );
}

function StepContract({
  contracts,
  onSign,
  isSigning,
}: {
  contracts: { id: string; title: string; status: string }[];
  onSign: (id: string) => void;
  isSigning: boolean;
}) {
  if (contracts.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Aucun contrat en attente de signature. Votre coach vous enverra un contrat bientot.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-foreground leading-relaxed">
        Vous avez {contracts.length} contrat(s) a signer :
      </p>
      <div className="space-y-2">
        {contracts.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{c.title}</p>
            </div>
            <button
              onClick={() => onSign(c.id)}
              disabled={isSigning}
              className="h-8 px-3 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isSigning ? "..." : "Signer"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepPayment() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-foreground leading-relaxed">
        Le paiement sera configure par votre coach. Vous recevrez vos factures directement dans
        votre espace.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Vous pourrez consulter vos factures et l&apos;historique de vos paiements a tout moment.
      </p>
    </div>
  );
}

function StepFormation() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-foreground leading-relaxed">
        Votre formation est prete ! Une fois l&apos;onboarding termine, vous aurez acces a tous
        les modules et lecons.
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Cliquez sur &quot;Terminer&quot; pour acceder a votre dashboard et commencer votre parcours.
      </p>
    </div>
  );
}
