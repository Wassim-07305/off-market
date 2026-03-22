"use client";

import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { cn } from "@/lib/utils";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { useAuth } from "@/hooks/use-auth";
import { CreateEventModal } from "@/components/calendar/create-event-modal";
import { EventDetailModal } from "@/components/calendar/event-detail-modal";
import type { CalendarEvent, CalendarView } from "@/types/calendar";
import { EVENT_TYPE_LABELS, EVENT_COLORS } from "@/types/calendar";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  LayoutGrid,
  List,
  Clock,
} from "lucide-react";

// ─── Helpers ─────────────────────────────
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

const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  // Monday = 0
  let startOffset = firstDay.getDay() - 1;
  if (startOffset < 0) startOffset = 6;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: Date[] = [];

  // Previous month padding
  for (let i = startOffset - 1; i >= 0; i--) {
    days.push(new Date(year, month, -i));
  }
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i));
  }
  // Next month padding (fill to 42 = 6 rows)
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push(new Date(year, month + 1, i));
  }

  return days;
}

function getWeekDays(date: Date) {
  const day = date.getDay();
  const monday = new Date(date);
  monday.setDate(date.getDate() - (day === 0 ? 6 : day - 1));
  monday.setHours(0, 0, 0, 0);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7h -> 20h

// ─── Component ───────────────────────────
export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  useEffect(() => {
    if (window.innerWidth < 768 && view === "week") setView("day");
  }, []);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [createDefaultDate, setCreateDefaultDate] = useState<string>();

  const { isAdmin, isCoach } = useAuth();
  const canCreate = isAdmin || isCoach;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Compute range for fetching events
  const { rangeStart, rangeEnd } = useMemo(() => {
    if (view === "month") {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month + 2, 0);
      return { rangeStart: start, rangeEnd: end };
    }
    if (view === "week") {
      const days = getWeekDays(currentDate);
      const start = new Date(days[0]);
      start.setDate(start.getDate() - 1);
      const end = new Date(days[6]);
      end.setDate(end.getDate() + 1);
      return { rangeStart: start, rangeEnd: end };
    }
    // day
    const start = new Date(currentDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(currentDate);
    end.setHours(23, 59, 59, 999);
    return { rangeStart: start, rangeEnd: end };
  }, [year, month, currentDate, view]);

  const { events, isLoading } = useCalendarEvents(rangeStart, rangeEnd);

  // Group events by date key
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const e of events) {
      const key = toDateKey(new Date(e.start));
      if (!map[key]) map[key] = [];
      map[key].push(e);
    }
    return map;
  }, [events]);

  // Navigation
  const navigate = (direction: number) => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (view === "month") next.setMonth(next.getMonth() + direction);
      else if (view === "week") next.setDate(next.getDate() + direction * 7);
      else next.setDate(next.getDate() + direction);
      return next;
    });
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDay(null);
  };

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    if (view === "month") {
      // If clicking a day in a different month, navigate to it
      if (day.getMonth() !== month) {
        setCurrentDate(new Date(day));
      }
    }
  };

  const handleDayDoubleClick = (day: Date) => {
    // Double-click on a day in month view → switch to day view
    if (view === "month") {
      setCurrentDate(new Date(day));
      setView("day");
      setSelectedDay(null);
    }
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowDetailModal(true);
  };

  const handleCreateClick = (date?: Date) => {
    if (date) {
      setCreateDefaultDate(toDateKey(date));
    } else {
      setCreateDefaultDate(toDateKey(new Date()));
    }
    setShowCreateModal(true);
  };

  const today = new Date();

  // ─── Header Title ─────────────────
  const headerTitle = useMemo(() => {
    if (view === "month") return `${MONTHS_FR[month]} ${year}`;
    if (view === "week") {
      const days = getWeekDays(currentDate);
      const start = days[0];
      const end = days[6];
      if (start.getMonth() === end.getMonth()) {
        return `${start.getDate()} — ${end.getDate()} ${MONTHS_FR[start.getMonth()]} ${start.getFullYear()}`;
      }
      return `${start.getDate()} ${MONTHS_FR[start.getMonth()]} — ${end.getDate()} ${MONTHS_FR[end.getMonth()]} ${end.getFullYear()}`;
    }
    return currentDate.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }, [view, month, year, currentDate]);

  // ─── Selected day events ──────────
  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return [];
    const key = toDateKey(selectedDay);
    return eventsByDate[key] ?? [];
  }, [selectedDay, eventsByDate]);

  // ─── Month Grid ────────────────────
  const monthDays = useMemo(() => getMonthDays(year, month), [year, month]);

  // ─── Week Days ─────────────────────
  const weekDays = useMemo(() => getWeekDays(currentDate), [currentDate]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* ═══ Header ═══ */}
      <motion.div
        variants={staggerItem}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              Calendrier
            </span>
          </h1>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {events.length} evenement{events.length !== 1 ? "s" : ""} sur la
            periode
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex rounded-xl overflow-hidden border border-border dark:border-border/50">
            {(
              [
                { key: "month", label: "Mois", icon: LayoutGrid },
                { key: "week", label: "Semaine", icon: CalendarIcon },
                { key: "day", label: "Jour", icon: Clock },
              ] as const
            ).map((v) => (
              <button
                key={v.key}
                onClick={() => {
                  setView(v.key);
                  setSelectedDay(null);
                }}
                className={cn(
                  "h-9 px-3 flex items-center gap-1.5 text-xs font-medium transition-all duration-200",
                  v.key !== "month" &&
                    "border-l border-border dark:border-border/50",
                  view === v.key
                    ? "bg-[#AF0000] text-white"
                    : "bg-surface dark:bg-surface text-muted-foreground hover:text-foreground hover:bg-zinc-50 dark:hover:bg-muted",
                  v.key === "week" && "hidden md:inline-flex",
                )}
              >
                <v.icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{v.label}</span>
              </button>
            ))}
          </div>

          {/* Create button */}
          {canCreate && (
            <button
              onClick={() => handleCreateClick()}
              className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#AF0000] to-[#DC2626] text-white text-sm font-semibold hover:shadow-lg hover:shadow-[#AF0000]/20 transition-all duration-300 active:scale-[0.98] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Evenement</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* ═══ Navigation ═══ */}
      <motion.div variants={staggerItem} className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-muted border border-border dark:border-border/50 bg-surface dark:bg-surface transition-all duration-200"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={goToToday}
          className="h-8 px-3 rounded-xl text-xs font-semibold text-[#AF0000] hover:bg-[#AF0000]/5 border border-[#AF0000]/20 transition-all duration-200"
        >
          Aujourd&apos;hui
        </button>
        <button
          onClick={() => navigate(1)}
          className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-muted border border-border dark:border-border/50 bg-surface dark:bg-surface transition-all duration-200"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <span className="text-sm font-semibold text-foreground font-mono tracking-tight">
          {headerTitle}
        </span>
      </motion.div>

      {/* ═══ Legend ═══ */}
      <motion.div variants={staggerItem} className="flex items-center gap-4">
        {(["session", "call", "event"] as const).map((type) => (
          <div key={type} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full ring-2 ring-white dark:ring-zinc-900 shadow-sm"
              style={{ backgroundColor: EVENT_COLORS[type] }}
            />
            <span className="text-xs font-medium text-muted-foreground/80">
              {EVENT_TYPE_LABELS[type]}
            </span>
          </div>
        ))}
      </motion.div>

      {/* ═══ Calendar Grid ═══ */}
      <motion.div variants={staggerItem}>
        {isLoading ? (
          <div
            className="bg-surface dark:bg-surface border border-border dark:border-border/50 rounded-2xl p-8"
            style={{
              boxShadow:
                "0 1px 3px rgb(0 0 0 / 0.04), 0 8px 20px rgb(0 0 0 / 0.02)",
            }}
          >
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-zinc-50 dark:bg-muted rounded-xl animate-shimmer"
                />
              ))}
            </div>
          </div>
        ) : view === "month" ? (
          <MonthView
            days={monthDays}
            month={month}
            today={today}
            selectedDay={selectedDay}
            eventsByDate={eventsByDate}
            onDayClick={handleDayClick}
            onDayDoubleClick={handleDayDoubleClick}
            onEventClick={handleEventClick}
            onCreateClick={canCreate ? handleCreateClick : undefined}
          />
        ) : view === "week" ? (
          <WeekViewCalendar
            days={weekDays}
            today={today}
            selectedDay={selectedDay}
            eventsByDate={eventsByDate}
            onDayClick={handleDayClick}
            onEventClick={handleEventClick}
            onCreateClick={canCreate ? handleCreateClick : undefined}
          />
        ) : (
          <DayView
            day={currentDate}
            events={eventsByDate[toDateKey(currentDate)] ?? []}
            onEventClick={handleEventClick}
            onCreateClick={
              canCreate ? () => handleCreateClick(currentDate) : undefined
            }
          />
        )}
      </motion.div>

      {/* ═══ Selected Day Sidebar ═══ */}
      {selectedDay && view !== "day" && (
        <motion.div
          variants={staggerItem}
          className="bg-surface dark:bg-surface border border-border dark:border-border/50 rounded-2xl p-5"
          style={{
            boxShadow:
              "0 1px 3px rgb(0 0 0 / 0.04), 0 8px 20px rgb(0 0 0 / 0.02)",
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-foreground">
              {selectedDay.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h3>
            {canCreate && (
              <button
                onClick={() => handleCreateClick(selectedDay)}
                className="text-xs font-semibold text-[#AF0000] hover:text-[#DC2626] transition-colors"
              >
                + Ajouter
              </button>
            )}
          </div>
          {selectedDayEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground/60 py-4 text-center">
              Aucun evenement ce jour
            </p>
          ) : (
            <div className="space-y-2">
              {selectedDayEvents.map((e) => (
                <button
                  key={e.id}
                  onClick={() => handleEventClick(e)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-zinc-50 dark:hover:bg-muted/50 transition-all duration-200 text-left group"
                >
                  <div
                    className="w-1 h-10 rounded-full shrink-0"
                    style={{ backgroundColor: e.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate group-hover:text-[#AF0000] transition-colors">
                      {e.title}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">
                      {formatTime(e.start)}
                      {e.end && ` — ${formatTime(e.end)}`}
                      {" · "}
                      {EVENT_TYPE_LABELS[e.type]}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ═══ Modals ═══ */}
      <CreateEventModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        defaultDate={createDefaultDate}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
      />
      <EventDetailModal
        open={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedEvent(null);
        }}
        event={selectedEvent}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
      />
    </motion.div>
  );
}

// ─── Month View ──────────────────────────
function MonthView({
  days,
  month,
  today,
  selectedDay,
  eventsByDate,
  onDayClick,
  onDayDoubleClick,
  onEventClick,
  onCreateClick,
}: {
  days: Date[];
  month: number;
  today: Date;
  selectedDay: Date | null;
  eventsByDate: Record<string, CalendarEvent[]>;
  onDayClick: (d: Date) => void;
  onDayDoubleClick?: (d: Date) => void;
  onEventClick: (e: CalendarEvent) => void;
  onCreateClick?: (d: Date) => void;
}) {
  return (
    <div
      className="bg-surface dark:bg-surface border border-border dark:border-border/50 rounded-2xl overflow-hidden"
      style={{
        boxShadow: "0 1px 3px rgb(0 0 0 / 0.04), 0 8px 20px rgb(0 0 0 / 0.02)",
      }}
    >
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-zinc-100 dark:border-border/30 bg-zinc-50/50 dark:bg-muted/30">
        {DAYS_FR.map((d) => (
          <div
            key={d}
            className="px-2 py-2.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 text-center"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7">
        {days.map((day, i) => {
          const key = toDateKey(day);
          const dayEvents = eventsByDate[key] ?? [];
          const isCurrentMonth = day.getMonth() === month;
          const isToday = isSameDay(day, today);
          const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;

          return (
            <button
              key={i}
              onClick={() => onDayClick(day)}
              onDoubleClick={() => onDayDoubleClick?.(day) ?? onCreateClick?.(day)}
              className={cn(
                "relative min-h-[80px] sm:min-h-[100px] p-1.5 border-b border-r border-zinc-100/80 dark:border-border/15 text-left transition-all duration-200 group",
                !isCurrentMonth && "bg-zinc-50/50 dark:bg-muted/20",
                isSelected && "bg-[#AF0000]/5 ring-1 ring-[#AF0000]/20",
                isToday && !isSelected && "bg-[#AF0000]/[0.02]",
                "hover:bg-zinc-50 dark:hover:bg-muted/30",
              )}
            >
              {/* Day number */}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full transition-all duration-200",
                    isToday
                      ? "bg-gradient-to-br from-[#AF0000] to-[#DC2626] text-white shadow-sm shadow-[#AF0000]/30"
                      : isCurrentMonth
                        ? "text-foreground"
                        : "text-muted-foreground/40",
                  )}
                >
                  {day.getDate()}
                </span>
                {onCreateClick && (
                  <span className="text-muted-foreground/0 group-hover:text-muted-foreground/50 transition-colors text-xs">
                    +
                  </span>
                )}
              </div>

              {/* Events (max 3 shown) */}
              <div className="mt-1 space-y-0.5">
                {dayEvents.slice(0, 3).map((e) => (
                  <div
                    key={e.id}
                    onClick={(ev) => {
                      ev.stopPropagation();
                      onEventClick(e);
                    }}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] leading-tight truncate cursor-pointer hover:opacity-80 transition-all duration-150"
                    style={{
                      backgroundColor: `${e.color}15`,
                      color: e.color,
                    }}
                  >
                    <span
                      className="w-1 h-1 rounded-full shrink-0"
                      style={{ backgroundColor: e.color }}
                    />
                    <span className="truncate font-medium">{e.title}</span>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-muted-foreground/60 font-medium pl-1">
                    +{dayEvents.length - 3} de plus
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Week View ───────────────────────────
function WeekViewCalendar({
  days,
  today,
  selectedDay,
  eventsByDate,
  onDayClick,
  onEventClick,
  onCreateClick,
}: {
  days: Date[];
  today: Date;
  selectedDay: Date | null;
  eventsByDate: Record<string, CalendarEvent[]>;
  onDayClick: (d: Date) => void;
  onEventClick: (e: CalendarEvent) => void;
  onCreateClick?: (d: Date) => void;
}) {
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="bg-surface dark:bg-surface border border-border dark:border-border/50 rounded-2xl overflow-hidden"
      style={{
        boxShadow: "0 1px 3px rgb(0 0 0 / 0.04), 0 8px 20px rgb(0 0 0 / 0.02)",
      }}
    >
      <div className="grid grid-cols-7 divide-x divide-zinc-100 dark:divide-border/20">
        {days.map((day, i) => {
          const key = toDateKey(day);
          const dayEvents = eventsByDate[key] ?? [];
          const isToday = isSameDay(day, today);
          const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;

          return (
            <div
              key={i}
              className={cn(
                "min-h-[300px] flex flex-col",
                isSelected && "bg-[#AF0000]/5",
              )}
            >
              {/* Header */}
              <button
                onClick={() => onDayClick(day)}
                className="flex flex-col items-center py-3 border-b border-zinc-100 dark:border-border/20 hover:bg-zinc-50/60 dark:hover:bg-muted/30 transition-all duration-200"
              >
                <span className="text-[10px] text-muted-foreground/60 uppercase font-bold tracking-wider">
                  {DAYS_FR[i]}
                </span>
                <span
                  className={cn(
                    "mt-0.5 w-7 h-7 flex items-center justify-center rounded-full text-sm font-bold transition-all duration-200",
                    isToday
                      ? "bg-gradient-to-br from-[#AF0000] to-[#DC2626] text-white shadow-sm shadow-[#AF0000]/30"
                      : "text-foreground",
                  )}
                >
                  {day.getDate()}
                </span>
              </button>

              {/* Events list */}
              <div className="flex-1 p-1.5 space-y-1.5 overflow-y-auto">
                {dayEvents.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => onEventClick(e)}
                    className="w-full p-2 rounded-lg text-left text-[11px] leading-tight transition-all duration-200 hover:shadow-sm hover:-translate-y-px"
                    style={{
                      backgroundColor: `${e.color}12`,
                      borderLeft: `3px solid ${e.color}`,
                      color: e.color,
                    }}
                  >
                    <div className="font-semibold truncate">{e.title}</div>
                    <div className="opacity-60 mt-0.5 font-medium">
                      {formatTime(e.start)}
                    </div>
                  </button>
                ))}
                {dayEvents.length === 0 && onCreateClick && (
                  <button
                    onClick={() => onCreateClick(day)}
                    className="w-full py-8 flex items-center justify-center text-muted-foreground/20 hover:text-[#AF0000]/40 transition-colors duration-200"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Day View ────────────────────────────
function DayView({
  day,
  events,
  onEventClick,
  onCreateClick,
}: {
  day: Date;
  events: CalendarEvent[];
  onEventClick: (e: CalendarEvent) => void;
  onCreateClick?: () => void;
}) {
  const HOUR_HEIGHT = 64; // px per hour slot
  const START_HOUR = HOURS[0]; // 7
  const isToday = isSameDay(day, new Date());

  // Current time indicator position
  const [nowOffset, setNowOffset] = useState<number | null>(null);

  useEffect(() => {
    if (!isToday) {
      setNowOffset(null);
      return;
    }
    const update = () => {
      const now = new Date();
      const hours = now.getHours() + now.getMinutes() / 60;
      const offset = (hours - START_HOUR) * HOUR_HEIGHT;
      setNowOffset(offset);
    };
    update();
    const interval = setInterval(update, 60_000); // update every minute
    return () => clearInterval(interval);
  }, [isToday, START_HOUR, HOUR_HEIGHT]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate event position and height
  const positionedEvents = useMemo(() => {
    return events.map((e) => {
      const start = new Date(e.start);
      const startHours = start.getHours() + start.getMinutes() / 60;
      const top = (startHours - START_HOUR) * HOUR_HEIGHT;

      let durationHours = 1; // default 1h
      if (e.end) {
        const end = new Date(e.end);
        durationHours =
          (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        if (durationHours < 0.25) durationHours = 0.25; // min 15min display
      }
      const height = durationHours * HOUR_HEIGHT;

      return { event: e, top, height };
    });
  }, [events, START_HOUR, HOUR_HEIGHT]);

  return (
    <div
      className="bg-surface dark:bg-surface border border-border dark:border-border/50 rounded-2xl overflow-hidden"
      style={{
        boxShadow:
          "0 1px 3px rgb(0 0 0 / 0.04), 0 8px 20px rgb(0 0 0 / 0.02)",
      }}
    >
      {/* Time grid */}
      <div className="relative" style={{ height: HOURS.length * HOUR_HEIGHT }}>
        {/* Hour lines + labels */}
        {HOURS.map((hour, i) => (
          <div
            key={hour}
            className="absolute left-0 right-0 flex"
            style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
          >
            {/* Time label */}
            <div className="w-16 shrink-0 flex items-start justify-end pr-3 pt-1">
              <span className="text-xs font-mono font-medium text-muted-foreground/50">
                {String(hour).padStart(2, "0")}:00
              </span>
            </div>

            {/* Row with border + create button */}
            <div
              className="flex-1 border-l border-t border-zinc-100 dark:border-border/20 relative group cursor-pointer"
              onDoubleClick={() => {
                if (onCreateClick) onCreateClick();
              }}
            >
              {onCreateClick && (
                <button
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onCreateClick();
                  }}
                  className="absolute right-2 top-1 w-5 h-5 rounded-full flex items-center justify-center text-muted-foreground/0 group-hover:text-muted-foreground/50 hover:!text-[#AF0000] hover:!bg-[#AF0000]/10 transition-all duration-200"
                >
                  <Plus className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Positioned events */}
        <div className="absolute left-16 right-0" style={{ top: 0, bottom: 0 }}>
          {positionedEvents.map(({ event: e, top, height }) => (
            <button
              key={e.id}
              onClick={() => onEventClick(e)}
              className="absolute left-1.5 right-2 rounded-xl text-left transition-all duration-200 hover:shadow-md hover:-translate-y-px group overflow-hidden z-10"
              style={{
                top: Math.max(top, 0),
                height: Math.max(height, 24),
                backgroundColor: `${e.color}15`,
                borderLeft: `3px solid ${e.color}`,
              }}
            >
              <div className="p-2 h-full flex flex-col justify-center">
                <p className="text-sm font-semibold text-foreground truncate group-hover:text-[#AF0000] transition-colors">
                  {e.title}
                </p>
                {height >= 40 && (
                  <p className="text-xs text-muted-foreground/60 mt-0.5">
                    {formatTime(e.start)}
                    {e.end && ` — ${formatTime(e.end)}`}
                    {" · "}
                    {EVENT_TYPE_LABELS[e.type]}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>

        {/* Now line (red) */}
        {nowOffset !== null && nowOffset >= 0 && nowOffset <= HOURS.length * HOUR_HEIGHT && (
          <div
            className="absolute left-14 right-0 z-20 pointer-events-none flex items-center"
            style={{ top: nowOffset }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-[#AF0000] -ml-1.5 shadow-sm shadow-[#AF0000]/30" />
            <div className="flex-1 h-[2px] bg-[#AF0000]/70" />
          </div>
        )}
      </div>

      {/* Empty state */}
      {events.length === 0 && (
        <div className="p-10 text-center border-t border-zinc-100 dark:border-border/20">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-muted flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="w-6 h-6 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium text-muted-foreground mb-1">
            Aucun evenement ce jour
          </p>
          <p className="text-xs text-muted-foreground/60 mb-4">
            Double-cliquez sur un creneau pour en creer un
          </p>
          {onCreateClick && (
            <button
              onClick={onCreateClick}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#AF0000] hover:text-[#DC2626] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Creer un evenement
            </button>
          )}
        </div>
      )}
    </div>
  );
}
