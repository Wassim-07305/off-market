"use client";

import { useState, useMemo } from "react";
import { useBookableSlots, useBookCall } from "@/hooks/use-booking";
import {
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  Clock,
  User,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookableSlot } from "@/types/streaks";

export function BookingCalendar() {
  const [weekOffset, setWeekOffset] = useState(0);

  // Calculate week range
  const { startDate, endDate, weekDays } = useMemo(() => {
    const now = new Date();
    const day = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + weekOffset * 7);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const days: { date: string; label: string; isToday: boolean }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      days.push({
        date: dateStr,
        label: d.toLocaleDateString("fr-FR", {
          weekday: "short",
          day: "numeric",
          month: "short",
        }),
        isToday: dateStr === new Date().toISOString().split("T")[0],
      });
    }

    return {
      startDate: monday.toISOString().split("T")[0],
      endDate: sunday.toISOString().split("T")[0],
      weekDays: days,
    };
  }, [weekOffset]);

  const { data: slots, isLoading } = useBookableSlots(startDate, endDate);
  const bookCall = useBookCall();
  const [selectedSlot, setSelectedSlot] = useState<BookableSlot | null>(null);
  const [confirmingSlot, setConfirmingSlot] = useState<BookableSlot | null>(
    null,
  );

  // Group slots by date
  const slotsByDate = useMemo(() => {
    const map = new Map<string, BookableSlot[]>();
    (slots ?? []).forEach((s) => {
      if (!map.has(s.date)) map.set(s.date, []);
      map.get(s.date)!.push(s);
    });
    return map;
  }, [slots]);

  const handleBook = (slot: BookableSlot) => {
    setConfirmingSlot(slot);
  };

  const confirmBooking = () => {
    if (!confirmingSlot) return;
    bookCall.mutate(confirmingSlot, {
      onSuccess: () => {
        setConfirmingSlot(null);
        setSelectedSlot(null);
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Week navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setWeekOffset((w) => Math.max(w - 1, 0))}
          disabled={weekOffset === 0}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          {weekOffset > 0 && (
            <button
              onClick={() => setWeekOffset(0)}
              className="h-7 px-2 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              Cette semaine
            </button>
          )}
          <span className="text-sm font-medium text-foreground font-mono">
            {weekDays[0]?.label} — {weekDays[6]?.label}
          </span>
        </div>
        <button
          onClick={() => setWeekOffset((w) => Math.min(w + 1, 3))}
          disabled={weekOffset >= 3}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-30"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-shimmer rounded-xl" />
          ))}
        </div>
      ) : (slots ?? []).length === 0 ? (
        <div className="text-center py-12">
          <CalendarCheck className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Aucun creneau disponible cette semaine
          </p>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="mt-2 text-xs text-primary hover:underline"
          >
            Voir la semaine suivante
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {weekDays.map((day) => {
            const daySlots = slotsByDate.get(day.date);
            if (!daySlots || daySlots.length === 0) return null;

            return (
              <div key={day.date}>
                <h4
                  className={cn(
                    "text-xs font-semibold mb-2 uppercase tracking-wider",
                    day.isToday ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {day.label}
                  {day.isToday && " (aujourd'hui)"}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((slot, i) => (
                    <button
                      key={`${slot.date}-${slot.time}-${slot.coach_id}-${i}`}
                      onClick={() => handleBook(slot)}
                      className={cn(
                        "h-10 px-4 rounded-xl text-sm font-mono border transition-all",
                        selectedSlot === slot
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border bg-surface text-foreground hover:border-primary/50 hover:bg-primary/5",
                      )}
                    >
                      <span className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                        {slot.time.slice(0, 5)}
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {slot.coach_name}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation modal */}
      {confirmingSlot && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            className="bg-surface rounded-2xl p-6 max-w-sm w-full"
            style={{ boxShadow: "var(--shadow-elevated)" }}
          >
            <h3 className="text-lg font-display font-semibold text-foreground mb-4">
              Confirmer la reservation
            </h3>
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <CalendarCheck className="w-4 h-4 text-muted-foreground" />
                <span>
                  {new Date(confirmingSlot.date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>
                  {confirmingSlot.time.slice(0, 5)} (
                  {confirmingSlot.duration_minutes} min)
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{confirmingSlot.coach_name}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmingSlot(null)}
                className="flex-1 h-10 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmBooking}
                disabled={bookCall.isPending}
                className="flex-1 h-10 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {bookCall.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CalendarCheck className="w-4 h-4" />
                )}
                Reserver
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
