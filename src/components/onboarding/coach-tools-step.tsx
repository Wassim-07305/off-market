"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Phone,
  GraduationCap,
  MessageCircle,
  ClipboardCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CoachFeature {
  icon: typeof Users;
  title: string;
  description: string;
  aiExplanation: string;
  color: string;
}

const COACH_FEATURES: CoachFeature[] = [
  {
    icon: Users,
    title: "CRM Clients",
    description: "Gere tes clients, leurs objectifs et leur progression.",
    aiExplanation:
      "Le CRM centralise toutes les infos de tes clients : objectifs, notes, historique d'appels et progression. Tu as une vue complete sur chaque client.",
    color: "text-blue-400",
  },
  {
    icon: Phone,
    title: "Appels & Calendrier",
    description: "Planifie et gere tes sessions de coaching.",
    aiExplanation:
      "Le calendrier te permet de planifier tes sessions, d'envoyer des rappels automatiques et de garder un historique de tous tes appels.",
    color: "text-emerald-400",
  },
  {
    icon: GraduationCap,
    title: "Formations",
    description: "Cree et assigne des modules de formation.",
    aiExplanation:
      "Tu peux creer des formations structurees en modules, y ajouter des videos et documents, et suivre la progression de chaque client.",
    color: "text-purple-400",
  },
  {
    icon: MessageCircle,
    title: "Messagerie",
    description: "Communique en direct avec tes clients.",
    aiExplanation:
      "La messagerie temps reel te permet d'echanger avec tes clients individuellement ou en groupe. Tu peux partager des fichiers et des vocaux.",
    color: "text-amber-400",
  },
  {
    icon: ClipboardCheck,
    title: "Check-ins",
    description: "Suis les check-ins hebdomadaires de tes clients.",
    aiExplanation:
      "Les check-ins te donnent un apercu de la semaine de chaque client : victoires, blocages, prochaines actions. Tu restes informe sans avoir a demander.",
    color: "text-rose-400",
  },
];

interface CoachToolsStepProps {
  onNext: () => void;
}

export function CoachToolsStep({ onNext }: CoachToolsStepProps) {
  const [currentFeature, setCurrentFeature] = useState(0);
  const [showAi, setShowAi] = useState(false);
  const feature = COACH_FEATURES[currentFeature];
  const Icon = feature.icon;
  const isLast = currentFeature === COACH_FEATURES.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto"
    >
      {/* Step indicators */}
      <div className="flex items-center gap-1.5 mb-8 justify-center">
        {COACH_FEATURES.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              setCurrentFeature(i);
              setShowAi(false);
            }}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === currentFeature
                ? "w-8 bg-primary"
                : i < currentFeature
                  ? "w-3 bg-primary/50"
                  : "w-3 bg-white/20",
            )}
          />
        ))}
      </div>

      {/* Feature card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentFeature}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden"
        >
          {/* Feature header */}
          <div className="p-6 pb-4">
            <div
              className={cn(
                "w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mb-4",
                feature.color,
              )}
            >
              <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-white/50 leading-relaxed">
              {feature.description}
            </p>
          </div>

          {/* AI explanation toggle */}
          <div className="px-6 pb-6">
            <button
              onClick={() => setShowAi(!showAi)}
              className="flex items-center gap-2 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {showAi ? "Masquer l'explication" : "Explication detaillee"}
            </button>

            <AnimatePresence>
              {showAi && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 rounded-xl bg-primary/10 border border-primary/20 p-4">
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-white/70 leading-relaxed">
                        {feature.aiExplanation}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => {
            setCurrentFeature((c) => Math.max(0, c - 1));
            setShowAi(false);
          }}
          disabled={currentFeature === 0}
          className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          Precedent
        </button>

        {isLast ? (
          <button
            onClick={onNext}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-red-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:scale-105"
          >
            Continuer
            <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              setCurrentFeature((c) => c + 1);
              setShowAi(false);
            }}
            className="flex items-center gap-1.5 text-sm font-medium text-white hover:text-primary transition-colors"
          >
            Suivant
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
