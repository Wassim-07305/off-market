"use client";

import { useState, useMemo } from "react";
import {
  Target,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Filter,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useCoachingGoals } from "@/hooks/use-coaching-goals";
import { GoalProgressCard } from "./goal-progress-card";
import { GoalFormModal, type GoalFormSubmitData } from "./goal-form-modal";
import { Button } from "@/components/ui/button";
import type { CoachingGoal, GoalStatus } from "@/types/coaching";

// ─── Filter config ──────────────────────────────────────────

type FilterValue = "all" | GoalStatus;

const FILTER_OPTIONS: {
  value: FilterValue;
  label: string;
  icon: typeof Target;
}[] = [
  { value: "all", label: "Tous", icon: BarChart3 },
  { value: "active", label: "Actifs", icon: Target },
  { value: "completed", label: "Termines", icon: CheckCircle2 },
  { value: "paused", label: "En pause", icon: Clock },
];

// ─── Component ──────────────────────────────────────────────

interface GoalsDashboardProps {
  clientId?: string;
}

export function GoalsDashboard({ clientId }: GoalsDashboardProps) {
  const { goals, isLoading, createGoal, updateGoal, updateProgress } =
    useCoachingGoals(clientId);
  const [filter, setFilter] = useState<FilterValue>("all");
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<CoachingGoal | null>(null);

  // ─── Derived data ───────────────────────────────────────

  const filteredGoals = useMemo(() => {
    if (filter === "all") return goals;
    return goals.filter((g) => g.status === filter);
  }, [goals, filter]);

  const stats = useMemo(() => {
    const active = goals.filter((g) => g.status === "active").length;
    const completed = goals.filter((g) => g.status === "completed").length;
    const overdue = goals.filter((g) => {
      if (g.status !== "active" || !g.deadline) return false;
      return new Date(g.deadline) < new Date();
    }).length;
    return { active, completed, overdue };
  }, [goals]);

  // ─── Handlers ───────────────────────────────────────────

  const handleCreateGoal = async (data: GoalFormSubmitData) => {
    if (!clientId) return;
    try {
      await createGoal.mutateAsync({
        client_id: clientId,
        title: data.title,
        description: data.description,
        target_value: data.target_value,
        unit: data.unit,
        deadline: data.deadline || undefined,
        difficulty: data.difficulty,
        coach_notes: data.coach_notes,
      });
      toast.success("Objectif créé avec succès");
    } catch {
      // Error handled by hook
    }
  };

  const handleEditGoal = async (data: GoalFormSubmitData) => {
    if (!editingGoal) return;
    try {
      await updateGoal.mutateAsync({
        id: editingGoal.id,
        title: data.title,
        description: data.description ?? null,
        target_value: data.target_value ?? null,
        unit: data.unit ?? null,
        deadline: data.deadline || null,
        difficulty: data.difficulty ?? null,
        coach_notes: data.coach_notes ?? null,
      });
      toast.success("Objectif modifie");
      setEditingGoal(null);
    } catch {
      // Error handled by hook
    }
  };

  const handleUpdateProgress = (id: string, value: number) => {
    updateProgress.mutate(
      { id, currentValue: value },
      {
        onSuccess: () => toast.success("Progression mise à jour"),
      },
    );
  };

  // ─── Loading state ──────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg bg-zinc-100 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-48 rounded-2xl bg-zinc-50 border border-border/40 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // ─── Empty state ────────────────────────────────────────

  if (goals.length === 0) {
    return (
      <>
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
            <Target className="w-7 h-7 text-zinc-400" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            Aucun objectif defini
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm mb-6">
            Definis des objectifs mesurables pour suivre la progression de ton
            client et structurer le coaching.
          </p>
          <Button
            onClick={() => setShowForm(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Creer un objectif
          </Button>
        </div>

        <GoalFormModal
          open={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={handleCreateGoal}
          isSubmitting={createGoal.isPending}
        />
      </>
    );
  }

  // ─── Main render ────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header + Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Summary stats */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="font-semibold text-foreground">
              {stats.active}
            </span>
            <span className="text-muted-foreground">actifs</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold text-foreground">
              {stats.completed}
            </span>
            <span className="text-muted-foreground">termines</span>
          </div>
          {stats.overdue > 0 && (
            <div className="flex items-center gap-1.5 text-sm">
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
              <span className="font-semibold text-red-600">
                {stats.overdue}
              </span>
              <span className="text-red-600/70">en retard</span>
            </div>
          )}
        </div>

        <Button
          onClick={() => setShowForm(true)}
          size="sm"
          icon={<Plus className="w-3.5 h-3.5" />}
        >
          Nouvel objectif
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1.5">
        <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1" />
        {FILTER_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          const count =
            opt.value === "all"
              ? goals.length
              : goals.filter((g) => g.status === opt.value).length;
          return (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150",
                filter === opt.value
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-muted border border-transparent",
              )}
            >
              <Icon className="w-3 h-3" />
              {opt.label}
              <span
                className={cn(
                  "ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] tabular-nums",
                  filter === opt.value
                    ? "bg-primary/20 text-primary"
                    : "bg-zinc-100 text-muted-foreground",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Goals grid */}
      {filteredGoals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            Aucun objectif dans cette catégorie
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGoals.map((goal) => (
            <GoalProgressCard
              key={goal.id}
              goal={goal}
              onUpdateProgress={handleUpdateProgress}
              onEdit={(g) => setEditingGoal(g)}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      <GoalFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreateGoal}
        isSubmitting={createGoal.isPending}
      />

      {/* Edit modal */}
      <GoalFormModal
        open={!!editingGoal}
        onClose={() => setEditingGoal(null)}
        onSubmit={handleEditGoal}
        editGoal={editingGoal}
        isSubmitting={updateGoal.isPending}
      />
    </div>
  );
}
