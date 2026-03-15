"use client";

import { cn } from "@/lib/utils";
import { Flame, Zap, Star, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface StreakDisplayProps {
  currentStreak: number;
  longestStreak: number;
  multiplier: number;
  className?: string;
  compact?: boolean;
}

const MILESTONES = [
  { days: 7, label: "1 semaine", icon: Flame, color: "text-orange-500" },
  { days: 14, label: "2 semaines", icon: Zap, color: "text-amber-500" },
  { days: 30, label: "1 mois", icon: Star, color: "text-purple-500" },
  { days: 60, label: "2 mois", icon: Star, color: "text-blue-500" },
  { days: 90, label: "3 mois", icon: Trophy, color: "text-amber-400" },
];

export function StreakDisplay({
  currentStreak,
  longestStreak,
  multiplier,
  className,
  compact = false,
}: StreakDisplayProps) {
  const nextMilestone = MILESTONES.find((m) => m.days > currentStreak);
  const achievedMilestones = MILESTONES.filter((m) => m.days <= currentStreak);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        <StreakFlame streak={currentStreak} size="sm" />
        <span className="text-sm font-semibold text-foreground tabular-nums">
          {currentStreak}j
        </span>
        {multiplier > 1 && (
          <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-full">
            x{multiplier}
          </span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-2xl p-5",
        className,
      )}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <StreakFlame streak={currentStreak} size="lg" />
          <div>
            <p className="text-2xl font-bold text-foreground font-display tabular-nums">
              {currentStreak} jour{currentStreak > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-muted-foreground">Serie en cours</p>
          </div>
        </div>
        <div className="text-right">
          {multiplier > 1 && (
            <div className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-full px-3 py-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-sm font-bold text-amber-600">
                x{multiplier}
              </span>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground mt-1">Bonus XP</p>
        </div>
      </div>

      {/* Record */}
      <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-muted/30 rounded-xl">
        <Trophy className="w-4 h-4 text-amber-500" />
        <span className="text-xs text-muted-foreground">Record personnel</span>
        <span className="ml-auto text-sm font-semibold text-foreground tabular-nums">
          {longestStreak} jour{longestStreak > 1 ? "s" : ""}
        </span>
      </div>

      {/* Milestones */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-foreground">Milestones</p>
        <div className="flex gap-2">
          {MILESTONES.map((milestone) => {
            const achieved = currentStreak >= milestone.days;
            const Icon = milestone.icon;
            return (
              <div
                key={milestone.days}
                className={cn(
                  "flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border transition-all",
                  achieved
                    ? "bg-amber-500/5 border-amber-500/20"
                    : "bg-muted/20 border-border/50 opacity-40",
                )}
              >
                <Icon
                  className={cn(
                    "w-4 h-4",
                    achieved ? milestone.color : "text-muted-foreground",
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    achieved ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {milestone.days}j
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next milestone progress */}
      {nextMilestone && (
        <div className="mt-3 pt-3 border-t border-border/30">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] text-muted-foreground">
              Prochain palier : {nextMilestone.label}
            </span>
            <span className="text-[10px] font-medium text-foreground tabular-nums">
              {currentStreak}/{nextMilestone.days}
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min((currentStreak / nextMilestone.days) * 100, 100)}%`,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StreakFlame({
  streak,
  size = "md",
}: {
  streak: number;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-5 h-5",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  const isActive = streak > 0;

  return (
    <div className="relative">
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: 1,
            }}
            transition={{
              scale: {
                repeat: Infinity,
                duration: 1.5,
                ease: "easeInOut",
              },
              opacity: { duration: 0.3 },
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              className={cn(
                "rounded-full bg-orange-500/20 blur-sm",
                sizeClasses[size],
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <Flame
        className={cn(
          sizeClasses[size],
          isActive
            ? streak >= 30
              ? "text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
              : streak >= 7
                ? "text-orange-500 drop-shadow-[0_0_6px_rgba(249,115,22,0.4)]"
                : "text-orange-400"
            : "text-muted-foreground/30",
        )}
      />
    </div>
  );
}

export { StreakFlame };
