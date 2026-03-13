"use client";

import { useStudentFlagHistory } from "@/hooks/use-students";
import { STUDENT_FLAGS } from "@/lib/constants";
import { cn, formatDate, getInitials } from "@/lib/utils";
import type { StudentFlag } from "@/types/database";
import { ArrowRight, History } from "lucide-react";

interface FlagHistoryProps {
  studentId: string;
}

export function FlagHistory({ studentId }: FlagHistoryProps) {
  const { data: history, isLoading } = useStudentFlagHistory(studentId);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-muted animate-shimmer rounded-lg" />
        ))}
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="flex flex-col items-center py-6 text-center">
        <History className="w-8 h-8 text-muted-foreground/30 mb-2" />
        <p className="text-sm text-muted-foreground">
          Aucun changement de drapeau
        </p>
      </div>
    );
  }

  const getFlagConfig = (flag: StudentFlag | null) =>
    STUDENT_FLAGS.find((f) => f.value === flag);

  return (
    <div className="space-y-2">
      {history.map((entry) => {
        const prevConfig = getFlagConfig(entry.previous_flag);
        const newConfig = getFlagConfig(entry.new_flag);

        return (
          <div
            key={entry.id}
            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border"
          >
            {/* Author avatar */}
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary font-medium shrink-0 mt-0.5">
              {entry.author ? getInitials(entry.author.full_name) : "?"}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-medium text-foreground">
                  {entry.author?.full_name ?? "Inconnu"}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  a change le drapeau
                </span>
              </div>

              {/* Flag change indicator */}
              <div className="flex items-center gap-1.5 mt-1">
                {entry.previous_flag && prevConfig ? (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border",
                      prevConfig.bgColor,
                      prevConfig.textColor,
                      prevConfig.borderColor,
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        prevConfig.dotColor,
                      )}
                    />
                    {prevConfig.label}
                  </span>
                ) : (
                  <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-muted border border-border">
                    Aucun
                  </span>
                )}
                <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                {newConfig && (
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border",
                      newConfig.bgColor,
                      newConfig.textColor,
                      newConfig.borderColor,
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        newConfig.dotColor,
                      )}
                    />
                    {newConfig.label}
                  </span>
                )}
              </div>

              {/* Reason */}
              {entry.reason && (
                <p className="text-[11px] text-muted-foreground mt-1 italic">
                  &quot;{entry.reason}&quot;
                </p>
              )}

              {/* Date */}
              <p className="text-[10px] text-muted-foreground/60 mt-1">
                {formatDate(entry.created_at, "relative")}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
