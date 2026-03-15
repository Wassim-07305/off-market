"use client";

import { useState } from "react";
import {
  Target,
  Calendar,
  TrendingUp,
  Pencil,
  Check,
  X,
  Pause,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { CoachingGoal, GoalStatus } from "@/types/coaching";

// ─── Status config ───────────────────────────────────────────

const STATUS_CONFIG: Record<
  GoalStatus,
  { label: string; color: string; bgColor: string; icon: typeof Target }
> = {
  active: {
    label: "Actif",
    color: "text-blue-600",
    bgColor: "bg-blue-50 border-blue-200",
    icon: Target,
  },
  completed: {
    label: "Termine",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-200",
    icon: Check,
  },
  paused: {
    label: "En pause",
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-200",
    icon: Pause,
  },
  abandoned: {
    label: "Abandonne",
    color: "text-zinc-500",
    bgColor: "bg-zinc-50 border-zinc-200",
    icon: X,
  },
};

// ─── Deadline helpers ────────────────────────────────────────

function getDeadlineStatus(deadline: string | null): {
  label: string;
  color: string;
  urgency: "on_track" | "close" | "overdue";
} {
  if (!deadline)
    return {
      label: "Sans echeance",
      color: "text-muted-foreground",
      urgency: "on_track",
    };

  const now = new Date();
  const target = new Date(deadline);
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `En retard de ${Math.abs(diffDays)}j`,
      color: "text-red-600",
      urgency: "overdue",
    };
  }

  if (diffDays <= 7) {
    return {
      label: `${diffDays}j restants`,
      color: "text-orange-600",
      urgency: "close",
    };
  }

  return {
    label: `${diffDays}j restants`,
    color: "text-emerald-600",
    urgency: "on_track",
  };
}

// ─── Circular progress ──────────────────────────────────────

function CircularProgress({
  percentage,
  size = 72,
  strokeWidth = 5,
}: {
  percentage: number;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset =
    circumference - (Math.min(percentage, 100) / 100) * circumference;

  const getColor = () => {
    if (percentage >= 100) return "#10b981"; // emerald-500
    if (percentage >= 60) return "#3b82f6"; // blue-500
    if (percentage >= 30) return "#f59e0b"; // amber-500
    return "#ef4444"; // red-500
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-zinc-100"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-foreground tabular-nums">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}

// ─── Mini Sparkline ─────────────────────────────────────────

function MiniSparkline({ points }: { points: number[] }) {
  if (points.length < 2) return null;

  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const width = 80;
  const height = 24;
  const padding = 2;

  const pathData = points
    .map((val, i) => {
      const x = padding + (i / (points.length - 1)) * (width - padding * 2);
      const y =
        height - padding - ((val - min) / range) * (height - padding * 2);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="text-blue-500">
      <path
        d={pathData}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Component ──────────────────────────────────────────────

interface GoalProgressCardProps {
  goal: CoachingGoal;
  onUpdateProgress?: (id: string, value: number) => void;
  onEdit?: (goal: CoachingGoal) => void;
  progressHistory?: number[];
}

export function GoalProgressCard({
  goal,
  onUpdateProgress,
  onEdit,
  progressHistory,
}: GoalProgressCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(goal.current_value);

  const targetValue = goal.target_value ?? 0;
  const percentage =
    targetValue > 0 ? (goal.current_value / targetValue) * 100 : 0;
  const statusConfig = STATUS_CONFIG[goal.status];
  const deadline = getDeadlineStatus(goal.deadline);
  const StatusIcon = statusConfig.icon;

  const handleSave = () => {
    if (onUpdateProgress) {
      onUpdateProgress(goal.id, editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(goal.current_value);
    setIsEditing(false);
  };

  return (
    <div
      className={cn(
        "group relative rounded-2xl border bg-white p-5 transition-all duration-200",
        "hover:shadow-lg hover:shadow-black/[0.04] hover:border-border/80",
        goal.status === "completed" && "border-emerald-200 bg-emerald-50/30",
        goal.status === "paused" && "opacity-75",
        goal.status === "abandoned" && "opacity-50",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={cn(
                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border",
                statusConfig.bgColor,
                statusConfig.color,
              )}
            >
              <StatusIcon className="w-3 h-3" />
              {statusConfig.label}
            </span>
            {deadline.urgency === "overdue" && goal.status === "active" && (
              <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            )}
          </div>
          <h3 className="text-sm font-semibold text-foreground truncate">
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {goal.description}
            </p>
          )}
        </div>

        {/* Circular progress */}
        {targetValue > 0 && <CircularProgress percentage={percentage} />}
      </div>

      {/* Progress value */}
      {targetValue > 0 && (
        <div className="mb-3">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(Number(e.target.value))}
                className="w-24 h-8 rounded-lg border border-border bg-white px-3 text-sm font-medium tabular-nums focus:outline-none focus:ring-2 focus:ring-ring"
                min={0}
                max={targetValue * 2}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSave();
                  if (e.key === "Escape") handleCancel();
                }}
              />
              <span className="text-xs text-muted-foreground">
                / {targetValue} {goal.unit ?? ""}
              </span>
              <button
                onClick={handleSave}
                className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1.5 rounded-lg bg-zinc-200 text-zinc-600 hover:bg-zinc-300 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-foreground tabular-nums">
                {goal.current_value}
              </span>
              <span className="text-sm text-muted-foreground">
                / {targetValue} {goal.unit ?? ""}
              </span>
              {progressHistory && progressHistory.length >= 2 && (
                <MiniSparkline points={progressHistory} />
              )}
            </div>
          )}

          {/* Progress bar */}
          <div className="mt-2 h-1.5 rounded-full bg-zinc-100 overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-700 ease-out",
                percentage >= 100
                  ? "bg-emerald-500"
                  : percentage >= 60
                    ? "bg-blue-500"
                    : percentage >= 30
                      ? "bg-amber-500"
                      : "bg-red-500",
              )}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          {goal.deadline && (
            <span className={cn("flex items-center gap-1", deadline.color)}>
              <Calendar className="w-3 h-3" />
              {deadline.label}
            </span>
          )}
          {!goal.deadline && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Sans echeance
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {goal.status === "active" && targetValue > 0 && onUpdateProgress && (
            <button
              onClick={() => {
                setEditValue(goal.current_value);
                setIsEditing(true);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <TrendingUp className="w-3 h-3" />
              Mettre a jour
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(goal)}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
