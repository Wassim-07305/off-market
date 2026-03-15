// ─── ROADMAP ─────────────────────────────────────────────────

export type MilestoneStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "skipped";
export type RoadmapSource = "kickoff_call" | "manual" | "ai_suggestion";
export type ClientFlagValue = "green" | "orange" | "red";

export interface ClientRoadmap {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  generated_from: RoadmapSource;
  source_call_id: string | null;
  milestones_snapshot: unknown;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  client?: { id: string; full_name: string; avatar_url: string | null };
  milestones?: RoadmapMilestone[];
}

export interface RoadmapMilestone {
  id: string;
  roadmap_id: string;
  title: string;
  description: string | null;
  validation_criteria: string[];
  order_index: number;
  status: MilestoneStatus;
  completed_at: string | null;
  completed_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientFlag {
  id: string;
  client_id: string;
  flag: ClientFlagValue;
  reason: string | null;
  changed_by: string | null;
  notified: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  client?: { id: string; full_name: string; avatar_url: string | null };
  changer?: { id: string; full_name: string };
}

export interface ClientFlagHistoryEntry {
  id: string;
  client_id: string;
  previous_flag: ClientFlagValue | null;
  new_flag: ClientFlagValue;
  reason: string | null;
  changed_by: string | null;
  created_at: string;
  // Joined
  changer?: { id: string; full_name: string };
}

// ─── AI Generation payload ──────────────────────────────────

export interface GenerateRoadmapPayload {
  clientId: string;
  callTranscript?: string;
  context?: string;
  callId?: string;
}

export interface GeneratedMilestone {
  title: string;
  description: string;
  validation_criteria: string[];
  order_index: number;
}

export interface GenerateRoadmapResponse {
  title: string;
  description: string;
  milestones: GeneratedMilestone[];
}

// ─── Constants ──────────────────────────────────────────────

export const MILESTONE_STATUS_CONFIG: Record<
  MilestoneStatus,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  pending: {
    label: "A faire",
    color: "text-zinc-600",
    bgColor: "bg-zinc-50",
    borderColor: "border-zinc-200",
  },
  in_progress: {
    label: "En cours",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
  },
  completed: {
    label: "Termine",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  skipped: {
    label: "Passe",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    borderColor: "border-orange-200",
  },
};

export const CLIENT_FLAG_CONFIG: Record<
  ClientFlagValue,
  {
    label: string;
    description: string;
    dotColor: string;
    bgColor: string;
    textColor: string;
    borderColor: string;
  }
> = {
  green: {
    label: "En bonne voie",
    description: "Progresse normalement selon la roadmap",
    dotColor: "bg-emerald-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    borderColor: "border-emerald-200",
  },
  orange: {
    label: "Attention",
    description: "Retard ou blocage detecte",
    dotColor: "bg-orange-500",
    bgColor: "bg-orange-50",
    textColor: "text-orange-700",
    borderColor: "border-orange-200",
  },
  red: {
    label: "Critique",
    description: "Intervention urgente necessaire",
    dotColor: "bg-red-500",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    borderColor: "border-red-200",
  },
};

export const ROADMAP_CATEGORIES = [
  "Marche",
  "Offre",
  "Communication",
  "Acquisition",
  "Conversion",
] as const;
