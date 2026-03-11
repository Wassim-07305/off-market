export interface Streak {
  id: string;
  profile_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  xp_multiplier: number;
  total_active_days: number;
  updated_at: string;
}

export interface DailyActivity {
  id: string;
  profile_id: string;
  activity_date: string;
  actions: string[];
  created_at: string;
}

export interface RecordActivityResult {
  current_streak: number;
  longest_streak: number;
  multiplier: number;
  already_recorded?: boolean;
  streak_increased?: boolean;
}

export interface AvailabilitySlot {
  id: string;
  coach_id: string;
  day_of_week: number; // 0=Sunday
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

export interface AvailabilityOverride {
  id: string;
  coach_id: string;
  override_date: string;
  is_blocked: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  created_at: string;
}

// A computed bookable slot for display
export interface BookableSlot {
  coach_id: string;
  coach_name: string;
  date: string;
  time: string;
  duration_minutes: number;
}

export const STREAK_MILESTONES = [
  { days: 3, label: "3 jours", multiplier: "1.25x" },
  { days: 7, label: "1 semaine", multiplier: "1.5x" },
  { days: 14, label: "2 semaines", multiplier: "1.75x" },
  { days: 30, label: "1 mois", multiplier: "2x" },
] as const;

export const DAY_LABELS = [
  "Dim",
  "Lun",
  "Mar",
  "Mer",
  "Jeu",
  "Ven",
  "Sam",
] as const;
