// ─── SHARED CALENDAR TYPES ───────────────

export type CalendarEventType = "session" | "call" | "event";

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string; // ISO datetime
  end?: string;
  type: CalendarEventType;
  color: string;
  attendees?: string[];
  created_by?: string;
  metadata?: Record<string, unknown>;
}

export type CalendarView = "month" | "week" | "day";

/** Raw row from the calendar_events table */
export interface CalendarEventRow {
  id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string | null;
  event_type: string;
  color: string;
  attendees: string[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// Color constants
export const EVENT_COLORS: Record<CalendarEventType, string> = {
  session: "#3B82F6", // blue
  call: "#10B981",    // green
  event: "#8B5CF6",   // purple
};

export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  session: "Session",
  call: "Appel",
  event: "Événement",
};
