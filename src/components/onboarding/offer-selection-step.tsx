"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  ArrowRight,
  Crown,
  Sparkles,
  Zap,
  MessageCircle,
  Kanban,
  Users,
  GraduationCap,
  CalendarCheck,
  BarChart3,
  Trophy,
  Bot,
  FileSignature,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useOnboardingOffers,
  useSelectOffer,
} from "@/hooks/use-onboarding-offers";

// ─── Module display config ───────────────────────────────────
const MODULE_LABELS: Record<string, { label: string; icon: typeof Check }> = {
  crm: { label: "CRM Clients", icon: Users },
  messaging: { label: "Messagerie", icon: MessageCircle },
  pipeline: { label: "Pipeline commercial", icon: Kanban },
  formations: { label: "Formations (LMS)", icon: GraduationCap },
  coaching: { label: "Sessions coaching", icon: CalendarCheck },
  analytics: { label: "Analytics & KPIs", icon: BarChart3 },
  gamification: { label: "Gamification & XP", icon: Trophy },
  community: { label: "Communauté", icon: Users },
  ai_assistant: { label: "AlexIA", icon: Bot },
  contracts: { label: "Contrats & signatures", icon: FileSignature },
};

// ─── Offer card styling per slug ─────────────────────────────
const OFFER_STYLES: Record<
  string,
  {
    borderColor: string;
    selectedRing: string;
    gradient: string;
    iconBg: string;
    badge?: string;
  }
> = {
  starter: {
    borderColor: "border-white/10",
    selectedRing: "ring-white/40",
    gradient: "from-stone-500/10 to-stone-600/5",
    iconBg: "bg-stone-500/20 text-stone-300",
  },
  growth: {
    borderColor: "border-[#DC2626]/40",
    selectedRing: "ring-[#DC2626]",
    gradient: "from-[#DC2626]/10 to-red-600/5",
    iconBg: "bg-[#DC2626]/20 text-red-400",
    badge: "Recommandé",
  },
  premium: {
    borderColor: "border-amber-500/40",
    selectedRing: "ring-amber-500",
    gradient: "from-amber-500/10 to-amber-600/5",
    iconBg: "bg-amber-500/20 text-amber-300",
  },
};

interface OfferSelectionStepProps {
  onNext: () => void;
}

export function OfferSelectionStep({ onNext }: OfferSelectionStepProps) {
  const { data: offers, isLoading } = useOnboardingOffers();
  const selectOffer = useSelectOffer();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selectedId) return;
    selectOffer.mutate(selectedId, {
      onSuccess: () => onNext(),
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-10"
      >
        <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500/20 to-[#DC2626]/20 border border-amber-500/30 px-4 py-1.5 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-medium text-amber-300">
            Choisis ton offre
          </span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-3 sm:text-4xl">
          Quelle formule te correspond ?
        </h2>
        <p className="text-base text-white/50 max-w-md mx-auto">
          Sélectionne l&apos;offre adaptée à tes objectifs. Tu pourras changer à
          tout moment.
        </p>
      </motion.div>

      {/* Offer cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {(offers ?? []).map((offer, index) => {
          const style = OFFER_STYLES[offer.slug] ?? OFFER_STYLES.starter;
          const isSelected = selectedId === offer.id;
          const isPremium = offer.slug === "premium";

          return (
            <motion.button
              key={offer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              onClick={() => setSelectedId(offer.id)}
              className={cn(
                "relative text-left rounded-2xl border p-5 transition-all duration-300",
                "hover:scale-[1.02] hover:shadow-xl hover:shadow-black/20",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black",
                style.borderColor,
                isSelected
                  ? `ring-2 ${style.selectedRing} bg-gradient-to-b ${style.gradient} shadow-lg`
                  : "bg-white/[0.03] hover:bg-white/[0.06]",
              )}
            >
              {/* Recommended badge */}
              {style.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                  <div className="flex items-center gap-1 rounded-full bg-[#DC2626] px-3 py-1 shadow-lg shadow-red-500/30">
                    <Zap className="w-3 h-3 text-white" />
                    <span className="text-[11px] font-semibold text-white whitespace-nowrap">
                      {style.badge}
                    </span>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    style.iconBg,
                  )}
                >
                  {isPremium ? (
                    <Crown className="w-5 h-5" />
                  ) : offer.slug === "growth" ? (
                    <Zap className="w-5 h-5" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                </div>

                {/* Selection indicator */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="w-6 h-6 rounded-full bg-[#DC2626] flex items-center justify-center"
                    >
                      <Check className="w-3.5 h-3.5 text-white" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Name & description */}
              <h3 className="text-lg font-bold text-white mb-1">
                {offer.name}
              </h3>
              <p className="text-sm text-white/40 mb-4 leading-relaxed">
                {offer.description}
              </p>

              {/* Module list */}
              <div className="space-y-2">
                {offer.modules.map((mod) => {
                  const config = MODULE_LABELS[mod];
                  if (!config) return null;
                  const Icon = config.icon;
                  return (
                    <div key={mod} className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-md bg-white/[0.06] flex items-center justify-center shrink-0">
                        <Icon className="w-3 h-3 text-white/50" />
                      </div>
                      <span className="text-[13px] text-white/60">
                        {config.label}
                      </span>
                      <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto shrink-0" />
                    </div>
                  );
                })}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Continue button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center"
      >
        <button
          onClick={handleContinue}
          disabled={!selectedId || selectOffer.isPending}
          className={cn(
            "group flex items-center gap-3 rounded-2xl px-8 py-4 text-lg font-semibold text-white transition-all duration-300",
            selectedId
              ? "bg-gradient-to-r from-[#DC2626] to-red-500 shadow-xl shadow-red-500/25 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/40"
              : "bg-white/10 cursor-not-allowed opacity-50",
          )}
        >
          {selectOffer.isPending ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              Continuer
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </motion.div>
    </motion.div>
  );
}
