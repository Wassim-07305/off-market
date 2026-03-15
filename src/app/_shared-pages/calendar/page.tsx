"use client";

import { useState, useMemo } from "react";
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
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
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
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            Calendrier
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {events.length} événement{events.length !== 1 ? "s" : ""} sur la
            période
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div
            className="flex rounded-xl overflow-hidden"
            style={{ boxShadow: "var(--shadow-xs)" }}
          >
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
                  "h-9 px-3 flex items-center gap-1.5 text-xs font-medium transition-all",
                  view === v.key
                    ? "bg-foreground text-background"
                    : "bg-surface text-muted-foreground hover:text-foreground",
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
              className="h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Événement</span>
            </button>
          )}
        </div>
      </motion.div>

      {/* ═══ Navigation ═══ */}
      <motion.div variants={staggerItem} className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={goToToday}
          className="h-8 px-3 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          style={{ boxShadow: "var(--shadow-xs)" }}
        >
          Aujourd&apos;hui
        </button>
        <button
          onClick={() => navigate(1)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <span className="text-sm font-medium text-foreground font-mono">
          {headerTitle}
        </span>
      </motion.div>

      {/* ═══ Legend ═══ */}
      <motion.div variants={staggerItem} className="flex items-center gap-4">
        {(["session", "call", "event"] as const).map((type) => (
          <div key={type} className="flex items-center gap-1.5">
            <div
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: EVENT_COLORS[type] }}
            />
            <span className="text-xs text-muted-foreground">
              {EVENT_TYPE_LABELS[type]}
            </span>
          </div>
        ))}
      </motion.div>

      {/* ═══ Calendar Grid ═══ */}
      <motion.div variants={staggerItem}>
        {isLoading ? (
          <div
            className="bg-surface rounded-2xl p-8"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 bg-muted rounded-lg animate-shimmer"
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
            onEventClick={handleEventClick}
            onCreateClick={canCreate ? handleCreateClick : undefined}
          />
        ) : view === "week" ? (
          <WeekView
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
          className="bg-surface rounded-2xl p-4"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">
              {selectedDay.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </h3>
            {canCreate && (
              <button
                onClick={() => handleCreateClick(selectedDay)}
                className="text-xs text-primary hover:underline"
              >
                + Ajouter
              </button>
            )}
          </div>
          {selectedDayEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">
              Aucun événement ce jour
            </p>
          ) : (
            <div className="space-y-2">
              {selectedDayEvents.map((e) => (
                <button
                  key={e.id}
                  onClick={() => handleEventClick(e)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors text-left"
                >
                  <div
                    className="w-1 h-8 rounded-full shrink-0"
                    style={{ backgroundColor: e.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {e.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTime(e.start)}
                      {e.end && ` — ${formatTime(e.end)}`}
                      {" · "}
                      {EVENT_TYPE_LABELS[e.type]}
                    </p>
                  </div>
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
  onEventClick,
  onCreateClick,
}: {
  days: Date[];
  month: number;
  today: Date;
  selectedDay: Date | null;
  eventsByDate: Record<string, CalendarEvent[]>;
  onDayClick: (d: Date) => void;
  onEventClick: (e: CalendarEvent) => void;
  onCreateClick?: (d: Date) => void;
}) {
  return (
    <div
      className="bg-surface rounded-2xl overflow-hidden"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-border/30">
        {DAYS_FR.map((d) => (
          <div
            key={d}
            className="px-2 py-2 text-xs font-medium text-muted-foreground text-center"
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
              onDoubleClick={() => onCreateClick?.(day)}
              className={cn(
                "relative min-h-[80px] sm:min-h-[100px] p-1.5 border-b border-r border-border/20 text-left transition-colors group",
                !isCurrentMonth && "bg-muted/30",
                isSelected && "bg-primary/5 ring-1 ring-primary/20",
                "hover:bg-muted/40",
              )}
            >
              {/* Day number */}
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full",
                    isToday
                      ? "bg-primary text-white"
                      : isCurrentMonth
                        ? "text-foreground"
                        : "text-muted-foreground/50",
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
                    className="flex items-center gap-1 px-1 py-0.5 rounded text-[10px] leading-tight truncate cursor-pointer hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: `${e.color}15`,
                      color: e.color,
                    }}
                  >
                    <span
                      className="w-1 h-1 rounded-full shrink-0"
                      style={{ backgroundColor: e.color }}
                    />
                    <span className="truncate">{e.title}</span>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <span className="text-[10px] text-muted-foreground pl-1">
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
function WeekView({
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
      className="bg-surface rounded-2xl overflow-hidden"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="grid grid-cols-7 divide-x divide-border/20">
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
                isSelected && "bg-primary/5",
              )}
            >
              {/* Header */}
              <button
                onClick={() => onDayClick(day)}
                className={cn(
                  "flex flex-col items-center py-3 border-b border-border/20 hover:bg-muted/30 transition-colors",
                )}
              >
                <span className="text-[10px] text-muted-foreground uppercase">
                  {DAYS_FR[i]}
                </span>
                <span
                  className={cn(
                    "mt-0.5 w-7 h-7 flex items-center justify-center rounded-full text-sm font-semibold",
                    isToday ? "bg-primary text-white" : "text-foreground",
                  )}
                >
                  {day.getDate()}
                </span>
              </button>

              {/* Events list */}
              <div className="flex-1 p-1 space-y-1 overflow-y-auto">
                {dayEvents.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => onEventClick(e)}
                    className="w-full p-1.5 rounded-lg text-left text-[11px] leading-tight transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: `${e.color}15`,
                      color: e.color,
                    }}
                  >
                    <div className="font-medium truncate">{e.title}</div>
                    <div className="opacity-70 mt-0.5">
                      {formatTime(e.start)}
                    </div>
                  </button>
                ))}
                {dayEvents.length === 0 && onCreateClick && (
                  <button
                    onClick={() => onCreateClick(day)}
                    className="w-full py-8 flex items-center justify-center text-muted-foreground/30 hover:text-muted-foreground/60 transition-colors"
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
  // Group events by hour
  const eventsByHour = useMemo(() => {
    const map: Record<number, CalendarEvent[]> = {};
    for (const e of events) {
      const hour = new Date(e.start).getHours();
      if (!map[hour]) map[hour] = [];
      map[hour].push(e);
    }
    return map;
  }, [events]);

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="bg-surface rounded-2xl overflow-hidden"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Hours grid */}
      <div className="divide-y divide-border/20">
        {HOURS.map((hour) => {
          const hourEvents = eventsByHour[hour] ?? [];
          return (
            <div key={hour} className="flex min-h-[60px]">
              {/* Time label */}
              <div className="w-16 shrink-0 flex items-start justify-end pr-3 pt-1">
                <span className="text-xs text-muted-foreground font-mono">
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>

              {/* Event area */}
              <div className="flex-1 border-l border-border/20 p-1 space-y-1">
                {hourEvents.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => onEventClick(e)}
                    className="w-full flex items-center gap-2 p-2 rounded-xl text-left transition-opacity hover:opacity-80"
                    style={{
                      backgroundColor: `${e.color}12`,
                      borderLeft: `3px solid ${e.color}`,
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {e.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTime(e.start)}
                        {e.end && ` — ${formatTime(e.end)}`}
                        {" · "}
                        {EVENT_TYPE_LABELS[e.type]}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state / create */}
      {events.length === 0 && (
        <div className="p-8 text-center border-t border-border/20">
          <CalendarIcon className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground mb-3">
            Aucun événement ce jour
          </p>
          {onCreateClick && (
            <button
              onClick={onCreateClick}
              className="text-sm text-primary hover:underline"
            >
              + Créer un événement
            </button>
          )}
        </div>
      )}
    </div>
  );
}
