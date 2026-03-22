"use client";

import { useSessions } from "@/hooks/use-sessions";
import { UpcomingEvents } from "@/components/dashboard/upcoming-events";
import type { UpcomingEvent } from "@/components/dashboard/upcoming-events";

export function CoachUpcomingEvents() {
  const { data: sessions = [], isLoading } = useSessions();

  const events: UpcomingEvent[] = (sessions as any[])
    .filter((s: any) => new Date(s.scheduled_at) > new Date())
    .sort(
      (a: any, b: any) =>
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
    )
    .slice(0, 6)
    .map((session: any) => {
      const client = session.client as {
        id: string;
        full_name: string;
      } | null;
      return {
        id: session.id,
        title: session.title,
        scheduled_at: session.scheduled_at,
        type: "session" as const,
        participant: client?.full_name,
      };
    });

  return (
    <UpcomingEvents
      events={events}
      title="Prochaines sessions"
      isLoading={isLoading}
    />
  );
}
