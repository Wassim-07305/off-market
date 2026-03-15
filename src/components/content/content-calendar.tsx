"use client";

import { useState, useMemo } from "react";
import {
  useContentCalendar,
  type SocialContentItem,
} from "@/hooks/use-social-content";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

// ─── Helpers ─────────────────────────────────────────────────

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const MONTHS_FR = [
  "Janvier",
  "Fevrier",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Aout",
  "Septembre",
  "Octobre",
  "Novembre",
  "Decembre",
];

const PLATFORM_DOT: Record<string, string> = {
  instagram: "bg-pink-500",
  linkedin: "bg-blue-500",
  tiktok: "bg-zinc-700 dark:bg-zinc-300",
};

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(month: number, year: number) {
  // 0=Sun, convert to Mon=0
  const d = new Date(year, month - 1, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

// ─── Calendar Component ──────────────────────────────────────

interface ContentCalendarProps {
  onEditItem: (item: SocialContentItem) => void;
  onCreateForDate: (date: string) => void;
}

export function ContentCalendar({
  onEditItem,
  onCreateForDate,
}: ContentCalendarProps) {
  const today = new Date();
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [year, setYear] = useState(today.getFullYear());

  const { data: calendarData, isLoading } = useContentCalendar(month, year);

  const todayStr = useMemo(() => {
    const d = today;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const daysInMonth = getDaysInMonth(month, year);
  const firstDay = getFirstDayOfWeek(month, year);

  const goToPrev = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const goToNext = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const goToToday = () => {
    setMonth(today.getMonth() + 1);
    setYear(today.getFullYear());
  };

  // Build calendar grid (6 rows max)
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">
            {MONTHS_FR[month - 1]} {year}
          </h2>
          <button
            onClick={goToToday}
            className="text-xs font-medium text-muted-foreground hover:text-foreground px-2.5 py-1 rounded-lg hover:bg-muted transition-colors"
          >
            Aujourd&apos;hui
          </button>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={goToPrev}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={goToNext}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-t-xl overflow-hidden">
        {DAYS_FR.map((d) => (
          <div
            key={d}
            className="bg-muted/50 py-2 text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-b-xl overflow-hidden -mt-4">
        {cells.map((day, idx) => {
          if (day === null) {
            return (
              <div
                key={`empty-${idx}`}
                className="bg-surface/50 min-h-[100px]"
              />
            );
          }

          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const dayItems = calendarData?.[dateStr] ?? [];
          const isToday = dateStr === todayStr;

          return (
            <div
              key={dateStr}
              className={cn(
                "bg-surface min-h-[100px] p-1.5 relative group transition-colors",
                "hover:bg-muted/30",
              )}
            >
              {/* Day number */}
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                    isToday
                      ? "bg-foreground text-background font-bold"
                      : "text-muted-foreground",
                  )}
                >
                  {day}
                </span>
                <button
                  onClick={() => onCreateForDate(dateStr + "T09:00:00")}
                  className="w-5 h-5 rounded-md flex items-center justify-center text-muted-foreground/0 group-hover:text-muted-foreground hover:!bg-muted hover:!text-foreground transition-all"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              {/* Items */}
              <div className="space-y-0.5">
                {dayItems.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onEditItem(item)}
                    className={cn(
                      "w-full text-left text-[10px] leading-tight font-medium px-1.5 py-1 rounded-md truncate flex items-center gap-1 transition-colors",
                      "hover:bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        PLATFORM_DOT[item.platform] ?? "bg-zinc-400",
                      )}
                    />
                    <span className="truncate text-foreground">
                      {item.title}
                    </span>
                  </button>
                ))}
                {dayItems.length > 3 && (
                  <span className="text-[10px] text-muted-foreground px-1.5">
                    +{dayItems.length - 3} de plus
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="text-center py-4 text-sm text-muted-foreground">
          Chargement...
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground pt-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-pink-500" /> Instagram
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500" /> LinkedIn
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-zinc-700 dark:bg-zinc-300" />{" "}
          TikTok
        </span>
      </div>
    </div>
  );
}
