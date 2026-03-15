"use client";

import { useState } from "react";
import { cn, formatDate } from "@/lib/utils";
import {
  CheckCircle,
  Circle,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  SkipForward,
  MessageSquare,
  Save,
} from "lucide-react";
import type { RoadmapMilestone, MilestoneStatus } from "@/types/roadmap";
import { MILESTONE_STATUS_CONFIG } from "@/types/roadmap";

interface MilestoneCardProps {
  milestone: RoadmapMilestone;
  isStaff?: boolean;
  onStatusChange?: (id: string, status: MilestoneStatus) => void;
  onComplete?: (id: string, notes?: string) => void;
  onNotesUpdate?: (id: string, notes: string) => void;
  isPending?: boolean;
}

export function MilestoneCard({
  milestone,
  isStaff = false,
  onStatusChange,
  onComplete,
  onNotesUpdate,
  isPending = false,
}: MilestoneCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [notes, setNotes] = useState(milestone.notes ?? "");
  const [checkedCriteria, setCheckedCriteria] = useState<Set<number>>(() => {
    if (milestone.status === "completed") {
      return new Set(milestone.validation_criteria.map((_, i) => i));
    }
    return new Set();
  });

  const config = MILESTONE_STATUS_CONFIG[milestone.status];
  const allCriteriaChecked =
    milestone.validation_criteria.length > 0 &&
    checkedCriteria.size === milestone.validation_criteria.length;

  const handleCriteriaToggle = (index: number) => {
    const next = new Set(checkedCriteria);
    if (next.has(index)) {
      next.delete(index);
    } else {
      next.add(index);
    }
    setCheckedCriteria(next);
  };

  const handleComplete = () => {
    if (onComplete) {
      onComplete(milestone.id, notes || undefined);
    }
  };

  const handleSaveNotes = () => {
    if (onNotesUpdate) {
      onNotesUpdate(milestone.id, notes);
    }
  };

  const statusIcon = {
    pending: <Circle className="w-5 h-5 text-zinc-400" />,
    in_progress: <PlayCircle className="w-5 h-5 text-blue-500" />,
    completed: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    skipped: <SkipForward className="w-5 h-5 text-orange-500" />,
  };

  return (
    <div
      className={cn(
        "border rounded-xl transition-all",
        config.borderColor,
        expanded ? "shadow-md" : "shadow-sm hover:shadow-md",
        milestone.status === "completed" && "opacity-80",
      )}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-4 text-left"
      >
        <div className="shrink-0">{statusIcon[milestone.status]}</div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4
              className={cn(
                "font-medium text-sm",
                milestone.status === "completed"
                  ? "line-through text-muted-foreground"
                  : "text-foreground",
              )}
            >
              {milestone.title}
            </h4>
            <span
              className={cn(
                "text-[10px] font-medium px-2 py-0.5 rounded-full border",
                config.bgColor,
                config.color,
                config.borderColor,
              )}
            >
              {config.label}
            </span>
          </div>
          {milestone.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
              {milestone.description}
            </p>
          )}
        </div>

        {/* Progress indicator */}
        {milestone.validation_criteria.length > 0 && (
          <span className="text-[11px] text-muted-foreground shrink-0">
            {checkedCriteria.size}/{milestone.validation_criteria.length}
          </span>
        )}

        <div className="shrink-0 text-muted-foreground">
          {expanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-border/50">
          {/* Description */}
          {milestone.description && (
            <p className="text-sm text-muted-foreground pt-3">
              {milestone.description}
            </p>
          )}

          {/* Validation criteria */}
          {milestone.validation_criteria.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground uppercase tracking-wider">
                Criteres de validation
              </p>
              {milestone.validation_criteria.map((criteria, index) => (
                <label
                  key={index}
                  className={cn(
                    "flex items-start gap-2.5 p-2 rounded-lg cursor-pointer transition-colors",
                    checkedCriteria.has(index)
                      ? "bg-emerald-50 border border-emerald-200"
                      : "bg-muted/50 border border-transparent hover:bg-muted",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checkedCriteria.has(index)}
                    onChange={() => handleCriteriaToggle(index)}
                    disabled={
                      milestone.status === "completed" ||
                      milestone.status === "skipped"
                    }
                    className="mt-0.5 rounded border-border text-emerald-600 focus:ring-emerald-500"
                  />
                  <span
                    className={cn(
                      "text-sm",
                      checkedCriteria.has(index)
                        ? "text-emerald-700 line-through"
                        : "text-foreground",
                    )}
                  >
                    {criteria}
                  </span>
                </label>
              ))}
            </div>
          )}

          {/* Notes */}
          {(isStaff || milestone.notes) && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
                <p className="text-xs font-medium text-foreground uppercase tracking-wider">
                  Notes
                </p>
              </div>
              {isStaff ? (
                <div className="flex gap-2">
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ajouter des notes..."
                    rows={2}
                    className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                  />
                  {notes !== (milestone.notes ?? "") && (
                    <button
                      onClick={handleSaveNotes}
                      disabled={isPending}
                      className="self-end h-8 px-3 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Save className="w-3 h-3" />
                      Sauver
                    </button>
                  )}
                </div>
              ) : (
                milestone.notes && (
                  <p className="text-sm text-muted-foreground bg-muted/50 p-2 rounded-lg">
                    {milestone.notes}
                  </p>
                )
              )}
            </div>
          )}

          {/* Completed info */}
          {milestone.completed_at && (
            <p className="text-[11px] text-muted-foreground">
              Valide le {formatDate(milestone.completed_at, "long")}
            </p>
          )}

          {/* Staff actions */}
          {isStaff && milestone.status !== "completed" && (
            <div className="flex gap-2 pt-2 border-t border-border/50">
              {milestone.status === "pending" && (
                <button
                  onClick={() => onStatusChange?.(milestone.id, "in_progress")}
                  disabled={isPending}
                  className="h-8 px-3 rounded-lg border border-blue-200 bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  Demarrer
                </button>
              )}
              {milestone.status !== "skipped" && (
                <button
                  onClick={handleComplete}
                  disabled={isPending || !allCriteriaChecked}
                  title={
                    !allCriteriaChecked
                      ? "Tous les criteres doivent etre valides"
                      : undefined
                  }
                  className="h-8 px-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  Valider
                </button>
              )}
              <button
                onClick={() => onStatusChange?.(milestone.id, "skipped")}
                disabled={isPending}
                className="h-8 px-3 rounded-lg border border-orange-200 bg-orange-50 text-orange-700 text-xs font-medium hover:bg-orange-100 disabled:opacity-50 flex items-center gap-1.5"
              >
                <SkipForward className="w-3.5 h-3.5" />
                Passer
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
