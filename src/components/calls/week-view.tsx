"use client";

import { cn } from "@/lib/utils";
import { CallTypeBadge } from "./call-type-badge";
import { CALL_STATUS_COLORS, type CallCalendarWithRelations } from "@/types/calls";
import type { GoogleCalendarEvent } from "@/types/google-calendar";

interface WeekViewProps {
  calls: CallCalendarWithRelations[];
  weekStart: Date;
  isLoading: boolean;
  onCallClick: (call: CallCalendarWithRelations) => void;
  onSlotClick: (date: string, time: string) => void;
  googleEvents?: GoogleCalendarEvent[];
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8h to 20h
const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function WeekView({ calls, weekStart, isLoading, onCallClick, onSlotClick, googleEvents }: WeekViewProps) {
  const today = new Date().toISOString().split("T")[0];

  const getDayDate = (dayIndex: number) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + dayIndex);
    return d;
  };

  const getCallsForSlot = (dayIndex: number, hour: number) => {
    const dayStr = getDayDate(dayIndex).toISOString().split("T")[0];
    return calls.filter((call) => {
      if (call.date !== dayStr) return false;
      const callHour = parseInt(call.time.split(":")[0]);
      return callHour === hour;
    });
  };

  const getGoogleEventsForSlot = (dayIndex: number, hour: number) => {
    if (!googleEvents) return [];
    const dayStr = getDayDate(dayIndex).toISOString().split("T")[0];
    return googleEvents.filter((event) => {
      if (event.allDay) return false;
      const start = new Date(event.start);
      const eventDate = start.toISOString().split("T")[0];
      if (eventDate !== dayStr) return false;
      return start.getHours() === hour;
    });
  };

  const getAllDayEventsForDay = (dayIndex: number) => {
    if (!googleEvents) return [];
    const dayStr = getDayDate(dayIndex).toISOString().split("T")[0];
    return googleEvents.filter((event) => {
      if (!event.allDay) return false;
      // All-day events: start is a date string like "2026-03-01"
      return event.start.startsWith(dayStr);
    });
  };

  const hasAllDayEvents = googleEvents?.some((e) => e.allDay) ?? false;

  if (isLoading) {
    return (
      <div className="bg-surface rounded-2xl p-4" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded-lg animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface rounded-2xl overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Header: days of week */}
          <div className="grid grid-cols-[50px_repeat(7,1fr)] border-b border-border/50">
            <div className="p-2" />
            {DAYS.map((day, i) => {
              const date = getDayDate(i);
              const dateStr = date.toISOString().split("T")[0];
              const isToday = dateStr === today;
              const allDayEvents = getAllDayEventsForDay(i);
              return (
                <div
                  key={day}
                  className={cn(
                    "p-2 text-center border-l border-border/30",
                    isToday && "bg-primary/5"
                  )}
                >
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{day}</p>
                  <p className={cn(
                    "text-sm font-semibold font-mono",
                    isToday ? "text-primary" : "text-foreground"
                  )}>
                    {date.getDate()}
                  </p>
                  {/* All-day Google events */}
                  {allDayEvents.map((event) => (
                    <a
                      key={event.id}
                      href={event.htmlLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-[9px] font-medium text-emerald-600 dark:text-emerald-400 truncate hover:bg-emerald-500/20 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {event.title}
                    </a>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Time grid */}
          {HOURS.map((hour) => (
            <div key={hour} className="grid grid-cols-[50px_repeat(7,1fr)] border-b border-border/20 last:border-0">
              <div className="p-1.5 text-[10px] text-muted-foreground text-right pr-2 pt-2 font-mono">
                {String(hour).padStart(2, "0")}:00
              </div>
              {DAYS.map((_, dayIndex) => {
                const slotCalls = getCallsForSlot(dayIndex, hour);
                const slotGoogleEvents = getGoogleEventsForSlot(dayIndex, hour);
                const dateStr = getDayDate(dayIndex).toISOString().split("T")[0];
                const isToday = dateStr === today;

                return (
                  <div
                    key={dayIndex}
                    onClick={() => onSlotClick(dateStr, `${String(hour).padStart(2, "0")}:00`)}
                    className={cn(
                      "min-h-[48px] border-l border-border/30 p-0.5 cursor-pointer hover:bg-muted/40 transition-colors",
                      isToday && "bg-primary/[0.03]"
                    )}
                  >
                    {/* Off-Market calls */}
                    {slotCalls.map((call) => (
                      <button
                        key={call.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCallClick(call);
                        }}
                        className={cn(
                          "w-full text-left p-1.5 rounded-lg mb-0.5 transition-all hover:scale-[1.02]",
                          call.call_type === "iclosed"
                            ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50"
                            : "bg-muted/80"
                        )}
                        style={{ boxShadow: "var(--shadow-xs)" }}
                      >
                        <div className="flex items-center gap-1">
                          <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", CALL_STATUS_COLORS[call.status])} />
                          <span className="text-[10px] font-medium text-foreground truncate font-mono">
                            {call.time.slice(0, 5)}
                          </span>
                          <CallTypeBadge type={call.call_type} className="ml-auto" />
                        </div>
                        <p className="text-[10px] text-foreground truncate mt-0.5 font-medium">
                          {call.title}
                        </p>
                        {call.client && (
                          <p className="text-[10px] text-muted-foreground truncate">
                            {call.client.full_name}
                          </p>
                        )}
                      </button>
                    ))}

                    {/* Google Calendar events */}
                    {slotGoogleEvents.map((event) => (
                      <a
                        key={event.id}
                        href={event.htmlLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full block text-left p-1.5 rounded-lg mb-0.5 transition-all hover:scale-[1.02] bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/50"
                        style={{ boxShadow: "var(--shadow-xs)" }}
                      >
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-emerald-500" />
                          <span className="text-[10px] font-medium text-foreground truncate font-mono">
                            {new Date(event.start).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                          <span className="ml-auto text-[8px] px-1 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
                            Google
                          </span>
                        </div>
                        <p className="text-[10px] text-foreground truncate mt-0.5 font-medium">
                          {event.title}
                        </p>
                        {event.location && (
                          <p className="text-[10px] text-muted-foreground truncate">
                            {event.location}
                          </p>
                        )}
                      </a>
                    ))}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
