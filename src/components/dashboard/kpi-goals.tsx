"use client";

import { useState } from "react";
import {
  useKpiGoals,
  useCreateKpiGoal,
  useUpdateKpiGoal,
  useDeleteKpiGoal,
} from "@/hooks/use-kpi-goals";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { Target, Plus, X, Loader2, Trash2, TrendingUp } from "lucide-react";

const METRIC_OPTIONS = [
  { value: "revenue", label: "Revenus", unit: "€", color: "text-emerald-600" },
  { value: "clients", label: "Clients", unit: "", color: "text-blue-600" },
  {
    value: "retention",
    label: "Retention",
    unit: "%",
    color: "text-violet-600",
  },
  { value: "calls", label: "Appels", unit: "", color: "text-amber-600" },
  {
    value: "completions",
    label: "Formations",
    unit: "",
    color: "text-pink-600",
  },
  { value: "checkins", label: "Check-ins", unit: "", color: "text-teal-600" },
] as const;

const PERIOD_LABELS: Record<string, string> = {
  weekly: "Semaine",
  monthly: "Mois",
  quarterly: "Trimestre",
  yearly: "Annee",
};

function getMetricColor(metric: string) {
  return (
    METRIC_OPTIONS.find((m) => m.value === metric)?.color ?? "text-primary"
  );
}

function getProgressColor(percent: number) {
  if (percent >= 100) return "bg-emerald-500";
  if (percent >= 75) return "bg-emerald-400";
  if (percent >= 50) return "bg-amber-400";
  if (percent >= 25) return "bg-orange-400";
  return "bg-red-400";
}

export function KpiGoalsWidget() {
  const { isStaff } = useAuth();
  const { data: goals, isLoading } = useKpiGoals();
  const createGoal = useCreateKpiGoal();
  const updateGoal = useUpdateKpiGoal();
  const deleteGoal = useDeleteKpiGoal();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [metric, setMetric] = useState("revenue");
  const [targetValue, setTargetValue] = useState("");
  const [period, setPeriod] = useState<
    "weekly" | "monthly" | "quarterly" | "yearly"
  >("monthly");

  if (!isStaff) return null;

  const resetForm = () => {
    setTitle("");
    setMetric("revenue");
    setTargetValue("");
    setPeriod("monthly");
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !targetValue) return;
    const metricOpt = METRIC_OPTIONS.find((m) => m.value === metric);
    await createGoal.mutateAsync({
      title: title.trim(),
      metric,
      target_value: Number(targetValue),
      unit: metricOpt?.unit ?? "",
      period,
    });
    resetForm();
  };

  const handleUpdateValue = (goalId: string, value: string) => {
    const num = Number(value);
    if (isNaN(num)) return;
    updateGoal.mutate({ id: goalId, current_value: num });
    setEditingId(null);
  };

  return (
    <div
      className="bg-surface rounded-2xl p-5"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Objectifs KPI
          </h3>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="h-7 w-7 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
        >
          {showForm ? (
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <Plus className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="mb-4 p-3 bg-muted/50 rounded-xl space-y-2.5">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nom de l'objectif..."
            className="w-full h-8 px-3 bg-surface border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="flex gap-2">
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value)}
              className="flex-1 h-8 px-2 bg-surface border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {METRIC_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
            <input
              value={targetValue}
              onChange={(e) => setTargetValue(e.target.value)}
              placeholder="Cible"
              type="number"
              className="w-20 h-8 px-2 bg-surface border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as typeof period)}
              className="w-28 h-8 px-2 bg-surface border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              {Object.entries(PERIOD_LABELS).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleSubmit}
            disabled={createGoal.isPending || !title.trim() || !targetValue}
            className="h-8 px-3 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {createGoal.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Plus className="w-3 h-3" />
            )}
            Ajouter
          </button>
        </div>
      )}

      {/* Goals list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded-xl animate-shimmer" />
          ))}
        </div>
      ) : !goals || goals.length === 0 ? (
        <div className="py-8 text-center">
          <TrendingUp className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">Aucun objectif defini</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {goals.slice(0, 5).map((goal) => {
            const percent =
              goal.target_value > 0
                ? Math.min(
                    Math.round((goal.current_value / goal.target_value) * 100),
                    100,
                  )
                : 0;
            const metricColor = getMetricColor(goal.metric);

            return (
              <div
                key={goal.id}
                className="group p-3 rounded-xl hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={cn("text-xs font-semibold", metricColor)}>
                      {
                        METRIC_OPTIONS.find((m) => m.value === goal.metric)
                          ?.label
                      }
                    </span>
                    <span className="text-xs text-foreground font-medium truncate">
                      {goal.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-mono text-muted-foreground">
                      {PERIOD_LABELS[goal.period]}
                    </span>
                    <button
                      onClick={() => deleteGoal.mutate(goal.id)}
                      className="opacity-0 group-hover:opacity-100 h-5 w-5 rounded flex items-center justify-center hover:bg-error/10 transition-all"
                    >
                      <Trash2 className="w-3 h-3 text-error" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        getProgressColor(percent),
                      )}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {editingId === goal.id ? (
                      <input
                        autoFocus
                        type="number"
                        defaultValue={goal.current_value}
                        onBlur={(e) =>
                          handleUpdateValue(goal.id, e.target.value)
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleUpdateValue(
                              goal.id,
                              (e.target as HTMLInputElement).value,
                            );
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className="w-14 h-5 px-1 bg-muted border border-border rounded text-[11px] text-foreground text-right focus:outline-none focus:ring-1 focus:ring-primary/30"
                      />
                    ) : (
                      <button
                        onClick={() => setEditingId(goal.id)}
                        className="text-[11px] font-mono text-foreground hover:text-primary transition-colors"
                        title="Cliquer pour modifier"
                      >
                        {goal.current_value}
                      </button>
                    )}
                    <span className="text-[11px] text-muted-foreground">
                      / {goal.target_value}
                      {goal.unit}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                        percent >= 100
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {percent}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
