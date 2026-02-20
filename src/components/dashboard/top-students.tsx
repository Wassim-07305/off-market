"use client";

import { useStudents } from "@/hooks/use-students";
import { getInitials } from "@/lib/utils";

export function TopStudents() {
  const { students, isLoading } = useStudents({ limit: 5 });

  const sorted = [...students].sort((a, b) => {
    const aScore = a.student_details?.[0]?.health_score ?? 0;
    const bScore = b.student_details?.[0]?.health_score ?? 0;
    return bScore - aScore;
  });

  if (isLoading) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Top eleves
        </h3>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-muted" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-28 bg-muted rounded" />
                <div className="h-2 w-full bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Top eleves
      </h3>
      <div className="space-y-3">
        {sorted.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun eleve
          </p>
        ) : (
          sorted.map((student, index) => {
            const details = student.student_details?.[0];
            const score = details?.health_score ?? 0;
            return (
              <div key={student.id} className="flex items-center gap-3">
                <span className="text-xs font-mono text-muted-foreground w-5 text-right">
                  {index + 1}
                </span>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium shrink-0">
                  {getInitials(student.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {student.full_name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${score}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
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
