// ─── UPSELL RULES ──────────────────────
export type UpsellTriggerType =
  | "revenue_threshold"
  | "milestone_completion"
  | "time_based";

export interface UpsellRule {
  id: string;
  name: string;
  trigger_type: UpsellTriggerType;
  trigger_config: Record<string, unknown>;
  offer_title: string;
  offer_description: string | null;
  offer_url: string | null;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

export const UPSELL_TRIGGER_TYPE_CONFIG: Record<
  UpsellTriggerType,
  { label: string; description: string }
> = {
  revenue_threshold: {
    label: "Seuil de chiffre d'affaires",
    description:
      "Declenche quand le client atteint un CA defini (ex: 7000 EUR)",
  },
  milestone_completion: {
    label: "Étape atteinte",
    description: "Declenche quand le client complete une étape cle",
  },
  time_based: {
    label: "Base sur le temps",
    description: "Declenche apres une duree definie dans le programme",
  },
};

// ─── UPSELL TRIGGERS ──────────────────
export type UpsellTriggerStatus =
  | "pending"
  | "notified"
  | "converted"
  | "dismissed";

export interface UpsellTrigger {
  id: string;
  rule_id: string;
  client_id: string;
  triggered_at: string;
  status: UpsellTriggerStatus;
  notified_at: string | null;
  converted_at: string | null;
  created_at: string;
  // Joined
  rule?: UpsellRule;
  client?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

export const UPSELL_STATUS_CONFIG: Record<
  UpsellTriggerStatus,
  { label: string; color: string; bg: string }
> = {
  pending: {
    label: "En attente",
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
  notified: {
    label: "Notifie",
    color: "text-blue-600",
    bg: "bg-blue-500/10",
  },
  converted: {
    label: "Converti",
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  dismissed: {
    label: "Rejete",
    color: "text-zinc-500",
    bg: "bg-zinc-500/10",
  },
};

// ─── CHALLENGE ENTRIES ─────────────────
export interface ChallengeEntry {
  id: string;
  challenge_id: string;
  user_id: string;
  metric_type: string;
  metric_value: number;
  verified: boolean;
  verification_source: string | null;
  proof_url: string | null;
  submitted_at: string;
  reviewed_by: string | null;
  created_at: string;
  // Joined
  user?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

export const METRIC_TYPES = [
  { value: "prospects_contacted", label: "Prospects contactes" },
  { value: "calls_booked", label: "Appels reserves" },
  { value: "calls_completed", label: "Appels realises" },
  { value: "closes", label: "Closes" },
  { value: "revenue", label: "Chiffre d'affaires" },
  { value: "messages_sent", label: "Messages envoyes" },
  { value: "content_posted", label: "Contenus publies" },
  { value: "modules_completed", label: "Modules completes" },
] as const;

export type MetricType = (typeof METRIC_TYPES)[number]["value"];
