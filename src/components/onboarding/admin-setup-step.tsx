"use client";

import { motion } from "framer-motion";
import {
  Palette,
  UserPlus,
  GraduationCap,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SetupItem {
  icon: typeof Palette;
  title: string;
  description: string;
  badge: "recommended" | "optional";
  color: string;
}

const SETUP_ITEMS: SetupItem[] = [
  {
    icon: Palette,
    title: "Personnaliser le branding",
    description: "Nom, logo et couleurs de ta plateforme",
    badge: "recommended",
    color: "text-purple-400",
  },
  {
    icon: UserPlus,
    title: "Inviter ton équipe",
    description: "Coaches, setters et closers",
    badge: "recommended",
    color: "text-blue-400",
  },
  {
    icon: GraduationCap,
    title: "Creer ta première formation",
    description: "Modules et contenus pour tes clients",
    badge: "recommended",
    color: "text-emerald-400",
  },
  {
    icon: CreditCard,
    title: "Configurer la facturation",
    description: "Methodes de paiement et échéanciers",
    badge: "optional",
    color: "text-amber-400",
  },
];

interface AdminSetupStepProps {
  onNext: () => void;
}

export function AdminSetupStep({ onNext }: AdminSetupStepProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg mx-auto"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Configurer ta plateforme
        </h2>
        <p className="text-sm text-white/50">
          Voici les étapes essentielles pour bien démarrer. Tu pourras y revenir
          a tout moment.
        </p>
      </div>

      {/* Checklist */}
      <div className="space-y-3">
        {SETUP_ITEMS.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 flex items-start gap-4"
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0",
                  item.color,
                )}
              >
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white">
                    {item.title}
                  </h3>
                  <span
                    className={cn(
                      "text-[10px] font-medium px-2 py-0.5 rounded-full",
                      item.badge === "recommended"
                        ? "bg-primary/20 text-primary"
                        : "bg-white/10 text-white/40",
                    )}
                  >
                    {item.badge === "recommended" ? "Recommande" : "Optionnel"}
                  </span>
                </div>
                <p className="text-xs text-white/40">{item.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Continue button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={onNext}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-red-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition-all hover:scale-105"
        >
          Continuer
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
