"use client";

import { useAdminDashboard } from "@/hooks/use-admin-dashboard";
import { cn, formatCurrency } from "@/lib/utils";
import { Target, TrendingUp } from "lucide-react";

// Default monthly revenue objective (can be overridden via KPI goals)
const DEFAULT_MONTHLY_OBJECTIVE = 10000; // 10K EUR

interface AdminObjectiveProps {
  objective?: number;
  className?: string;
}

export function AdminObjective({
  objective = DEFAULT_MONTHLY_OBJECTIVE,
  className,
}: AdminObjectiveProps) {
  const { data, isLoading } = useAdminDashboard();
  const current = data?.revenueThisMonth ?? 0;
  const percent =
    objective > 0 ? Math.min(Math.round((current / objective) * 100), 100) : 0;

  const remaining = Math.max(objective - current, 0);

  return (
    <div
      className={cn("bg-surface rounded-2xl p-6", className)}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Objectif mensuel
        </h3>
        {!isLoading && (
          <span
            className={cn(
              "text-[11px] font-semibold px-2 py-0.5 rounded-full",
              percent >= 100
                ? "bg-emerald-500/10 text-emerald-600"
                : percent >= 75
                  ? "bg-blue-500/10 text-blue-600"
                  : percent >= 50
                    ? "bg-amber-500/10 text-amber-600"
                    : "bg-red-500/10 text-red-600",
            )}
          >
            {percent}%
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <div className="h-4 w-full animate-shimmer rounded-full" />
          <div className="h-3 w-32 animate-shimmer rounded-lg" />
        </div>
      ) : (
        <>
          {/* Main progress bar */}
          <div className="h-4 bg-muted rounded-full overflow-hidden mb-3">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000",
                percent >= 100
                  ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                  : percent >= 75
                    ? "bg-gradient-to-r from-blue-400 to-blue-600"
                    : percent >= 50
                      ? "bg-gradient-to-r from-amber-400 to-amber-500"
                      : "bg-gradient-to-r from-red-400 to-red-500",
              )}
              style={{ width: `${percent}%` }}
            />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-display font-bold text-foreground">
                {formatCurrency(current)}
              </span>
              <span className="text-xs text-muted-foreground ml-1">
                / {formatCurrency(objective)}
              </span>
            </div>
            {remaining > 0 ? (
              <span className="text-[11px] text-muted-foreground">
                Reste {formatCurrency(remaining)}
              </span>
            ) : (
              <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Objectif atteint
              </span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
