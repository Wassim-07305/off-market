"use client";

import { useState, useCallback } from "react";
import { useActivityHeatmap } from "@/hooks/use-activity-heatmap";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const HOUR_LABELS = Array.from({ length: 24 }, (_, i) =>
  String(i).padStart(2, "0"),
);

function getIntensityClass(count: number, maxCount: number): string {
  if (count === 0) return "bg-muted/30";
  const ratio = count / maxCount;
  if (ratio < 0.2) return "bg-primary/10";
  if (ratio < 0.4) return "bg-primary/25";
  if (ratio < 0.6) return "bg-primary/40";
  if (ratio < 0.8) return "bg-primary/60";
  return "bg-primary/80";
}

export function ActivityHeatmap() {
  const { data, isLoading } = useActivityHeatmap();
  const [tooltip, setTooltip] = useState<{
    day: number;
    hour: number;
    count: number;
    x: number;
    y: number;
  } | null>(null);

  const handleMouseEnter = useCallback(
    (
      e: React.MouseEvent,
      day: number,
      hour: number,
      count: number,
    ) => {
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
      <div className="flex items-center gap-2 mb-5">
        <Flame className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-[13px] font-semibold text-foreground">
          Activite par creneau
        </h3>
      </div>

      {isLoading ? (
        <div className="h-48 animate-shimmer rounded-xl" />
      ) : (
        <div className="relative">
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
                {i % 3 === 0 ? label : ""}
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
                    const count = data?.matrix[dayIndex][hourIndex] ?? 0;
                    const maxCount = data?.maxCount ?? 1;
                    return (
                      <div
                        key={hourIndex}
                        className={cn(
                          "flex-1 aspect-square rounded-[3px] transition-colors cursor-default min-w-[8px]",
                          getIntensityClass(count, maxCount),
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
            <div className="w-3 h-3 rounded-[2px] bg-primary/10" />
            <div className="w-3 h-3 rounded-[2px] bg-primary/25" />
            <div className="w-3 h-3 rounded-[2px] bg-primary/40" />
            <div className="w-3 h-3 rounded-[2px] bg-primary/60" />
            <div className="w-3 h-3 rounded-[2px] bg-primary/80" />
            <span className="text-[10px] text-muted-foreground ml-1">
              Plus
            </span>
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
              <div className="bg-popover border border-border rounded-lg px-2.5 py-1.5 text-xs shadow-xl">
                <span className="font-medium text-foreground">
                  {tooltip.count} activite{tooltip.count !== 1 ? "s" : ""}
                </span>
                <span className="text-muted-foreground ml-1.5">
                  {DAY_LABELS[tooltip.day]}{" "}
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
