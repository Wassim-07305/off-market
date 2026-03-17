"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Rocket, Trophy, ArrowRight, CheckCircle } from "lucide-react";

interface CompletionStepProps {
  firstName: string;
  onComplete: () => void;
  isCompleting: boolean;
  completedItems?: string[];
}

export function CompletionStep({
  firstName,
  onComplete,
  isCompleting,
  completedItems: completedItemsProp,
}: CompletionStepProps) {
  useEffect(() => {
    // Fire confetti on mount
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#C41E3A", "#E8374E", "#f43f5e", "#fb7185", "#fbbf24"],
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#C41E3A", "#E8374E", "#f43f5e", "#fb7185", "#fbbf24"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const COMPLETED_ITEMS = completedItemsProp ?? [
    "Video d'accueil regardee",
    "Profil business complete",
    "CSM rencontre",
    "Visite de la plateforme",
    "Premier message envoye",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center text-center"
    >
      {/* Trophy animation */}
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="mb-6 relative"
      >
        <div className="absolute inset-0 rounded-full bg-amber-500/20 blur-3xl" />
        <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-500/20 to-primary/20 border border-amber-500/30 flex items-center justify-center">
          <Trophy className="w-12 h-12 text-amber-400" />
        </div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-white mb-3 sm:text-4xl"
      >
        Bravo {firstName} !
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-lg text-white/50 mb-8 max-w-md"
      >
        Ton onboarding est termine. Tu es pret a demarrer ton aventure Off
        Market.
      </motion.p>

      {/* Completed items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-sm mb-8 rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2.5"
      >
        {COMPLETED_ITEMS.map((item, i) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.08 }}
            className="flex items-center gap-3"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-sm text-white/70">{item}</span>
          </motion.div>
        ))}
      </motion.div>

      {/* Badge earned */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mb-8 flex items-center gap-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-primary/10 border border-amber-500/20 px-5 py-3"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-amber-400" />
        </div>
        <div className="text-left">
          <p className="text-xs text-amber-400 font-medium">Badge debloque !</p>
          <p className="text-sm font-semibold text-white">Newcomer</p>
        </div>
      </motion.div>

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        onClick={onComplete}
        disabled={isCompleting}
        className="group flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary to-red-500 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-red-500/25 transition-all duration-200 hover:scale-105 hover:shadow-2xl hover:shadow-red-500/40 disabled:opacity-50 disabled:hover:scale-100"
      >
        {isCompleting ? (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <>
            <Rocket className="w-5 h-5" />
            Acceder a mon espace
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </motion.button>
    </motion.div>
  );
}
