"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeInUp, defaultTransition } from "@/lib/animations";
import { useCoachingGoals } from "@/hooks/use-coaching-goals";
import type { CoachingGoal } from "@/types/coaching";
import { Target, CheckCircle, Pause, XCircle } from "lucide-react";

function formatDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function GoalsPage() {
  const { goals, isLoading, updateProgress, updateGoal } = useCoachingGoals();

  const active = goals.filter((g) => g.status === "active");
  const completed = goals.filter((g) => g.status === "completed");
  const other = goals.filter((g) => g.status === "paused" || g.status === "abandoned");

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto space-y-6"
    >
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <h1 className="text-3xl font-semibold text-foreground">Mes objectifs</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Suivez votre progression vers vos objectifs
        </p>
      </motion.div>

      {/* Active goals */}
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <h2 className="text-sm font-semibold text-foreground mb-3">
          En cours ({active.length})
        </h2>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-28 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        ) : active.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <Target className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Aucun objectif en cours. Votre coach en definira bientot.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {active.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onUpdateProgress={(value) =>
                  updateProgress.mutate({ id: goal.id, currentValue: value })
                }
                onComplete={() =>
                  updateGoal.mutate({ id: goal.id, status: "completed" })
                }
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Completed */}
      {completed.length > 0 && (
        <motion.div variants={fadeInUp} transition={defaultTransition}>
          <h2 className="text-sm font-semibold text-foreground mb-3">
            Termines ({completed.length})
          </h2>
          <div className="space-y-2">
            {completed.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center gap-3 p-4 bg-surface border border-border rounded-xl opacity-60"
              >
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{goal.title}</p>
                  {goal.description && (
                    <p className="text-xs text-muted-foreground truncate">{goal.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Paused / Abandoned */}
      {other.length > 0 && (
        <motion.div variants={fadeInUp} transition={defaultTransition}>
          <h2 className="text-sm font-semibold text-foreground mb-3">Autres</h2>
          <div className="space-y-2">
            {other.map((goal) => (
              <div
                key={goal.id}
                className="flex items-center gap-3 p-4 bg-surface border border-border rounded-xl opacity-40"
              >
                {goal.status === "paused" ? (
                  <Pause className="w-5 h-5 text-amber-500 shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-muted-foreground shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{goal.title}</p>
                  <p className="text-xs text-muted-foreground capitalize">{goal.status === "paused" ? "En pause" : "Abandonne"}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function GoalCard({
  goal,
  onUpdateProgress,
  onComplete,
}: {
  goal: CoachingGoal;
  onUpdateProgress: (value: number) => void;
  onComplete: () => void;
}) {
  const progress = goal.target_value
    ? Math.min(Math.round((Number(goal.current_value) / Number(goal.target_value)) * 100), 100)
    : 0;

  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{goal.title}</h3>
          {goal.description && (
            <p className="text-xs text-muted-foreground mt-0.5">{goal.description}</p>
          )}
        </div>
        {goal.deadline && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {formatDate(goal.deadline)}
          </span>
        )}
      </div>

      {/* Progress bar */}
      {goal.target_value && (
        <div className="mb-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-muted-foreground">
              {Number(goal.current_value).toLocaleString("fr-FR")} / {Number(goal.target_value).toLocaleString("fr-FR")}
              {goal.unit ? ` ${goal.unit}` : ""}
            </span>
            <span className="font-medium text-foreground">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {goal.target_value && (
          <input
            type="number"
            placeholder="Nouvelle valeur"
            className="h-8 w-28 px-2 bg-muted rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const val = parseFloat((e.target as HTMLInputElement).value);
                if (!isNaN(val)) {
                  onUpdateProgress(val);
                  (e.target as HTMLInputElement).value = "";
                }
              }
            }}
          />
        )}
        <button
          onClick={onComplete}
          className="h-8 px-3 rounded-lg text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 transition-colors flex items-center gap-1"
        >
          <CheckCircle className="w-3.5 h-3.5" />
          Terminer
        </button>
      </div>
    </div>
  );
}
