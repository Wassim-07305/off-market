"use client";

import { useState, useCallback, useMemo } from "react";
import { useActivityHeatmap } from "@/hooks/use-activity-heatmap";
import { Flame, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const DAY_LABELS_FULL = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];
const HOUR_LABELS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0"),
);

type HeatmapView = "day-hour" | "weekly";

function getIntensityClass(count: number, maxCount: number): string {
  if (count === 0) return "bg-muted/30";
  const ratio = count / maxCount;
  if (ratio < 0.15) return "bg-red-500/10";
  if (ratio < 0.3) return "bg-red-500/20";
  if (ratio < 0.45) return "bg-red-500/35";
  if (ratio < 0.6) return "bg-red-500/50";
  if (ratio < 0.8) return "bg-red-500/65";
  return "bg-red-500/80";
}

function getIntensityColor(count: number, maxCount: number): string {
  if (count === 0) return "var(--muted)";
  const ratio = count / maxCount;
  if (ratio < 0.15) return "rgba(239, 68, 68, 0.10)";
  if (ratio < 0.3) return "rgba(239, 68, 68, 0.20)";
  if (ratio < 0.45) return "rgba(239, 68, 68, 0.35)";
  if (ratio < 0.6) return "rgba(239, 68, 68, 0.50)";
  if (ratio < 0.8) return "rgba(239, 68, 68, 0.65)";
  return "rgba(239, 68, 68, 0.80)";
}

interface DateRangeOption {
  label: string;
  value: string;
  from: string;
  to: string;
}

function getDateRangeOptions(): DateRangeOption[] {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 86400000);
  const sixMonthsAgo = new Date(
    now.getFullYear(),
    now.getMonth() - 6,
    now.getDate(),
  );

  return [
    {
      label: "30 jours",
      value: "30d",
      from: thirtyDaysAgo.toISOString(),
      to: now.toISOString(),
    },
    {
      label: "90 jours",
      value: "90d",
      from: ninetyDaysAgo.toISOString(),
      to: now.toISOString(),
    },
    {
      label: "6 mois",
      value: "6m",
      from: sixMonthsAgo.toISOString(),
      to: now.toISOString(),
    },
  ];
}

function WeeklyContributionGrid({
  matrix,
  maxCount,
  totalCount,
  dailyTotals,
}: {
  matrix: number[][];
  maxCount: number;
  totalCount: number;
  dailyTotals: number[];
}) {
  const [tooltip, setTooltip] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  // Build weekly data from daily totals: show last 26 weeks
  const weeks = useMemo(() => {
    const now = new Date();
    const result: { weekLabel: string; total: number }[] = [];

    for (let w = 25; w >= 0; w--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - w * 7 - now.getDay() + 1);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const dayOfWeekStart = (weekStart.getDay() + 6) % 7;
      let weekTotal = 0;
      for (let d = 0; d < 7; d++) {
        const dayIdx = (dayOfWeekStart + d) % 7;
        // Distribute daily totals evenly across weeks as an approximation
        weekTotal += Math.round(dailyTotals[dayIdx] / 4);
      }

      const monthStr = weekStart.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      });

      result.push({
        weekLabel: `Sem. du ${monthStr}`,
        total: weekTotal,
      });
    }
    return result;
  }, [dailyTotals]);

  const weekMax = Math.max(1, ...weeks.map((w) => w.total));

  return (
    <div className="relative">
      <div className="flex gap-[3px] flex-wrap">
        {weeks.map((week, idx) => (
          <div
            key={idx}
            className="w-5 h-5 rounded-[3px] cursor-default transition-colors"
            style={{
              backgroundColor: getIntensityColor(week.total, weekMax),
            }}
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setTooltip({
                text: `${week.weekLabel} — ${week.total} actions`,
                x: rect.left + rect.width / 2,
                y: rect.top - 8,
              });
            }}
            onMouseLeave={() => setTooltip(null)}
          />
        ))}
      </div>
      <p className="text-[10px] text-muted-foreground mt-2">
        {totalCount} actions sur la periode
      </p>

      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, -100%)",
          }}
        >
          <div className="bg-popover border border-border rounded-lg px-2.5 py-1.5 text-xs shadow-xl whitespace-nowrap">
            <span className="font-medium text-foreground">{tooltip.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function AnalyticsActivityHeatmap() {
  const dateOptions = useMemo(() => getDateRangeOptions(), []);
  const [selectedRange, setSelectedRange] = useState(dateOptions[0]);
  const [view, setView] = useState<HeatmapView>("day-hour");

  const { data, isLoading } = useActivityHeatmap({
    from: selectedRange.from,
    to: selectedRange.to,
  });

  const [tooltip, setTooltip] = useState<{
    day: number;
    hour: number;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent, day: number, hour: number, count: number) => {
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltip({
        day,
        hour,
        count,
        x: rect.left + rect.width / 2,
        y: rect.top - 8,
      });
    },
    [],
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  return (
    <div
      className="bg-surface rounded-2xl p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-muted-foreground" />
          <div>
            <h3 className="text-[13px] font-semibold text-foreground">
              Activite par jour et heure
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Messages, interactions, journal, formations, check-ins
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center gap-1 rounded-xl p-1 bg-muted/50">
            <button
              onClick={() => setView("day-hour")}
              className={cn(
                "h-7 px-2.5 rounded-lg text-[11px] font-medium transition-all duration-200",
                view === "day-hour"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Flame className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setView("weekly")}
              className={cn(
                "h-7 px-2.5 rounded-lg text-[11px] font-medium transition-all duration-200",
                view === "weekly"
                  ? "bg-foreground text-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Calendar className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Period selector */}
          <div className="flex items-center gap-1 rounded-xl p-1 bg-muted/50">
            {dateOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSelectedRange(opt)}
                className={cn(
                  "h-7 px-2.5 rounded-lg text-[11px] font-medium transition-all duration-200",
                  selectedRange.value === opt.value
                    ? "bg-foreground text-background shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="h-52 animate-shimmer rounded-xl" />
      ) : !data ? (
        <div className="py-12 text-center text-muted-foreground text-sm">
          Pas de donnees disponibles
        </div>
      ) : view === "weekly" ? (
        <WeeklyContributionGrid
          matrix={data.matrix}
          maxCount={data.maxCount}
          totalCount={data.totalCount}
          dailyTotals={data.dailyTotals}
        />
      ) : (
        <div className="relative">
          {/* Stats summary */}
          <div className="flex items-center gap-6 mb-4">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Total actions
              </p>
              <p className="text-lg font-display font-bold text-foreground">
                {data.totalCount.toLocaleString("fr-FR")}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Pic d&apos;activite
              </p>
              <p className="text-lg font-display font-bold text-foreground">
                {DAY_LABELS_FULL[data.peakDay]}{" "}
                {String(data.peakHour).padStart(2, "0")}h
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                Actions au pic
              </p>
              <p className="text-lg font-display font-bold text-foreground">
                {data.peakCount}
              </p>
            </div>
          </div>

          {/* Hour labels */}
          <div className="flex ml-10 mb-1.5">
            {HOUR_LABELS.map((label, i) => (
              <div
                key={i}
                className={cn(
                  "flex-1 text-center text-[9px] font-mono text-muted-foreground",
                  i % 3 !== 0 && "hidden sm:block",
                )}
              >
                {i % 3 === 0 ? `${label}h` : ""}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="space-y-1">
            {DAY_LABELS.map((dayLabel, dayIndex) => (
              <div key={dayIndex} className="flex items-center gap-1.5">
                <span className="w-8 text-[10px] font-mono text-muted-foreground text-right shrink-0">
                  {dayLabel}
                </span>
                <div className="flex-1 flex gap-px">
                  {HOUR_LABELS.map((_, hourIndex) => {
                    const count = data.matrix[dayIndex][hourIndex] ?? 0;
                    return (
                      <div
                        key={hourIndex}
                        className={cn(
                          "flex-1 aspect-square rounded-[3px] transition-colors cursor-default min-w-[8px]",
                          getIntensityClass(count, data.maxCount),
                        )}
                        onMouseEnter={(e) =>
                          handleMouseEnter(e, dayIndex, hourIndex, count)
                        }
                        onMouseLeave={handleMouseLeave}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-end gap-1.5 mt-3">
            <span className="text-[10px] text-muted-foreground mr-1">
              Moins
            </span>
            <div className="w-3 h-3 rounded-[2px] bg-muted/30" />
            <div className="w-3 h-3 rounded-[2px] bg-red-500/10" />
            <div className="w-3 h-3 rounded-[2px] bg-red-500/20" />
            <div className="w-3 h-3 rounded-[2px] bg-red-500/35" />
            <div className="w-3 h-3 rounded-[2px] bg-red-500/50" />
            <div className="w-3 h-3 rounded-[2px] bg-red-500/65" />
            <div className="w-3 h-3 rounded-[2px] bg-red-500/80" />
            <span className="text-[10px] text-muted-foreground ml-1">Plus</span>
          </div>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="fixed z-50 pointer-events-none"
              style={{
                left: tooltip.x,
                top: tooltip.y,
                transform: "translate(-50%, -100%)",
              }}
            >
              <div className="bg-popover border border-border rounded-lg px-2.5 py-1.5 text-xs shadow-xl whitespace-nowrap">
                <span className="font-medium text-foreground">
                  {tooltip.count} action{tooltip.count !== 1 ? "s" : ""}
                </span>
                <span className="text-muted-foreground ml-1.5">
                  {DAY_LABELS_FULL[tooltip.day]}{" "}
                  {String(tooltip.hour).padStart(2, "0")}h
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
