"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  staggerContainer,
  staggerItem,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import { useCoachingGoals } from "@/hooks/use-coaching-goals";
import type { CoachingGoal, GoalStatus } from "@/types/coaching";
import { cn } from "@/lib/utils";
import {
  Target,
  CheckCircle,
  Pause,
  XCircle,
  ChevronDown,
  TrendingUp,
  Calendar,
  Trophy,
  ArrowRight,
  Flame,
  BarChart3,
  Clock,
} from "lucide-react";

function formatDate(date: string | null) {
  if (!date) return null;
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDaysRemaining(deadline: string | null): number | null {
  if (!deadline) return null;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const d = new Date(deadline);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const STATUS_CONFIG: Record<
  GoalStatus,
  { label: string; color: string; bgColor: string; icon: typeof Target }
> = {
  active: {
    label: "En cours",
    color: "text-primary",
    bgColor: "bg-primary/10",
    icon: Target,
  },
  completed: {
    label: "Termine",
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
    icon: CheckCircle,
  },
  paused: {
    label: "En pause",
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
    icon: Pause,
  },
  abandoned: {
    label: "Abandonne",
    color: "text-zinc-500",
    bgColor: "bg-zinc-500/10",
    icon: XCircle,
  },
};

export default function GoalsPage() {
  const { goals, isLoading, updateProgress, updateGoal } = useCoachingGoals();
  const [activeTab, setActiveTab] = useState<"active" | "all">("active");

  const active = goals.filter((g) => g.status === "active");
  const completed = goals.filter((g) => g.status === "completed");
  const paused = goals.filter((g) => g.status === "paused");
  const abandoned = goals.filter((g) => g.status === "abandoned");

  // Stats
  const totalProgress =
    active.length > 0
      ? Math.round(
          active.reduce((sum, g) => {
            if (!g.target_value) return sum;
            return (
              sum +
              Math.min(
                (Number(g.current_value) / Number(g.target_value)) * 100,
                100,
              )
            );
          }, 0) / active.filter((g) => g.target_value).length || 0,
        )
      : 0;

  const upcomingDeadlines = active
    .filter((g) => g.deadline)
    .sort(
      (a, b) =>
        new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime(),
    )
    .slice(0, 3);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
          Mes objectifs
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Suis ta progression vers tes objectifs
        </p>
      </motion.div>

      {/* Stats row */}
      <motion.div variants={staggerItem} className="grid grid-cols-3 gap-3">
        <div
          className="bg-surface rounded-2xl p-4 text-center"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <Target className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="text-lg font-display font-bold text-foreground">
            {active.length}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            En cours
          </p>
        </div>
        <div
          className="bg-surface rounded-2xl p-4 text-center"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="text-lg font-display font-bold text-foreground">
            {completed.length}
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Termines
          </p>
        </div>
        <div
          className="bg-surface rounded-2xl p-4 text-center"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <BarChart3 className="w-5 h-5 text-emerald-500 mx-auto mb-1" />
          <p className="text-lg font-display font-bold text-foreground">
            {totalProgress}%
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Progression
          </p>
        </div>
      </motion.div>

      {/* Upcoming deadlines */}
      {upcomingDeadlines.length > 0 && (
        <motion.div variants={staggerItem}>
          <div
            className="bg-surface rounded-2xl p-4"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Prochaines echeances
              </span>
            </div>
            <div className="space-y-2">
              {upcomingDeadlines.map((goal) => {
                const daysLeft = getDaysRemaining(goal.deadline);
                const isUrgent = daysLeft !== null && daysLeft <= 7;
                const isOverdue = daysLeft !== null && daysLeft < 0;
                return (
                  <div
                    key={goal.id}
                    className="flex items-center justify-between py-1.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full shrink-0",
                          isOverdue
                            ? "bg-red-500"
                            : isUrgent
                              ? "bg-amber-500"
                              : "bg-primary",
                        )}
                      />
                      <span className="text-sm text-foreground truncate">
                        {goal.title}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-xs font-medium shrink-0 ml-2",
                        isOverdue
                          ? "text-red-500"
                          : isUrgent
                            ? "text-amber-500"
                            : "text-muted-foreground",
                      )}
                    >
                      {isOverdue
                        ? `${Math.abs(daysLeft!)}j en retard`
                        : daysLeft === 0
                          ? "Aujourd'hui"
                          : `${daysLeft}j restants`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab filter */}
      <motion.div variants={staggerItem}>
        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 w-fit">
          <button
            onClick={() => setActiveTab("active")}
            className={cn(
              "h-8 px-4 rounded-lg text-xs font-medium transition-all",
              activeTab === "active"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            En cours ({active.length})
          </button>
          <button
            onClick={() => setActiveTab("all")}
            className={cn(
              "h-8 px-4 rounded-lg text-xs font-medium transition-all",
              activeTab === "all"
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Tous ({goals.length})
          </button>
        </div>
      </motion.div>

      {/* Goals list — staggerItem toujours présent pour participer
          au stagger initial, même pendant le chargement */}
      <motion.div variants={staggerItem}>
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-surface rounded-2xl animate-shimmer"
                style={{ boxShadow: "var(--shadow-card)" }}
              />
            ))}
          </div>
        ) : activeTab === "active" ? (
          /* Active goals */
          <div>
            {active.length === 0 ? (
              <div
                className="bg-surface rounded-2xl p-12 text-center"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <Target className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Aucun objectif en cours. Ton coach en definira bientot.
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
                    onUpdateStatus={(status) =>
                      updateGoal.mutate({ id: goal.id, status })
                    }
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* All goals grouped by status */
          <div className="space-y-6">
            {/* Active */}
            {active.length > 0 && (
              <GoalSection
                title="En cours"
                count={active.length}
                icon={Target}
                iconColor="text-primary"
              >
                {active.map((goal) => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onUpdateProgress={(value) =>
                      updateProgress.mutate({ id: goal.id, currentValue: value })
                    }
                    onUpdateStatus={(status) =>
                      updateGoal.mutate({ id: goal.id, status })
                    }
                  />
                ))}
              </GoalSection>
            )}

            {/* Completed */}
            {completed.length > 0 && (
              <GoalSection
                title="Termines"
                count={completed.length}
                icon={Trophy}
                iconColor="text-emerald-500"
              >
                {completed.map((goal) => (
                  <CompactGoalCard key={goal.id} goal={goal} status="completed" />
                ))}
              </GoalSection>
            )}

            {/* Paused */}
            {paused.length > 0 && (
              <GoalSection
                title="En pause"
                count={paused.length}
                icon={Pause}
                iconColor="text-amber-500"
              >
                {paused.map((goal) => (
                  <CompactGoalCard key={goal.id} goal={goal} status="paused" />
                ))}
              </GoalSection>
            )}

            {/* Abandoned */}
            {abandoned.length > 0 && (
              <GoalSection
                title="Abandonnes"
                count={abandoned.length}
                icon={XCircle}
                iconColor="text-zinc-400"
              >
                {abandoned.map((goal) => (
                  <CompactGoalCard key={goal.id} goal={goal} status="abandoned" />
                ))}
              </GoalSection>
            )}

            {goals.length === 0 && (
              <div
                className="bg-surface rounded-2xl p-12 text-center"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <Target className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  Aucun objectif pour le moment
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─── Goal Section ─── */

function GoalSection({
  title,
  count,
  icon: Icon,
  iconColor,
  children,
}: {
  title: string;
  count: number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 mb-3 group"
      >
        <Icon className={cn("w-4 h-4", iconColor)} />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </span>
        <span className="text-[10px] text-muted-foreground/60">({count})</span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-muted-foreground transition-transform",
            collapsed && "-rotate-90",
          )}
        />
      </button>
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-3"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Goal Card (full, for active goals) ─── */

function GoalCard({
  goal,
  onUpdateProgress,
  onUpdateStatus,
}: {
  goal: CoachingGoal;
  onUpdateProgress: (value: number) => void;
  onUpdateStatus: (status: GoalStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const progress = goal.target_value
    ? Math.min(
        Math.round(
          (Number(goal.current_value) / Number(goal.target_value)) * 100,
        ),
        100,
      )
    : 0;

  const daysLeft = getDaysRemaining(goal.deadline);
  const isUrgent = daysLeft !== null && daysLeft <= 7 && daysLeft >= 0;
  const isOverdue = daysLeft !== null && daysLeft < 0;

  // Determine progress bar color
  const progressColor = isOverdue
    ? "bg-red-500"
    : progress >= 75
      ? "bg-emerald-500"
      : progress >= 50
        ? "bg-primary"
        : progress >= 25
          ? "bg-amber-500"
          : "bg-primary";

  const handleProgressSubmit = () => {
    const val = parseFloat(inputValue);
    if (!isNaN(val)) {
      onUpdateProgress(val);
      setInputValue("");
    }
  };

  return (
    <div
      className={cn(
        "bg-surface rounded-2xl overflow-hidden transition-all",
        expanded ? "ring-1 ring-primary/20" : "hover:ring-1 hover:ring-border",
      )}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div
        className="p-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground">
              {goal.title}
            </h3>
            {goal.description && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {goal.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-3 shrink-0">
            {goal.deadline && (
              <span
                className={cn(
                  "text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1",
                  isOverdue
                    ? "bg-red-500/10 text-red-500"
                    : isUrgent
                      ? "bg-amber-500/10 text-amber-500"
                      : "bg-muted text-muted-foreground",
                )}
              >
                <Calendar className="w-2.5 h-2.5" />
                {formatDate(goal.deadline)}
              </span>
            )}
            <ChevronDown
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                expanded && "rotate-180",
              )}
            />
          </div>
        </div>

        {/* Progress bar */}
        {goal.target_value ? (
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">
                {Number(goal.current_value).toLocaleString("fr-FR")} /{" "}
                {Number(goal.target_value).toLocaleString("fr-FR")}
                {goal.unit ? ` ${goal.unit}` : ""}
              </span>
              <span
                className={cn(
                  "font-bold",
                  progress >= 75
                    ? "text-emerald-600"
                    : progress >= 50
                      ? "text-primary"
                      : "text-foreground",
                )}
              >
                {progress}%
              </span>
            </div>
            <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full", progressColor)}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">
              Objectif qualitatif (sans progression chiffree)
            </span>
          </div>
        )}
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-5 pb-5 border-t border-border/50 pt-4 space-y-4">
              {/* Description */}
              {goal.description && (
                <p className="text-sm text-foreground/80 leading-relaxed">
                  {goal.description}
                </p>
              )}

              {/* Deadline info */}
              {daysLeft !== null && (
                <div
                  className={cn(
                    "flex items-center gap-2 text-xs px-3 py-2 rounded-lg",
                    isOverdue
                      ? "bg-red-500/10 text-red-600"
                      : isUrgent
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {isOverdue
                    ? `En retard de ${Math.abs(daysLeft)} jour${Math.abs(daysLeft) > 1 ? "s" : ""}`
                    : daysLeft === 0
                      ? "Echeance aujourd'hui"
                      : `${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${daysLeft > 1 ? "s" : ""}`}
                </div>
              )}

              {/* Update progress */}
              {goal.target_value && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Nouvelle valeur"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="h-9 w-36 px-3 bg-muted rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleProgressSubmit();
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProgressSubmit();
                    }}
                    disabled={!inputValue}
                    className="h-9 px-3 rounded-xl text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Mettre a jour
                  </button>
                </div>
              )}

              {/* Status actions */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStatus("completed");
                  }}
                  className="h-8 px-3 rounded-xl text-xs font-medium text-emerald-600 hover:bg-emerald-500/10 transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Terminer
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdateStatus("paused");
                  }}
                  className="h-8 px-3 rounded-xl text-xs font-medium text-amber-600 hover:bg-amber-500/10 transition-colors flex items-center gap-1.5"
                >
                  <Pause className="w-3.5 h-3.5" />
                  Pause
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Abandonner cet objectif ?")) {
                      onUpdateStatus("abandoned");
                    }
                  }}
                  className="h-8 px-3 rounded-xl text-xs font-medium text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Abandonner
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Compact Goal Card (for completed/paused/abandoned) ─── */

function CompactGoalCard({
  goal,
  status,
}: {
  goal: CoachingGoal;
  status: GoalStatus;
}) {
  const config = STATUS_CONFIG[status];
  const StatusIcon = config.icon;
  const progress = goal.target_value
    ? Math.min(
        Math.round(
          (Number(goal.current_value) / Number(goal.target_value)) * 100,
        ),
        100,
      )
    : null;

  return (
    <div
      className={cn(
        "bg-surface rounded-2xl p-4 flex items-center gap-3 transition-all",
        status === "abandoned" ? "opacity-50" : "",
      )}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
          config.bgColor,
        )}
      >
        <StatusIcon className={cn("w-4 h-4", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {goal.title}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {progress !== null && (
            <span className="text-[10px] text-muted-foreground">
              {progress}% atteint
            </span>
          )}
          {goal.deadline && (
            <span className="text-[10px] text-muted-foreground">
              {formatDate(goal.deadline)}
            </span>
          )}
        </div>
      </div>
      {progress !== null && status === "completed" && (
        <span className="text-xs font-bold text-emerald-600">100%</span>
      )}
    </div>
  );
}
