"use client";

import { cn, formatDate } from "@/lib/utils";
import { Calendar, Phone, Video, Radio, type LucideIcon } from "lucide-react";

export interface UpcomingEvent {
  id: string;
  title: string;
  scheduled_at: string;
  type: "call" | "session" | "live" | "event";
  participant?: string;
  href?: string;
}

const EVENT_ICONS: Record<string, LucideIcon> = {
  call: Phone,
  session: Video,
  live: Radio,
  event: Calendar,
};

const EVENT_COLORS: Record<string, { icon: string; bg: string }> = {
  call: { icon: "text-blue-500", bg: "bg-blue-500/10" },
  session: { icon: "text-violet-500", bg: "bg-violet-500/10" },
  live: { icon: "text-red-500", bg: "bg-red-500/10" },
  event: { icon: "text-emerald-500", bg: "bg-emerald-500/10" },
};

interface UpcomingEventsProps {
  events: UpcomingEvent[];
  title?: string;
  maxDisplay?: number;
  className?: string;
  isLoading?: boolean;
}

export function UpcomingEvents({
  events,
  title = "Prochains événements",
  maxDisplay = 5,
  className,
  isLoading,
}: UpcomingEventsProps) {
  const displayed = events.slice(0, maxDisplay);

  function formatEventDate(dateStr: string): string {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = d.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) return "Passe";
    if (diffHours < 1) return "Dans moins d'1h";
    if (diffHours < 24) return `Dans ${diffHours}h`;
    if (diffDays === 1) return "Demain";
    if (diffDays < 7) {
      return d.toLocaleDateString("fr-FR", { weekday: "long" });
    }
    return formatDate(dateStr, "short");
  }

  function formatEventTime(dateStr: string): string {
    return new Date(dateStr).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div
      className={cn("bg-surface rounded-2xl p-6", className)}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        {title}
      </h3>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg animate-shimmer" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-32 animate-shimmer rounded-lg" />
                <div className="h-2.5 w-20 animate-shimmer rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : displayed.length === 0 ? (
        <div className="py-8 text-center">
          <Calendar className="w-8 h-8 text-muted-foreground/20 mx-auto mb-2" />
          <p className="text-xs text-muted-foreground">
            Aucun événement à venir
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayed.map((event) => {
            const Icon = EVENT_ICONS[event.type] ?? Calendar;
            const colors = EVENT_COLORS[event.type] ?? EVENT_COLORS.event;

            return (
              <div
                key={event.id}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors"
              >
                <div
                  className={cn(
                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                    colors.bg,
                  )}
                >
                  <Icon className={cn("w-4 h-4", colors.icon)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-foreground truncate">
                    {event.title}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {formatEventDate(event.scheduled_at)} a{" "}
                      {formatEventTime(event.scheduled_at)}
                    </span>
                    {event.participant && (
                      <>
                        <span className="text-[11px] text-muted-foreground">
                          ·
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate">
                          {event.participant}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
