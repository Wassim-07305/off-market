"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useUserOffer } from "@/hooks/use-onboarding-offers";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronRight,
  Sparkles,
  Trophy,
  Zap,
  UserPlus,
  Kanban,
  MessageCircle,
  GraduationCap,
  CalendarCheck,
  BarChart3,
  Users,
  Bot,
  FileSignature,
  Rocket,
} from "lucide-react";
import type { OnboardingAction } from "@/types/database";

// ─── Icon resolver ───────────────────────────────────────────
const ICON_MAP: Record<string, typeof Check> = {
  UserPlus,
  Kanban,
  MessageCircle,
  GraduationCap,
  CalendarCheck,
  BarChart3,
  Trophy,
  Users,
  Bot,
  FileSignature,
};

function resolveIcon(iconName: string) {
  return ICON_MAP[iconName] ?? Rocket;
}

// ─── Local storage key for persisted completion state ─────────
const STORAGE_KEY = "off-market-checklist-completed";

function getPersistedCompleted(userId: string): Set<string> {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}-${userId}`);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function persistCompleted(userId: string, keys: Set<string>) {
  try {
    localStorage.setItem(
      `${STORAGE_KEY}-${userId}`,
      JSON.stringify([...keys]),
    );
  } catch {
    // localStorage unavailable
  }
}

// ─── Component ───────────────────────────────────────────────
export function PersonalizedChecklist() {
  const { user, profile } = useAuth();
  const { data: offer, isLoading } = useUserOffer();
  const prefix = useRoutePrefix();

  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [animatingKey, setAnimatingKey] = useState<string | null>(null);

  // Hydrate from localStorage
  useEffect(() => {
    if (user?.id) {
      setCompleted(getPersistedCompleted(user.id));
    }
  }, [user?.id]);

  const actions: OnboardingAction[] = useMemo(() => {
    return offer?.recommended_actions ?? [];
  }, [offer]);

  const progress = useMemo(() => {
    if (actions.length === 0) return 0;
    return Math.round((completed.size / actions.length) * 100);
  }, [completed.size, actions.length]);

  const earnedXp = useMemo(() => {
    // Each completed action = 15 XP
    return completed.size * 15;
  }, [completed.size]);

  const totalXp = actions.length * 15;

  const toggleComplete = useCallback(
    (key: string) => {
      if (!user?.id) return;
      setAnimatingKey(key);

      setCompleted((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        persistCompleted(user.id, next);
        return next;
      });

      // Clear animation after delay
      setTimeout(() => setAnimatingKey(null), 600);
    },
    [user?.id],
  );

  const allComplete = completed.size === actions.length && actions.length > 0;

  // Don't show if no offer selected or still loading
  if (isLoading || !offer || !profile) return null;

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
              Premiers pas — {offer.name}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-amber-600">
            <Zap className="w-3.5 h-3.5" />
            <span className="font-medium">
              {earnedXp}/{totalXp} XP
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1.5">
            <span>
              {completed.size}/{actions.length} étapes
            </span>
            <span className="font-mono">{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#DC2626] to-red-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Checklist items */}
      <div className="py-1">
        <AnimatePresence>
          {actions.map((action, index) => {
            const isCompleted = completed.has(action.key);
            const isAnimating = animatingKey === action.key;
            const Icon = resolveIcon(action.icon);

            return (
              <motion.div
                key={action.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div
                  className={cn(
                    "flex items-center gap-3 px-5 py-3 transition-colors group",
                    isCompleted ? "opacity-60" : "hover:bg-muted/50",
                  )}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleComplete(action.key)}
                    className="shrink-0 focus:outline-none"
                    aria-label={
                      isCompleted
                        ? `Marquer "${action.label}" comme non terminé`
                        : `Marquer "${action.label}" comme terminé`
                    }
                  >
                    {isCompleted ? (
                      <motion.div
                        initial={isAnimating ? { scale: 0 } : false}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 15,
                        }}
                      >
                        <div className="w-5 h-5 rounded-full bg-[#DC2626] flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      </motion.div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30 group-hover:border-[#DC2626]/50 transition-colors flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 bg-[#DC2626]/30 transition-opacity" />
                      </div>
                    )}
                  </button>

                  {/* Link to page */}
                  <Link
                    href={`${prefix}${action.href}`}
                    className="flex-1 min-w-0 flex items-center gap-3"
                  >
                    <div className="w-7 h-7 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                    </div>
                    <span
                      className={cn(
                        "text-sm font-medium transition-all",
                        isCompleted
                          ? "text-muted-foreground line-through"
                          : "text-foreground",
                      )}
                    >
                      {action.label}
                    </span>
                  </Link>

                  {/* XP badge & arrow */}
                  <div className="flex items-center gap-2 shrink-0">
                    {!isCompleted && (
                      <span className="text-[10px] font-medium text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Zap className="w-2.5 h-2.5" />
                        +15
                      </span>
                    )}
                    {!isCompleted && (
                      <ChevronRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Footer — completion reward or welcome message */}
      <div className="px-5 py-3 border-t border-border">
        {allComplete ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 bg-gradient-to-r from-amber-500/10 to-[#DC2626]/10 rounded-xl px-4 py-3"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-400">
                Bravo, toutes les étapes sont terminées !
              </p>
              <p className="text-[11px] text-muted-foreground">
                Tu as débloqué le badge Newcomer et gagné {totalXp} XP.
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>
              Termine toutes les étapes pour débloquer le badge{" "}
              <span className="font-medium text-foreground">Newcomer</span> !
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
