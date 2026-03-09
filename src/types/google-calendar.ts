export interface GoogleCalendarEvent {
  id: string;
  title: string;
  description: string | null;
  start: string; // ISO datetime
  end: string; // ISO datetime
  allDay: boolean;
  location: string | null;
  htmlLink: string; // link to Google Calendar event
  status: "confirmed" | "tentative" | "cancelled";
  color: string | null;
}
