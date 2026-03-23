"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import type { StudentWithDetails } from "@/hooks/use-students";
import { getStudentDetail } from "@/hooks/use-students";
import { cn, getInitials, formatCurrency, formatDate } from "@/lib/utils";
import { FlagDot } from "./flag-indicator";
import { EngagementTagBadge } from "./engagement-tag";
import { Mail, MessageSquare, User, TrendingUp, Calendar } from "lucide-react";

interface StudentGridProps {
  students: StudentWithDetails[];
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
}

export function StudentGrid({
  students,
  selectedIds,
  onToggleSelect,
}: StudentGridProps) {
  const prefix = useRoutePrefix();
  const router = useRouter();

  if (students.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm text-muted-foreground">
          Aucun élève pour le moment
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {students.map((student) => {
        const details = getStudentDetail(student);
        const flag = details?.flag ?? "green";
        const score = details?.health_score ?? 0;
        const isSelected = selectedIds.has(student.id);

        return (
          <div
            key={student.id}
            onClick={() => router.push(`${prefix}/crm/${student.id}`)}
            className={cn(
              "relative bg-surface border rounded-2xl overflow-hidden transition-all duration-200 group hover:shadow-md cursor-pointer",
              isSelected
                ? "border-primary ring-2 ring-primary/20"
                : "border-border",
              flag === "red" && !isSelected && "border-red-200",
              flag === "orange" && !isSelected && "border-orange-200",
            )}
          >
            {/* Selection checkbox */}
            <div
              className="absolute top-3 left-3 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(student.id)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                style={isSelected ? { opacity: 1 } : undefined}
              />
            </div>

            {/* Flag indicator */}
            <div className="absolute top-3 right-3 z-10">
              <FlagDot flag={flag} size="md" pulse={flag === "red"} />
            </div>

            <div className="p-5 pt-10">
              {/* Avatar & name */}
              <div className="flex flex-col items-center text-center mb-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-lg text-primary font-semibold mb-2.5">
                  {student.avatar_url ? (
                    <Image
                      src={student.avatar_url}
                      alt=""
                      width={56}
                      height={56}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    getInitials(student.full_name)
                  )}
                </div>
                <h3 className="text-sm font-semibold text-foreground truncate w-full">
                  {student.full_name}
                </h3>
                <p className="text-[11px] text-muted-foreground truncate w-full flex items-center justify-center gap-1">
                  <Mail className="w-3 h-3" />
                  {student.email}
                </p>
              </div>

              {/* Tag */}
              <div className="flex justify-center mb-3">
                {details?.tag && (
                  <EngagementTagBadge tag={details.tag} size="sm" />
                )}
              </div>

              {/* Progress bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-muted-foreground">
                    Progression
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {score}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      score >= 70
                        ? "bg-emerald-500"
                        : score >= 40
                          ? "bg-amber-500"
                          : "bg-red-500",
                    )}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="rounded-lg bg-muted/50 p-2">
                  <p className="text-xs font-semibold text-foreground font-mono">
                    {formatCurrency(Number(details?.revenue ?? 0))}
                  </p>
                  <p className="text-[9px] text-muted-foreground flex items-center justify-center gap-0.5">
                    <TrendingUp className="w-2.5 h-2.5" />
                    Revenus
                  </p>
                </div>
                <div className="rounded-lg bg-muted/50 p-2">
                  <p className="text-xs font-semibold text-foreground">
                    {details?.last_engagement_at
                      ? formatDate(details.last_engagement_at, "relative")
                      : "-"}
                  </p>
                  <p className="text-[9px] text-muted-foreground flex items-center justify-center gap-0.5">
                    <Calendar className="w-2.5 h-2.5" />
                    Activite
                  </p>
                </div>
              </div>

              {/* Coach */}
              {details?.assigned_coach_profile && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <User className="w-3 h-3" />
                    <span>
                      Coach: {details.assigned_coach_profile.full_name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
