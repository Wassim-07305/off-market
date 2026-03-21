"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  MessageCircle,
  GraduationCap,
  Users,
  BarChart3,
  ClipboardCheck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Rss,
  FolderOpen,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

interface FeatureItem {
  icon: typeof LayoutDashboard;
  title: string;
  description: string;
  aiExplanation: string;
  color: string;
  /** If true, shown as locked/coming-soon for prospects */
  prospectLocked?: boolean;
}

const CLIENT_FEATURES: FeatureItem[] = [
  {
    icon: LayoutDashboard,
    title: "Tableau de bord",
    description:
      "Visualise tes KPIs, ta progression et ton activite en un coup d'oeil.",
    aiExplanation:
      "Le dashboard centralise toutes tes metriques : revenus, objectifs, streak, et activite. Tu verras tes progres chaque jour.",
    color: "text-blue-400",
  },
  {
    icon: GraduationCap,
    title: "Formations",
    description:
      "Accede aux modules de formation pour developper tes competences.",
    aiExplanation:
      "Les formations sont structurees en modules progressifs avec des quiz pour valider tes acquis. Tu avances a ton rythme.",
    color: "text-purple-400",
  },
  {
    icon: MessageCircle,
    title: "Messagerie",
    description: "Communique avec ton coach et la communaute en temps reel.",
    aiExplanation:
      "La messagerie te connecte directement avec ton CSM et les autres membres. Tu peux envoyer des messages, fichiers et vocaux.",
    color: "text-emerald-400",
  },
  {
    icon: Users,
    title: "Communaute",
    description: "Echange avec les autres entrepreneurs du programme.",
    aiExplanation:
      "Le feed communautaire te permet de partager tes victoires, poser des questions et t'inspirer des succes des autres.",
    color: "text-amber-400",
  },
  {
    icon: ClipboardCheck,
    title: "Check-ins & Journal",
    description: "Fais le point chaque semaine et tiens ton journal de bord.",
    aiExplanation:
      "Les check-ins hebdomadaires permettent a ton coach de suivre ta progression. Le journal t'aide a garder le focus.",
    color: "text-rose-400",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Suis l'evolution de tes metriques business en detail.",
    aiExplanation:
      "Les graphiques te montrent tes tendances de revenus, ta conversion et tes performances. Chaque semaine, tu vois le progres.",
    color: "text-cyan-400",
  },
];

const PROSPECT_FEATURES: FeatureItem[] = [
  {
    icon: LayoutDashboard,
    title: "Tableau de bord",
    description:
      "Decouvre ton espace personnel avec un apercu de la plateforme.",
    aiExplanation:
      "Le dashboard te donne une vue d'ensemble. En devenant client, tu auras acces a toutes les metriques et KPIs.",
    color: "text-blue-400",
  },
  {
    icon: GraduationCap,
    title: "Formations",
    description:
      "Decouvre le catalogue de formations disponibles pour les clients.",
    aiExplanation:
      "Tu peux voir les formations disponibles. L'acces complet aux modules et lecons est reserve aux clients actifs.",
    color: "text-purple-400",
    prospectLocked: true,
  },
  {
    icon: Rss,
    title: "Feed & Communaute",
    description: "Decouvre les echanges et victoires des membres du programme.",
    aiExplanation:
      "Le feed te permet de voir l'activite de la communaute. Tu peux consulter les posts et t'inspirer des succes des autres.",
    color: "text-amber-400",
  },
  {
    icon: FolderOpen,
    title: "Ressources",
    description: "Accede aux ressources et documents partages.",
    aiExplanation:
      "La bibliotheque de ressources te donne acces a des documents utiles pour te preparer.",
    color: "text-cyan-400",
  },
  {
    icon: MessageCircle,
    title: "Messagerie & Coach",
    description: "En devenant client, un coach dedie te sera attribue.",
    aiExplanation:
      "Les clients beneficient d'un coach personnel, d'une messagerie directe et de sessions de coaching. Tout ca t'attend !",
    color: "text-emerald-400",
    prospectLocked: true,
  },
  {
    icon: BarChart3,
    title: "Gamification & Suivi",
    description: "XP, badges, streaks et journal — disponibles pour les clients.",
    aiExplanation:
      "Le systeme de gamification motive les clients avec des points d'experience, des badges et un classement communautaire.",
    color: "text-rose-400",
    prospectLocked: true,
  },
];

interface FeatureTourStepProps {
  onNext: () => void;
}

export function FeatureTourStep({ onNext }: FeatureTourStepProps) {
  const { profile } = useAuth();
  const isProspect = profile?.role === "prospect";
  const FEATURES = isProspect ? PROSPECT_FEATURES : CLIENT_FEATURES;
  const [currentFeature, setCurrentFeature] = useState(0);
  const [showAi, setShowAi] = useState(false);
  const feature = FEATURES[currentFeature];
  const Icon = feature.icon;
  const isLast = currentFeature === FEATURES.length - 1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto"
    >
      {/* Step indicators */}
      <div className="flex items-center gap-1.5 mb-8 justify-center">
        {FEATURES.map((_, i) => (
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
            <div className="flex items-center gap-3 mb-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center",
                  feature.color,
                )}
              >
                <Icon className="w-6 h-6" />
              </div>
              {feature.prospectLocked && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-white/10 text-white/50">
                  <Lock className="w-3 h-3" />
                  Clients uniquement
                </span>
              )}
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
