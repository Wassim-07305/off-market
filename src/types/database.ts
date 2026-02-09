export type AppRole = 'admin' | 'manager' | 'coach' | 'setter' | 'closer' | 'monteur'

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  coach_id: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface UserRole {
  id: string
  user_id: string
  role: AppRole
  created_at: string
}

export interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  notes: string | null
  status: 'actif' | 'inactif' | 'archivé'
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ClientAssignment {
  id: string
  client_id: string
  user_id: string
  role: AppRole
  assigned_at: string
}

export interface Lead {
  id: string
  client_id: string | null
  assigned_to: string | null
  name: string
  email: string | null
  phone: string | null
  source: 'instagram' | 'linkedin' | 'tiktok' | 'referral' | 'ads' | 'autre' | null
  status: 'à_relancer' | 'booké' | 'no_show' | 'pas_intéressé' | 'en_cours'
  client_status: 'contacté' | 'qualifié' | 'proposé' | 'closé' | 'perdu'
  ca_contracté: number
  ca_collecté: number
  commission_setter: number
  commission_closer: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CallCalendar {
  id: string
  client_id: string | null
  lead_id: string | null
  assigned_to: string | null
  date: string
  time: string
  type: 'manuel' | 'iclosed' | 'calendly' | 'autre'
  status: 'planifié' | 'réalisé' | 'no_show' | 'annulé' | 'reporté'
  link: string | null
  notes: string | null
  created_at: string
}

export interface CloserCall {
  id: string
  client_id: string | null
  lead_id: string | null
  closer_id: string | null
  date: string
  status: 'closé' | 'non_closé'
  revenue: number
  nombre_paiements: number
  link: string | null
  debrief: string | null
  notes: string | null
  created_at: string
}

export interface FinancialEntry {
  id: string
  client_id: string | null
  type: 'ca' | 'récurrent' | 'charge' | 'prestataire'
  label: string
  amount: number
  prestataire: string | null
  is_paid: boolean
  date: string
  recurrence: 'mensuel' | 'trimestriel' | 'annuel' | null
  created_at: string
}

export interface PaymentSchedule {
  id: string
  financial_entry_id: string | null
  client_id: string | null
  amount: number
  due_date: string
  is_paid: boolean
  paid_at: string | null
  created_at: string
}

export interface SocialContent {
  id: string
  client_id: string | null
  title: string
  status: 'à_tourner' | 'idée' | 'en_cours' | 'publié' | 'reporté'
  format: 'réel' | 'story' | 'carrousel' | 'post' | null
  video_type: 'réact' | 'b-roll' | 'vidéo_virale' | 'preuve_sociale' | 'facecam' | 'talking_head' | 'vlog' | null
  link: string | null
  is_validated: boolean
  text_content: string | null
  planned_date: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface SetterActivity {
  id: string
  user_id: string
  client_id: string | null
  date: string
  messages_sent: number
  notes: string | null
  created_at: string
}

export interface InstagramAccount {
  id: string
  client_id: string | null
  username: string
  followers: number
  following: number
  media_count: number
  last_synced_at: string | null
  created_at: string
}

export interface InstagramPostStat {
  id: string
  account_id: string | null
  post_url: string | null
  likes: number
  comments: number
  shares: number
  saves: number
  reach: number
  impressions: number
  engagement_rate: number
  posted_at: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'lead_status' | 'new_call' | 'call_closed' | 'general'
  title: string
  message: string | null
  is_read: boolean
  metadata: Record<string, unknown>
  created_at: string
}

export interface Ritual {
  id: string
  client_id: string | null
  title: string
  description: string | null
  frequency: 'quotidien' | 'hebdomadaire' | 'mensuel' | null
  is_active: boolean
  created_at: string
}

// Extended types with relations
export interface LeadWithRelations extends Lead {
  client?: Client
  assigned_profile?: Profile
}

export interface CallCalendarWithRelations extends CallCalendar {
  client?: Client
  lead?: Lead
  assigned_profile?: Profile
}

export interface CloserCallWithRelations extends CloserCall {
  client?: Client
  lead?: Lead
  closer?: Profile
}

export interface ClientAssignmentWithRelations extends ClientAssignment {
  profile?: Profile
  client?: Client
}

// Supabase Database type for typed client
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string; email: string }; Update: Partial<Profile>; Relationships: [] }
      user_roles: { Row: UserRole; Insert: Partial<UserRole> & { user_id: string }; Update: Partial<UserRole>; Relationships: [] }
      clients: { Row: Client; Insert: Partial<Client> & { name: string }; Update: Partial<Client>; Relationships: [] }
      client_assignments: { Row: ClientAssignment; Insert: Partial<ClientAssignment> & { client_id: string; user_id: string; role: AppRole }; Update: Partial<ClientAssignment>; Relationships: [] }
      leads: { Row: Lead; Insert: Partial<Lead> & { name: string }; Update: Partial<Lead>; Relationships: [] }
      call_calendar: { Row: CallCalendar; Insert: Partial<CallCalendar> & { date: string; time: string }; Update: Partial<CallCalendar>; Relationships: [] }
      closer_calls: { Row: CloserCall; Insert: Partial<CloserCall> & { date: string }; Update: Partial<CloserCall>; Relationships: [] }
      financial_entries: { Row: FinancialEntry; Insert: Partial<FinancialEntry> & { type: string; label: string; amount: number }; Update: Partial<FinancialEntry>; Relationships: [] }
      payment_schedules: { Row: PaymentSchedule; Insert: Partial<PaymentSchedule> & { amount: number; due_date: string }; Update: Partial<PaymentSchedule>; Relationships: [] }
      social_content: { Row: SocialContent; Insert: Partial<SocialContent> & { title: string }; Update: Partial<SocialContent>; Relationships: [] }
      setter_activities: { Row: SetterActivity; Insert: Partial<SetterActivity> & { user_id: string }; Update: Partial<SetterActivity>; Relationships: [] }
      instagram_accounts: { Row: InstagramAccount; Insert: Partial<InstagramAccount> & { username: string }; Update: Partial<InstagramAccount>; Relationships: [] }
      instagram_post_stats: { Row: InstagramPostStat; Insert: Partial<InstagramPostStat>; Update: Partial<InstagramPostStat>; Relationships: [] }
      notifications: { Row: Notification; Insert: Partial<Notification> & { user_id: string; type: string; title: string }; Update: Partial<Notification>; Relationships: [] }
      rituals: { Row: Ritual; Insert: Partial<Ritual> & { title: string }; Update: Partial<Ritual>; Relationships: [] }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: { Args: { _role: AppRole }; Returns: boolean }
      is_assigned_to_client: { Args: { _client_id: string }; Returns: boolean }
      is_coached_by: { Args: { _user_id: string }; Returns: boolean }
      get_dashboard_stats: { Args: Record<string, never>; Returns: DashboardStats }
      global_search: { Args: { search_term: string }; Returns: GlobalSearchResult }
    }
    Enums: {
      app_role: AppRole
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export interface DashboardStats {
  ca_total: number
  ca_total_prev_month: number
  ca_total_this_month: number
  nb_calls: number
  nb_calls_this_month: number
  nb_calls_prev_month: number
  taux_closing: number
  taux_closing_prev_month: number
  messages_sent: number
  messages_sent_this_month: number
  messages_sent_prev_month: number
}

export interface GlobalSearchResult {
  clients: Array<{ id: string; name: string; email: string | null; status: string }>
  leads: Array<{ id: string; name: string; email: string | null; status: string; client_status: string }>
  social_content: Array<{ id: string; title: string; status: string }>
}
