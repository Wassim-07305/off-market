"use client";

import { useMemo } from "react";
import { usePipelineContacts } from "@/hooks/use-pipeline";
import { PIPELINE_STAGES } from "@/types/pipeline";
import type { CrmContact } from "@/types/pipeline";
import { cn } from "@/lib/utils";
import { formatDate, formatCurrency } from "@/lib/utils";
import {
  User,
  ArrowRight,
  Calendar,
  DollarSign,
  Activity,
  Phone,
  Mail,
  MessageSquare,
} from "lucide-react";

interface TimelineEvent {
  id: string;
  contact: CrmContact;
  date: string;
  type: "created" | "updated" | "interaction";
}

export function PipelineTimeline() {
  const { contacts, isLoading } = usePipelineContacts();

  // Build timeline events from contacts sorted by most recent activity
  const timeline = useMemo(() => {
    if (!contacts.length) return [];

    const events: TimelineEvent[] = [];

    for (const contact of contacts) {
      // Creation event
      events.push({
        id: `${contact.id}-created`,
        contact,
        date: contact.created_at,
        type: "created",
      });

      // Last update event (if different from creation)
      if (contact.updated_at !== contact.created_at) {
        events.push({
          id: `${contact.id}-updated`,
          contact,
          date: contact.updated_at,
          type: "updated",
        });
      }

      // Last interaction event
      if (contact.last_interaction_at) {
        events.push({
          id: `${contact.id}-interaction`,
          contact,
          date: contact.last_interaction_at,
          type: "interaction",
        });
      }
    }

    // Sort by date descending
    events.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    return events.slice(0, 50);
  }, [contacts]);

  // Group events by day
  const groupedByDay = useMemo(() => {
    const groups: { date: string; label: string; events: TimelineEvent[] }[] =
      [];
    const map = new Map<string, TimelineEvent[]>();

    for (const event of timeline) {
      const day = new Date(event.date).toISOString().slice(0, 10);
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(event);
    }

    for (const [day, events] of map) {
      const d = new Date(day);
      const isToday = d.toDateString() === new Date().toDateString();
      const isYesterday =
        d.toDateString() === new Date(Date.now() - 86400000).toDateString();

      groups.push({
        date: day,
        label: isToday
          ? "Aujourd'hui"
          : isYesterday
            ? "Hier"
            : d.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              }),
        events,
      });
    }

    return groups;
  }, [timeline]);

  // Stage distribution for summary
  const stageDistribution = useMemo(() => {
    const dist: Record<string, number> = {};
    for (const c of contacts) {
      dist[c.stage] = (dist[c.stage] ?? 0) + 1;
    }
    return dist;
  }, [contacts]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-shimmer rounded-xl" />
        ))}
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-16">
        <Activity className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">
          Aucun contact dans le pipeline
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stage distribution summary */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {PIPELINE_STAGES.map((stage) => {
          const count = stageDistribution[stage.value] ?? 0;
          return (
            <div
              key={stage.value}
              className="rounded-xl border border-border bg-surface p-3 text-center"
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <div className={cn("w-2 h-2 rounded-full", stage.dotColor)} />
                <p className="text-lg font-bold text-foreground font-mono tabular-nums">
                  {count}
                </p>
              </div>
              <p className="text-[10px] text-muted-foreground">{stage.label}</p>
            </div>
          );
        })}
      </div>

      {/* Timeline */}
      <div className="space-y-6">
        {groupedByDay.map((group) => (
          <div key={group.date}>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 sticky top-0 bg-background py-1 z-10">
              {group.label}
            </h3>
            <div className="relative pl-6 space-y-3">
              {/* Vertical line */}
              <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />

              {group.events.map((event) => {
                const stage = PIPELINE_STAGES.find(
                  (s) => s.value === event.contact.stage,
                );
                return (
                  <div key={event.id} className="relative">
                    {/* Dot */}
                    <div
                      className={cn(
                        "absolute -left-6 top-3 w-3 h-3 rounded-full border-2 border-background",
                        event.type === "created"
                          ? "bg-zinc-400"
                          : event.type === "interaction"
                            ? "bg-red-500"
                            : "bg-zinc-600",
                      )}
                    />

                    <div className="bg-surface border border-border rounded-xl p-3 hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">
                              {event.contact.full_name}
                            </p>
                            {stage && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border border-border bg-muted text-muted-foreground">
                                <span
                                  className={cn(
                                    "w-1.5 h-1.5 rounded-full",
                                    stage.dotColor,
                                  )}
                                />
                                {stage.label}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            {event.type === "created" && (
                              <>
                                <Calendar className="w-3 h-3" />
                                Nouveau contact ajoute
                              </>
                            )}
                            {event.type === "updated" && (
                              <>
                                <ArrowRight className="w-3 h-3" />
                                Etape mise a jour
                              </>
                            )}
                            {event.type === "interaction" && (
                              <>
                                <MessageSquare className="w-3 h-3" />
                                Derniere interaction (
                                {event.contact.interaction_count})
                              </>
                            )}
                            <span className="text-muted-foreground/60">
                              {new Date(event.date).toLocaleTimeString(
                                "fr-FR",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          {event.contact.estimated_value > 0 && (
                            <p className="text-xs font-medium text-foreground flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {formatCurrency(event.contact.estimated_value)}
                            </p>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Score: {event.contact.lead_score}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
