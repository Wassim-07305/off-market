"use client";

import { useEffect, useRef } from "react";
import { useStreak } from "@/hooks/use-streaks";
import { STREAK_MILESTONES } from "@/types/streaks";
import { Flame, Zap, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

export function StreakWidget() {
  const { streak, recentActivity, isLoading, recordActivity } = useStreak();
  const hasRecorded = useRef(false);

  // Auto-record activity on page load (once per session)
  useEffect(() => {
    if (hasRecorded.current) return;
    hasRecorded.current = true;
    recordActivity.mutate("login");
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (isLoading) {
    return (
      <div className="bg-surface rounded-2xl p-6 animate-shimmer" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="h-5 w-32 bg-muted rounded-lg mb-4" />
        <div className="h-12 w-20 bg-muted rounded-lg" />
      </div>
    );
  }

  const currentStreak = streak?.current_streak ?? 0;
  const longestStreak = streak?.longest_streak ?? 0;
  const multiplier = streak?.xp_multiplier ?? 1;
  const totalDays = streak?.total_active_days ?? 0;

  // Build last 14 days activity map
  const activityDates = new Set(recentActivity.map((a) => a.activity_date));
  const last14Days: { date: string; active: boolean; label: string }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    last14Days.push({
      date: dateStr,
      active: activityDates.has(dateStr),
      label: d.toLocaleDateString("fr-FR", { weekday: "short" }).slice(0, 2),
    });
  }

  // Next milestone
  const nextMilestone = STREAK_MILESTONES.find((m) => m.days > currentStreak);

  return (
    <div className="bg-surface rounded-2xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Flame className="w-4 h-4 text-orange-500" />
          Streak
        </h3>
        {multiplier > 1 && (
          <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
            <Zap className="w-3 h-3" />
            {multiplier}x XP
          </span>
        )}
      </div>

      {/* Main streak number */}
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-4xl font-display font-bold text-foreground tabular-nums">
          {currentStreak}
        </span>
        <span className="text-sm text-muted-foreground">
          jour{currentStreak !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1">
          <Trophy className="w-3 h-3" />
          Record: {longestStreak}j
        </span>
        <span>Total: {totalDays}j actifs</span>
      </div>

      {/* Activity dots (last 14 days) */}
      <div className="grid grid-cols-14 gap-1 mb-4">
        {last14Days.map((day) => (
          <div key={day.date} className="flex flex-col items-center gap-0.5">
            <div
              className={cn(
                "w-5 h-5 rounded-md transition-colors",
                day.active
                  ? "bg-orange-500"
                  : "bg-muted/50"
              )}
              title={day.date}
            />
            <span className="text-[9px] text-muted-foreground">{day.label}</span>
          </div>
        ))}
      </div>

      {/* Next milestone */}
      {nextMilestone && (
        <div className="pt-3 border-t border-border">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              Prochain palier: {nextMilestone.label}
            </span>
            <span className="font-medium text-foreground">
              {nextMilestone.multiplier} XP
            </span>
          </div>
          <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full transition-all"
              style={{
                width: `${Math.min((currentStreak / nextMilestone.days) * 100, 100)}%`,
              }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">
            Encore {nextMilestone.days - currentStreak} jour{nextMilestone.days - currentStreak !== 1 ? "s" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
