"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, defaultTransition } from "@/lib/animations";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useContracts } from "@/hooks/use-contracts";
import { useCourses } from "@/hooks/use-courses";
import { useInvoices } from "@/hooks/use-invoices";
import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/hooks/use-supabase";
import { ONBOARDING_STEPS } from "@/types/billing";
import { toast } from "sonner";
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
  BookOpen,
  Loader2,
} from "lucide-react";

const STEP_ICONS = [Sparkles, User, FileText, CreditCard, GraduationCap, PartyPopper];

export default function ClientOnboardingPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { currentStep, isComplete, nextStep, prevStep, completeOnboarding, isUpdating } = useOnboarding();
  const { contracts, signContract } = useContracts({ clientId: user?.id, status: "sent" });

  const StepIcon = STEP_ICONS[currentStep] ?? Sparkles;

  const handleNext = () => {
    if (currentStep === 4) {
      completeOnboarding.mutate(undefined, {
        onSuccess: () => {
          toast.success("Onboarding termine !");
          router.push("/client/dashboard");
        },
      });
    } else {
      nextStep();
    }
  };

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
        {ONBOARDING_STEPS.map((_, i) => (
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
          {currentStep === 1 && <StepProfile userId={user?.id} profile={profile} />}
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
          {currentStep === 3 && <StepPayment userId={user?.id} />}
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
              onClick={handleNext}
              disabled={isUpdating || completeOnboarding.isPending}
              className="h-10 px-6 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {(isUpdating || completeOnboarding.isPending) && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
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

function StepProfile({
  userId,
  profile,
}: {
  userId: string | undefined;
  profile: { full_name?: string | null; phone?: string | null; bio?: string | null } | null;
}) {
  const supabase = useSupabase();
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ phone: phone || null, bio: bio || null })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      toast.error("Erreur lors de la sauvegarde");
    } else {
      toast.success("Profil mis a jour");
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground leading-relaxed">
        Completez votre profil pour que votre coach puisse mieux vous connaitre.
      </p>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Nom</label>
        <input
          type="text"
          value={profile?.full_name ?? ""}
          disabled
          className="w-full h-10 px-3 bg-muted/50 rounded-lg text-sm text-muted-foreground"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Telephone</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="06 12 34 56 78"
          className="w-full h-10 px-3 bg-muted/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Bio</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Parlez-nous de vous, votre activite, vos objectifs..."
          rows={3}
          className="w-full px-3 py-2 bg-muted/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
        />
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="h-9 px-4 bg-foreground text-background rounded-lg text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
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

function StepPayment({ userId }: { userId: string | undefined }) {
  const { invoices, isLoading } = useInvoices({ clientId: userId });
  const pending = invoices?.filter((inv) => inv.status === "sent" || inv.status === "overdue") ?? [];

  return (
    <div className="space-y-3">
      <p className="text-sm text-foreground leading-relaxed">
        Consultez vos factures et paiements.
      </p>
      {isLoading ? (
        <div className="h-12 bg-muted/50 rounded-lg animate-shimmer" />
      ) : pending.length > 0 ? (
        <div className="space-y-2">
          {pending.map((inv) => (
            <div key={inv.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Facture #{inv.invoice_number}</p>
                <p className="text-xs text-muted-foreground">{Number(inv.total).toFixed(2)} EUR</p>
              </div>
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-500/10 text-amber-600">
                {inv.status === "overdue" ? "En retard" : "En attente"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Aucune facture en attente. Tout est a jour !</p>
      )}
      <p className="text-xs text-muted-foreground">
        Retrouvez toutes vos factures dans la section Facturation de votre espace.
      </p>
    </div>
  );
}

function StepFormation() {
  const { data: courses, isLoading } = useCourses("published");
  return (
    <div className="space-y-3">
      <p className="text-sm text-foreground leading-relaxed">
        Voici les formations disponibles :
      </p>
      {isLoading ? (
        <div className="space-y-2">
          <div className="h-12 bg-muted/50 rounded-lg animate-shimmer" />
          <div className="h-12 bg-muted/50 rounded-lg animate-shimmer" />
        </div>
      ) : courses && courses.length > 0 ? (
        <div className="space-y-2">
          {courses.map((course) => {
            const totalLessons = course.modules?.reduce(
              (acc, m) => acc + (m.lessons?.length ?? 0), 0
            ) ?? 0;
            return (
              <div
                key={course.id}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{course.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {course.modules?.length ?? 0} module{(course.modules?.length ?? 0) !== 1 ? "s" : ""} · {totalLessons} lecon{totalLessons !== 1 ? "s" : ""}
                  </p>
                </div>
                <GraduationCap className="w-4 h-4 text-muted-foreground shrink-0" />
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Aucune formation disponible pour le moment.
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Cliquez sur &quot;Terminer&quot; pour acceder a votre dashboard et commencer votre parcours.
      </p>
    </div>
  );
}
