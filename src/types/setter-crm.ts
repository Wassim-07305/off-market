// ─── Pipeline Columns ─────────────────────────────────────────

export interface PipelineColumn {
  id: string;
  client_id: string | null;
  name: string;
  color: string;
  position: number;
  is_terminal: boolean;
  created_at: string;
}

// ─── Setter Leads ─────────────────────────────────────────────

export interface SetterLead {
  id: string;
  setter_id: string;
  client_id: string | null;
  column_id: string | null;
  name: string | null;
  phone: string | null;
  email: string | null;
  instagram_handle: string | null;
  linkedin_handle: string | null;
  objectif: string | null;
  douleur: string | null;
  ca_contracte: number;
  ca_collecte: number;
  duree_collecte: number | null;
  status: string;
  date_premier_contact: string | null;
  date_relance: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Setter Activities ────────────────────────────────────────

export interface SetterActivity {
  id: string;
  user_id: string;
  client_id: string | null;
  date: string;
  dms_sent: number;
  followups_sent: number;
  links_sent: number;
  calls_booked: number;
  notes: string | null;
  created_at: string;
}

// ─── Default Pipeline Columns ─────────────────────────────────

export const DEFAULT_PIPELINE_COLUMNS: Pick<
  PipelineColumn,
  "name" | "color" | "position" | "is_terminal"
>[] = [
  { name: "En discussion", color: "blue", position: 0, is_terminal: false },
  { name: "Relance", color: "amber", position: 1, is_terminal: false },
  { name: "Lien envoyé", color: "orange", position: 2, is_terminal: false },
  { name: "Call booké", color: "green", position: 3, is_terminal: true },
];
