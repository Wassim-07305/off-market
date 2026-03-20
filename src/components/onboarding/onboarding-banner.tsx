"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { useWalkthrough } from "./walkthrough-provider";
import type { WalkthroughStep } from "./walkthrough-provider";
import { Sparkles, X, ArrowRight, MapPin } from "lucide-react";

const PLATFORM_TOUR: WalkthroughStep[] = [
  {
    target: "[data-tour='dashboard']",
    title: "Ton tableau de bord",
    content:
      "Retrouve ici un apercu de ta progression, tes stats et ton activite.",
    placement: "bottom",
  },
  {
    target: "[data-tour='school']",
    title: "Tes formations",
    content:
      "Accede a toutes les formations disponibles. Progresse a ton rythme !",
    placement: "right",
  },
  {
    target: "[data-tour='messaging']",
    title: "Messagerie",
    content: "Communique directement avec ton coach et les autres membres.",
    placement: "right",
  },
  {
    target: "[data-tour='community']",
    title: "Communaute",
    content: "Partage tes victoires et echange avec la communaute Off Market.",
    placement: "right",
  },
  {
    target: "[data-tour='checkin']",
    title: "Check-in hebdomadaire",
    content: "Chaque semaine, fais ton bilan pour suivre ta progression.",
    placement: "right",
  },
];

export function OnboardingBanner() {
  const { profile } = useAuth();
  const { currentStep: step, isComplete: completed } = useOnboarding();
  const prefix = useRoutePrefix();
  const { startTour } = useWalkthrough();
  const [dismissed, setDismissed] = useState(false);

  // Only show for clients with incomplete onboarding
  if (dismissed || completed || (profile?.role !== "client" && profile?.role !== "prospect") || step >= 7)
    return null;

  return (
    <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-2xl p-4 flex items-center gap-4">
      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Sparkles className="w-5 h-5 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">
          Bienvenue sur Off Market !
        </p>
        <p className="text-[12px] text-muted-foreground mt-0.5">
          Complete ton onboarding pour debloquer toutes les fonctionnalites et
          gagner de l&apos;XP.
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => startTour(PLATFORM_TOUR)}
          className="h-8 px-3 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center gap-1.5"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Visite guidee</span>
        </button>
        <Link
          href={`${prefix}/onboarding`}
          className="h-8 px-3 rounded-xl bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center gap-1.5"
        >
          Continuer
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <X className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}
