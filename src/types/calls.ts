export type RoomStatus = "idle" | "waiting" | "active" | "ended";

export interface TranscriptEntry {
  speaker_id: string;
  speaker_name: string;
  text: string;
  timestamp_ms: number;
}

export interface CallTranscript {
  id: string;
  call_id: string;
  content: TranscriptEntry[];
  language: string;
  duration_seconds: number | null;
  created_at: string;
}

export interface CallCalendar {
  id: string;
  client_id: string | null;
  assigned_to: string;
  title: string;
  date: string;
  time: string;
  duration_minutes: number;
  call_type: CallType;
  status: CallStatus;
  link: string | null;
  notes: string | null;
  room_status: RoomStatus;
  started_at: string | null;
  ended_at: string | null;
  actual_duration_seconds: number | null;
  reschedule_reason: string | null;
  original_date: string | null;
  original_time: string | null;
  satisfaction_rating: number | null;
  whereby_room_url: string | null;
  whereby_host_url: string | null;
  whereby_meeting_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CallNoteTemplate {
  id: string;
  title: string;
  structure: { section: string; placeholder: string }[];
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

export const SATISFACTION_CONFIG: Record<
  number,
  { label: string; emoji: string; color: string }
> = {
  1: { label: "Tres insatisfait", emoji: "😠", color: "text-red-500" },
  2: { label: "Insatisfait", emoji: "😕", color: "text-orange-500" },
  3: { label: "Neutre", emoji: "😐", color: "text-amber-500" },
  4: { label: "Satisfait", emoji: "😊", color: "text-emerald-500" },
  5: { label: "Tres satisfait", emoji: "🤩", color: "text-green-500" },
};

export interface CallCalendarWithRelations extends CallCalendar {
  client?: { id: string; full_name: string; avatar_url: string | null } | null;
  assigned_profile?: { id: string; full_name: string } | null;
}

export type CallType = "manuel" | "iclosed" | "calendly" | "booking" | "autre";
export type CallStatus =
  | "planifie"
  | "realise"
  | "no_show"
  | "annule"
  | "reporte";

export const CALL_TYPES: { value: CallType; label: string }[] = [
  { value: "manuel", label: "Manuel" },
  { value: "iclosed", label: "iClosed" },
  { value: "calendly", label: "Calendly" },
  { value: "booking", label: "Booking" },
  { value: "autre", label: "Autre" },
];

export const CALL_TYPE_COLORS: Record<CallType, string> = {
  manuel: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/30 dark:text-zinc-400",
  iclosed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  calendly:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  booking:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  autre:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
};

export const CALL_STATUSES: { value: CallStatus; label: string }[] = [
  { value: "planifie", label: "Planifie" },
  { value: "realise", label: "Realise" },
  { value: "no_show", label: "No show" },
  { value: "annule", label: "Annule" },
  { value: "reporte", label: "Reporte" },
];

export const CALL_STATUS_COLORS: Record<CallStatus, string> = {
  planifie: "bg-blue-500",
  realise: "bg-green-500",
  no_show: "bg-red-500",
  annule: "bg-zinc-400",
  reporte: "bg-orange-500",
};
