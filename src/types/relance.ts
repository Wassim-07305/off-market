// ─── Relance (follow-up) sequences types ─────────────────

export type RelanceChannel = "email" | "sms" | "notification";
export type EnrollmentStatus = "active" | "completed" | "paused" | "cancelled";
export type RelanceLogStatus = "sent" | "failed" | "opened" | "clicked";

export interface RelanceSequence {
  id: string;
  name: string;
  description: string | null;
  target_stage: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  step_count?: number;
  enrollment_count?: number;
  steps?: RelanceStep[];
}

export interface RelanceStep {
  id: string;
  sequence_id: string;
  step_order: number;
  delay_days: number;
  channel: RelanceChannel;
  subject: string | null;
  content: string;
  is_active: boolean;
  created_at: string;
}

export interface RelanceEnrollment {
  id: string;
  contact_id: string;
  sequence_id: string;
  current_step: number;
  status: EnrollmentStatus;
  enrolled_at: string;
  next_step_at: string | null;
  completed_at: string | null;
  enrolled_by: string | null;
  // Joined
  sequence?: RelanceSequence;
  contact?: { id: string; full_name: string; email: string | null };
}

export interface RelanceLog {
  id: string;
  enrollment_id: string;
  step_id: string;
  channel: RelanceChannel;
  content: string;
  status: RelanceLogStatus;
  sent_at: string;
  metadata: Record<string, unknown>;
  // Joined
  step?: RelanceStep;
}

// Template variables available in relance content
export const RELANCE_VARIABLES = [
  { key: "{{prenom}}", label: "Prenom du contact", example: "Marie" },
  { key: "{{entreprise}}", label: "Entreprise", example: "Acme SAS" },
  { key: "{{etape}}", label: "Etape pipeline", example: "Proposition" },
  { key: "{{valeur}}", label: "Valeur estimee", example: "5 000 EUR" },
  { key: "{{jours_sans_contact}}", label: "Jours sans contact", example: "7" },
] as const;

export const RELANCE_CHANNELS: {
  value: RelanceChannel;
  label: string;
  icon: string;
}[] = [
  { value: "email", label: "Email", icon: "Mail" },
  { value: "sms", label: "SMS", icon: "Smartphone" },
  { value: "notification", label: "Notification", icon: "Bell" },
];

export const ENROLLMENT_STATUSES: {
  value: EnrollmentStatus;
  label: string;
  color: string;
}[] = [
  {
    value: "active",
    label: "Active",
    color: "text-emerald-600 bg-emerald-500/10",
  },
  {
    value: "completed",
    label: "Terminee",
    color: "text-blue-600 bg-blue-500/10",
  },
  {
    value: "paused",
    label: "En pause",
    color: "text-amber-600 bg-amber-500/10",
  },
  {
    value: "cancelled",
    label: "Annulee",
    color: "text-zinc-500 bg-zinc-500/10",
  },
];
