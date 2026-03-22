"use client";

import { useStudents, getStudentDetail } from "@/hooks/use-students";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";

const medals = ["gold", "silver", "bronze"] as const;
const medalEmojis: Record<string, string> = {
  gold: "\u{1F947}",
  silver: "\u{1F948}",
  bronze: "\u{1F949}",
};

export function TopStudents() {
  const { students, isLoading } = useStudents({ limit: 5 });

  const sorted = [...students].sort((a, b) => {
    const aScore = getStudentDetail(a)?.health_score ?? 0;
    const bScore = getStudentDetail(b)?.health_score ?? 0;
    return bScore - aScore;
  });

  if (isLoading) {
    return (
      <div
        className="bg-surface rounded-2xl p-6"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <h3 className="text-[13px] font-semibold text-foreground mb-4">
          Top eleves
        </h3>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full animate-shimmer" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-28 animate-shimmer rounded-lg" />
                <div className="h-2 w-full animate-shimmer rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-surface rounded-2xl p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <h3 className="text-[13px] font-semibold text-foreground mb-4">
        Top eleves
      </h3>
      <div className="space-y-3">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun eleve
          </p>
        ) : (
          sorted.map((student, index) => {
            const details = getStudentDetail(student);
            const score = details?.health_score ?? 0;
            const medal = index < 3 ? medals[index] : null;

            return (
              <div key={student.id} className="flex items-center gap-3 group">
                <span className="w-6 text-center shrink-0">
                  {medal ? (
                    <span className="text-base">{medalEmojis[medal]}</span>
                  ) : (
                    <span className="text-xs font-mono text-muted-foreground">
                      {index + 1}
                    </span>
                  )}
                </span>
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-xs text-primary font-medium shrink-0">
                  {getInitials(student.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">
                    {student.full_name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-primary-hover transition-all duration-500"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
                      {score}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
