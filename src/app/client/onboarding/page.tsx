"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { fadeInUp, defaultTransition } from "@/lib/animations";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useContracts } from "@/hooks/use-contracts";
import { useCourses } from "@/hooks/use-courses";
import { useInvoices } from "@/hooks/use-invoices";
import { useCoachingGoals } from "@/hooks/use-coaching-goals";
import { useCheckins } from "@/hooks/use-checkins";
import { useAuth } from "@/hooks/use-auth";
import { useSupabase } from "@/hooks/use-supabase";
import { ONBOARDING_STEPS } from "@/types/billing";
import { MOOD_CONFIG } from "@/types/coaching";
import type { Mood } from "@/types/coaching";
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
  Target,
  ClipboardCheck,
  Plus,
  X,
} from "lucide-react";

const STEP_ICONS = [Sparkles, User, FileText, CreditCard, Target, ClipboardCheck, GraduationCap, PartyPopper];

export default function ClientOnboardingPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { currentStep, isComplete, nextStep, prevStep, completeOnboarding, isUpdating } = useOnboarding();
  const { contracts, signContract } = useContracts({ clientId: user?.id, status: "sent" });

  const StepIcon = STEP_ICONS[currentStep] ?? Sparkles;

  const handleNext = () => {
    if (currentStep === 6) {
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
          {currentStep === 4 && <StepGoals userId={user?.id} />}
          {currentStep === 5 && <StepCheckin userId={user?.id} />}
          {currentStep === 6 && <StepFormation />}

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
              {currentStep === 6 ? "Terminer" : "Suivant"}
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
        <li className="flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-500 shrink-0" /> La definition de vos objectifs
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

// ─── NEW: Step Objectifs ─────────────────
function StepGoals({ userId }: { userId: string | undefined }) {
  const { goals, createGoal } = useCoachingGoals();
  const [drafts, setDrafts] = useState<{ title: string; description: string }[]>(
    goals.length > 0
      ? []
      : [{ title: "", description: "" }]
  );

  const addDraft = () => {
    if (drafts.length >= 3) return;
    setDrafts([...drafts, { title: "", description: "" }]);
  };

  const removeDraft = (index: number) => {
    setDrafts(drafts.filter((_, i) => i !== index));
  };

  const updateDraft = (index: number, field: "title" | "description", value: string) => {
    const updated = [...drafts];
    updated[index] = { ...updated[index], [field]: value };
    setDrafts(updated);
  };

  const handleSaveAll = async () => {
    if (!userId) return;
    const valid = drafts.filter((d) => d.title.trim());
    if (valid.length === 0 && goals.length === 0) {
      toast.error("Definissez au moins un objectif");
      return;
    }

    for (const draft of valid) {
      await createGoal.mutateAsync({
        client_id: userId,
        title: draft.title.trim(),
        description: draft.description.trim() || undefined,
      });
    }
    setDrafts([]);
    toast.success(`${valid.length} objectif${valid.length > 1 ? "s" : ""} cree${valid.length > 1 ? "s" : ""}`);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-foreground leading-relaxed">
        Definissez 1 a 3 objectifs pour guider votre accompagnement. Votre coach pourra les suivre et vous aider a les atteindre.
      </p>

      {/* Existing goals */}
      {goals.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Objectifs deja definis :</p>
          {goals.map((g) => (
            <div key={g.id} className="flex items-center gap-2 p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/20">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">{g.title}</p>
                {g.description && <p className="text-xs text-muted-foreground">{g.description}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Draft goals */}
      {drafts.map((draft, i) => (
        <div key={i} className="bg-muted/30 rounded-xl p-4 space-y-3 relative">
          {drafts.length > 1 && (
            <button
              onClick={() => removeDraft(i)}
              className="absolute top-3 right-3 p-1 rounded-lg hover:bg-muted text-muted-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Objectif {goals.length + i + 1}
            </label>
            <input
              type="text"
              value={draft.title}
              onChange={(e) => updateDraft(i, "title", e.target.value)}
              placeholder="Ex: Atteindre 5000 EUR/mois de CA"
              className="w-full h-10 px-3 bg-muted/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1">
              Description (optionnel)
            </label>
            <input
              type="text"
              value={draft.description}
              onChange={(e) => updateDraft(i, "description", e.target.value)}
              placeholder="Precision sur l'objectif..."
              className="w-full h-10 px-3 bg-muted/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        {drafts.length + goals.length < 3 && (
          <button
            onClick={addDraft}
            className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter un objectif
          </button>
        )}
        {drafts.some((d) => d.title.trim()) && (
          <button
            onClick={handleSaveAll}
            disabled={createGoal.isPending}
            className="h-9 px-4 bg-foreground text-background rounded-lg text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {createGoal.isPending ? "Enregistrement..." : "Enregistrer"}
          </button>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Vous pourrez modifier ou ajouter des objectifs plus tard depuis votre espace.
      </p>
    </div>
  );
}

// ─── NEW: Step Premier Check-in ──────────
function StepCheckin({ userId }: { userId: string | undefined }) {
  const { submitCheckin } = useCheckins();
  const [mood, setMood] = useState<Mood | null>(null);
  const [win, setWin] = useState("");
  const [goalNextWeek, setGoalNextWeek] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!mood) {
      toast.error("Selectionnez votre humeur");
      return;
    }

    // week_start = Monday of current week
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    const weekStart = monday.toISOString().split("T")[0];

    await submitCheckin.mutateAsync({
      week_start: weekStart,
      mood,
      win: win.trim() || undefined,
      goal_next_week: goalNextWeek.trim() || undefined,
    });
    setSaved(true);
    toast.success("Premier check-in enregistre !");
  };

  if (saved) {
    return (
      <div className="space-y-3 text-center py-4">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto">
          <Check className="w-6 h-6 text-emerald-500" />
        </div>
        <p className="text-sm font-medium text-foreground">Premier check-in enregistre !</p>
        <p className="text-xs text-muted-foreground">
          Vous recevrez un rappel chaque semaine pour completer votre bilan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-foreground leading-relaxed">
        Faites votre premier bilan hebdomadaire. Ce rituel vous aidera a suivre votre progression chaque semaine.
      </p>

      {/* Mood selector */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-2">
          Comment vous sentez-vous ?
        </label>
        <div className="flex gap-2">
          {([1, 2, 3, 4, 5] as Mood[]).map((m) => {
            const config = MOOD_CONFIG[m];
            return (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={`flex-1 flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                  mood === m
                    ? "border-primary bg-primary/5 scale-105"
                    : "border-border hover:bg-muted"
                }`}
              >
                <span className="text-2xl">{config.emoji}</span>
                <span className="text-[10px] text-muted-foreground">{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Win */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          Votre victoire de la semaine
        </label>
        <input
          type="text"
          value={win}
          onChange={(e) => setWin(e.target.value)}
          placeholder="Ex: J'ai signe mon premier client !"
          className="w-full h-10 px-3 bg-muted/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Goal next week */}
      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          Objectif pour la semaine prochaine
        </label>
        <input
          type="text"
          value={goalNextWeek}
          onChange={(e) => setGoalNextWeek(e.target.value)}
          placeholder="Ex: Contacter 10 prospects"
          className="w-full h-10 px-3 bg-muted/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={!mood || submitCheckin.isPending}
        className="h-9 px-4 bg-foreground text-background rounded-lg text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {submitCheckin.isPending ? "Enregistrement..." : "Valider le check-in"}
      </button>
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
