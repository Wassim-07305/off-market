export interface CrmContact {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  source: ContactSource | null;
  stage: PipelineStage;
  closer_stage: CloserStage | null;
  assigned_to: string | null;
  closer_id: string | null;
  returned_by_closer: boolean;
  estimated_value: number;
  notes: string | null;
  tags: string[];
  last_contact_at: string | null;
  converted_profile_id: string | null;
  lead_score: number;
  qualification_score: number | null;
  revenue_range: string | null;
  goals: string | null;
  captured_at: string | null;
  last_interaction_at: string | null;
  interaction_count: number;
  sort_order: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Enrichment
  linkedin_url: string | null;
  instagram_url: string | null;
  tiktok_url: string | null;
  facebook_url: string | null;
  website_url: string | null;
  youtube_url: string | null;
  enrichment_data: Record<string, unknown>;
  enrichment_status: "pending" | "enriched" | "failed" | null;
  last_enriched_at: string | null;
  // Closing analytics
  lost_reason: string | null;
  stage_changed_at: string | null;
  // Joined
  assigned_profile?: { id: string; full_name: string } | null;
}

export type PipelineStage =
  | "prospect"
  | "qualifie"
  | "proposition"
  | "closing"
  | "client"
  | "perdu";

export type CloserStage =
  | "a_appeler"
  | "en_negociation"
  | "close"
  | "perdu";
export type ContactSource =
  | "instagram"
  | "linkedin"
  | "referral"
  | "website"
  | "lead_magnet"
  | "other";

export const PIPELINE_STAGES: {
  value: PipelineStage;
  label: string;
  color: string;
  bg: string;
  dotColor: string;
}[] = [
  {
    value: "prospect",
    label: "Prospect",
    color: "text-zinc-600 dark:text-zinc-300",
    bg: "bg-zinc-100 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700",
    dotColor: "bg-zinc-400",
  },
  {
    value: "qualifie",
    label: "Qualifie",
    color: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/40",
    dotColor: "bg-blue-500",
  },
  {
    value: "proposition",
    label: "Proposition",
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40",
    dotColor: "bg-amber-500",
  },
  {
    value: "closing",
    label: "Closing",
    color: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900/40",
    dotColor: "bg-red-500",
  },
  {
    value: "client",
    label: "Client",
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40",
    dotColor: "bg-emerald-500",
  },
  {
    value: "perdu",
    label: "Perdu",
    color: "text-zinc-400 dark:text-zinc-500",
    bg: "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800",
    dotColor: "bg-zinc-300",
  },
];

/** Setter sees: prospect → qualifié → proposition → closing (→ perdu) — NO "client" */
export const SETTER_STAGES = PIPELINE_STAGES.filter(
  (s) => s.value !== "client",
);

/** Closer pipeline stages */
export const CLOSER_STAGES: {
  value: CloserStage;
  label: string;
  color: string;
  bg: string;
  dotColor: string;
}[] = [
  {
    value: "a_appeler",
    label: "A appeler",
    color: "text-blue-700 dark:text-blue-300",
    bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/40",
    dotColor: "bg-blue-500",
  },
  {
    value: "en_negociation",
    label: "En negociation",
    color: "text-amber-700 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/40",
    dotColor: "bg-amber-500",
  },
  {
    value: "close",
    label: "Close",
    color: "text-emerald-700 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/40",
    dotColor: "bg-emerald-500",
  },
  {
    value: "perdu",
    label: "Perdu",
    color: "text-zinc-400 dark:text-zinc-500",
    bg: "bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800",
    dotColor: "bg-zinc-300",
  },
];

export const CONTACT_SOURCES: { value: ContactSource; label: string }[] = [
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "referral", label: "Recommandation" },
  { value: "website", label: "Site web" },
  { value: "lead_magnet", label: "Lead Magnet" },
  { value: "other", label: "Autre" },
];

export type CallNoteMood =
  | "tres_positif"
  | "positif"
  | "neutre"
  | "negatif"
  | "tres_negatif";
export type CallNoteOutcome =
  | "interested"
  | "follow_up"
  | "not_interested"
  | "closed"
  | "no_show";

export interface CallNote {
  id: string;
  call_id: string;
  author_id: string;
  summary: string | null;
  client_mood: CallNoteMood | null;
  outcome: CallNoteOutcome | null;
  next_steps: string | null;
  action_items: CallNoteActionItem[];
  created_at: string;
  updated_at: string;
}

export interface CallNoteActionItem {
  title: string;
  done: boolean;
}

export const CALL_MOOD_CONFIG: Record<
  CallNoteMood,
  { label: string; emoji: string }
> = {
  tres_positif: { label: "Tres positif", emoji: "🤩" },
  positif: { label: "Positif", emoji: "😊" },
  neutre: { label: "Neutre", emoji: "😐" },
  negatif: { label: "Negatif", emoji: "😕" },
  tres_negatif: { label: "Tres negatif", emoji: "😡" },
};

// ─── Contact Interactions ─────────────────────────────────────

export type InteractionType = "call" | "email" | "meeting" | "note" | "message";

export interface ContactInteraction {
  id: string;
  contact_id: string;
  type: InteractionType;
  content: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
  // Joined
  author?: { full_name: string; avatar_url: string | null } | null;
}

export const INTERACTION_TYPES: {
  value: InteractionType;
  label: string;
  icon: string;
}[] = [
  { value: "call", label: "Appel", icon: "Phone" },
  { value: "email", label: "Email", icon: "Mail" },
  { value: "meeting", label: "Reunion", icon: "Calendar" },
  { value: "note", label: "Note", icon: "FileText" },
  { value: "message", label: "Message", icon: "MessageSquare" },
];

export const CALL_OUTCOME_CONFIG: Record<
  CallNoteOutcome,
  { label: string; color: string }
> = {
  interested: {
    label: "Interesse",
    color: "text-emerald-600 bg-emerald-500/10",
  },
  follow_up: { label: "A relancer", color: "text-amber-600 bg-amber-500/10" },
  not_interested: {
    label: "Pas interesse",
    color: "text-red-600 bg-red-500/10",
  },
  closed: { label: "Signe", color: "text-green-600 bg-green-500/10" },
  no_show: { label: "No show", color: "text-zinc-500 bg-zinc-500/10" },
};
