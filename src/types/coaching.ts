// ─── WEEKLY CHECK-INS ─────────────────
export interface WeeklyCheckin {
  id: string;
  client_id: string;
  week_start: string;
  revenue: number;
  prospection_count: number;
  win: string | null;
  blocker: string | null;
  goal_next_week: string | null;
  mood: Mood | null;
  coach_feedback: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  client?: { id: string; full_name: string; avatar_url: string | null };
}

export type Mood = 1 | 2 | 3 | 4 | 5;

export const MOOD_CONFIG: Record<Mood, { label: string; emoji: string; color: string }> = {
  1: { label: "Tres mal", emoji: "😫", color: "text-red-500" },
  2: { label: "Pas top", emoji: "😕", color: "text-orange-500" },
  3: { label: "Neutre", emoji: "😐", color: "text-amber-500" },
  4: { label: "Bien", emoji: "😊", color: "text-emerald-500" },
  5: { label: "Excellent", emoji: "🤩", color: "text-green-500" },
};

// ─── JOURNAL ENTRIES ──────────────────
export interface JournalEntry {
  id: string;
  author_id: string;
  title: string;
  content: string;
  mood: Mood | null;
  tags: string[];
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

// ─── COACHING GOALS ───────────────────
export interface CoachingGoal {
  id: string;
  client_id: string;
  set_by: string | null;
  title: string;
  description: string | null;
  target_value: number | null;
  current_value: number;
  unit: string | null;
  deadline: string | null;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
  // Joined
  client?: { id: string; full_name: string; avatar_url: string | null };
}

export type GoalStatus = "active" | "completed" | "paused" | "abandoned";

// ─── SESSIONS ─────────────────────────
export interface Session {
  id: string;
  client_id: string;
  coach_id: string;
  title: string;
  session_type: SessionType;
  scheduled_at: string;
  duration_minutes: number;
  status: SessionStatus;
  notes: string | null;
  action_items: ActionItem[];
  replay_url: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  client?: { id: string; full_name: string; avatar_url: string | null };
  coach?: { id: string; full_name: string; avatar_url: string | null };
}

export type SessionType = "individual" | "group" | "emergency";
export type SessionStatus = "scheduled" | "completed" | "cancelled" | "no_show";

export interface ActionItem {
  title: string;
  done: boolean;
}

// ─── COACH ALERTS ─────────────────────
export interface CoachAlert {
  id: string;
  client_id: string;
  coach_id: string | null;
  alert_type: AlertType;
  title: string;
  description: string | null;
  severity: AlertSeverity;
  is_resolved: boolean;
  resolved_at: string | null;
  created_at: string;
  // Joined
  client?: { id: string; full_name: string; avatar_url: string | null };
}

export type AlertType =
  | "no_checkin"
  | "revenue_drop"
  | "inactive_7d"
  | "inactive_14d"
  | "goal_at_risk"
  | "low_mood"
  | "payment_overdue";

export type AlertSeverity = "low" | "medium" | "high" | "critical";

export const ALERT_SEVERITY_CONFIG: Record<AlertSeverity, { label: string; color: string }> = {
  low: { label: "Faible", color: "bg-blue-500/10 text-blue-600" },
  medium: { label: "Moyen", color: "bg-amber-500/10 text-amber-600" },
  high: { label: "Eleve", color: "bg-orange-500/10 text-orange-600" },
  critical: { label: "Critique", color: "bg-red-500/10 text-red-600" },
};

export const ALERT_TYPE_CONFIG: Record<AlertType, { label: string; icon: string }> = {
  no_checkin: { label: "Pas de check-in", icon: "📋" },
  revenue_drop: { label: "Baisse de CA", icon: "📉" },
  inactive_7d: { label: "Inactif 7j", icon: "⏰" },
  inactive_14d: { label: "Inactif 14j", icon: "🚨" },
  goal_at_risk: { label: "Objectif a risque", icon: "🎯" },
  low_mood: { label: "Moral bas", icon: "😔" },
  payment_overdue: { label: "Paiement en retard", icon: "💳" },
};
