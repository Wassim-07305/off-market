"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useXp } from "@/hooks/use-xp";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  CheckCircle,
  Circle,
  ChevronRight,
  Gift,
  Sparkles,
  Zap,
  User,
  FileText,
  CreditCard,
  Target,
  ClipboardCheck,
  GraduationCap,
  Trophy,
} from "lucide-react";

interface ChecklistItem {
  step: number;
  label: string;
  description: string;
  icon: typeof User;
  xp: number;
  href?: string;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    step: 1,
    label: "Completer ton profil",
    description: "Ajoute ta photo et ta bio",
    icon: User,
    xp: 20,
    href: "/settings",
  },
  {
    step: 2,
    label: "Signer ton contrat",
    description: "Consulte et signe ton contrat",
    icon: FileText,
    xp: 30,
  },
  {
    step: 3,
    label: "Configurer le paiement",
    description: "Verifie tes informations de paiement",
    icon: CreditCard,
    xp: 20,
  },
  {
    step: 4,
    label: "Definir tes objectifs",
    description: "Cree 1 a 3 objectifs de coaching",
    icon: Target,
    xp: 30,
    href: "/goals",
  },
  {
    step: 5,
    label: "Premier check-in",
    description: "Fais ton premier bilan de la semaine",
    icon: ClipboardCheck,
    xp: 25,
    href: "/checkin",
  },
  {
    step: 6,
    label: "Explorer la formation",
    description: "Decouvre les formations disponibles",
    icon: GraduationCap,
    xp: 25,
    href: "/school",
  },
];

const TOTAL_XP = CHECKLIST_ITEMS.reduce((sum, item) => sum + item.xp, 0);

export function OnboardingChecklist() {
  const { profile } = useAuth();
  const { currentStep: step, isComplete: completed } = useOnboarding();
  const { awardXp } = useXp();
  const prefix = useRoutePrefix();

  const completedSteps = useMemo(() => {
    // Steps <= current step are considered completed
    return new Set(
      CHECKLIST_ITEMS.filter((item) => item.step < step).map(
        (item) => item.step,
      ),
    );
  }, [step]);

  const progress = useMemo(() => {
    if (completed) return 100;
    return Math.round((completedSteps.size / CHECKLIST_ITEMS.length) * 100);
  }, [completedSteps, completed]);

  const earnedXp = useMemo(() => {
    return CHECKLIST_ITEMS.filter((item) =>
      completedSteps.has(item.step),
    ).reduce((sum, item) => sum + item.xp, 0);
  }, [completedSteps]);

  // Don't show if onboarding is completed or not a client
  if (completed || profile?.role !== "client") return null;

  return (
    <div
      className="bg-surface rounded-2xl overflow-hidden"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="text-[13px] font-semibold text-foreground">
              Premiers pas
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-600">
            <Zap className="w-3.5 h-3.5" />
            <span className="font-medium">
              {earnedXp}/{TOTAL_XP} XP
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
            <span>
              {completedSteps.size}/{CHECKLIST_ITEMS.length} étapes
            </span>
            <span className="font-mono">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Checklist items */}
      <div className="py-1">
        {CHECKLIST_ITEMS.map((item) => {
          const isCompleted = completedSteps.has(item.step);
          const isCurrent = item.step === step;
          const Icon = item.icon;

          const content = (
            <div
              className={cn(
                "flex items-center gap-3 px-5 py-3 transition-colors",
                isCurrent && "bg-primary/5",
                !isCompleted && !isCurrent && "hover:bg-muted/50",
                isCompleted && "opacity-60",
              )}
            >
              {/* Status icon */}
              <div className="shrink-0">
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-primary" />
                ) : isCurrent ? (
                  <div className="w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                ) : (
                  <Circle className="w-5 h-5 text-muted-foreground/40" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCompleted
                      ? "text-muted-foreground line-through"
                      : "text-foreground",
                  )}
                >
                  {item.label}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {item.description}
                </p>
              </div>

              {/* XP badge */}
              <div className="flex items-center gap-2 shrink-0">
                {!isCompleted && (
                  <span className="text-[10px] font-medium text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <Zap className="w-2.5 h-2.5" />+{item.xp}
                  </span>
                )}
                {item.href && !isCompleted && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
              </div>
            </div>
          );

          if (item.href && !isCompleted) {
            return (
              <Link key={item.step} href={`${prefix}${item.href}`}>
                {content}
              </Link>
            );
          }

          return <div key={item.step}>{content}</div>;
        })}
      </div>

      {/* Completion reward teaser */}
      <div className="px-5 py-3 border-t border-border bg-gradient-to-r from-amber-500/5 to-primary/5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>
            Terminé toutes les étapes pour debloquer le badge{" "}
            <span className="font-medium text-foreground">Newcomer</span> !
          </span>
        </div>
      </div>
    </div>
  );
}
