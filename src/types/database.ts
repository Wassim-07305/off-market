export type AppRole = 'admin' | 'coach' | 'prospect'

export interface Profile {
  id: string
  email: string
  full_name: string
  avatar_url: string | null
  coach_id: string | null
  phone: string | null
  last_seen_at: string | null
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
  status: 'premier_message' | 'en_discussion' | 'qualifie' | 'loom_envoye' | 'call_planifie' | 'close' | 'perdu'
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
  type: 'manuel' | 'iclosed' | 'calendly' | 'coaching' | 'closing' | 'autre'
  status: 'planifié' | 'réalisé' | 'no_show' | 'annulé' | 'reporté'
  link: string | null
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

export interface SetterActivity {
  id: string
  user_id: string
  client_id: string | null
  date: string
  messages_sent: number
  calls_made: number
  looms_sent: number
  notes: string | null
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

export interface SocialContent {
  id: string
  client_id: string | null
  title: string
  status: 'idée' | 'a_tourner' | 'en_cours' | 'publié' | 'reporté'
  format: 'reel' | 'story' | 'carrousel' | 'post' | null
  video_type: 'react' | 'b-roll' | 'video_virale' | 'preuve_sociale' | 'facecam' | 'talking_head' | 'vlog' | null
  link: string | null
  is_validated: boolean
  text_content: string | null
  planned_date: string | null
  sort_order: number
  created_at: string
  updated_at: string
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
  account_id: string
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

export interface Ritual {
  id: string
  client_id: string | null
  title: string
  description: string | null
  frequency: 'quotidien' | 'hebdomadaire' | 'mensuel' | null
  is_active: boolean
  created_at: string
}

// Messaging types
export interface Channel {
  id: string
  name: string
  type: 'direct' | 'group'
  write_mode: 'all' | 'admin_only'
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ChannelMember {
  id: string
  channel_id: string
  user_id: string
  joined_at: string
}

export interface Message {
  id: string
  channel_id: string
  sender_id: string
  content: string | null
  file_url: string | null
  file_name: string | null
  is_edited: boolean
  created_at: string
  updated_at: string
}

export interface MessageRead {
  id: string
  channel_id: string
  user_id: string
  last_read_at: string
}

// Formation types
export interface Formation {
  id: string
  title: string
  description: string | null
  thumbnail_url: string | null
  is_published: boolean
  sort_order: number
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface FormationModule {
  id: string
  formation_id: string
  title: string
  description: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ModuleItem {
  id: string
  module_id: string
  title: string
  type: 'video' | 'document'
  url: string | null
  duration: number | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface ItemCompletion {
  id: string
  item_id: string
  user_id: string
  completed_at: string
}

// Channel with computed fields (from RPC)
export interface ChannelWithDetails extends Channel {
  last_message?: {
    id: string
    content: string | null
    sender_id: string
    sender_name: string
    created_at: string
  } | null
  unread_count: number
  member_count: number
  other_member?: {
    id: string
    full_name: string
    avatar_url: string | null
  } | null
}

// Message with sender profile
export interface MessageWithSender extends Message {
  sender?: Profile
}

// Formation progress (from RPC)
export interface FormationProgress {
  formation_id: string
  user_id: string
  total_items: number
  completed_items: number
  percentage: number
}

// Student overview (from RPC)
export interface StudentOverview {
  user_id: string
  full_name: string
  email: string
  avatar_url: string | null
  last_seen_at: string | null
  created_at: string
  formations: Array<{
    formation_id: string
    title: string
    progress: FormationProgress
  }>
  messages_count: number
  last_message_at: string | null
  total_completions?: number
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
  closer_profile?: Profile
}

export interface SocialContentWithRelations extends SocialContent {
  client?: Client
}

export interface InstagramAccountWithRelations extends InstagramAccount {
  client?: Client
}

export interface ClientAssignmentWithRelations extends ClientAssignment {
  profile?: Profile
  client?: Client
}

// Journal & Check-ins types
export interface JournalEntry {
  id: string
  author_id: string
  title: string | null
  content: string | null
  mood: number | null
  tags: string[]
  is_private: boolean
  created_at: string
  updated_at: string
}

export interface WeeklyCheckin {
  id: string
  client_id: string | null
  week_start: string
  revenue: number
  prospection_count: number
  win: string | null
  blocker: string | null
  goal_next_week: string | null
  mood: number | null
  coach_feedback: string | null
  created_at: string
  updated_at: string
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
      financial_entries: { Row: FinancialEntry; Insert: Partial<FinancialEntry> & { type: string; label: string; amount: number }; Update: Partial<FinancialEntry>; Relationships: [] }
      payment_schedules: { Row: PaymentSchedule; Insert: Partial<PaymentSchedule> & { amount: number; due_date: string }; Update: Partial<PaymentSchedule>; Relationships: [] }
      setter_activities: { Row: SetterActivity; Insert: Partial<SetterActivity> & { user_id: string }; Update: Partial<SetterActivity>; Relationships: [] }
      notifications: { Row: Notification; Insert: Partial<Notification> & { user_id: string; type: string; title: string }; Update: Partial<Notification>; Relationships: [] }
      rituals: { Row: Ritual; Insert: Partial<Ritual> & { title: string }; Update: Partial<Ritual>; Relationships: [] }
      channels: { Row: Channel; Insert: Partial<Channel> & { name: string }; Update: Partial<Channel>; Relationships: [] }
      channel_members: { Row: ChannelMember; Insert: Partial<ChannelMember> & { channel_id: string; user_id: string }; Update: Partial<ChannelMember>; Relationships: [] }
      messages: { Row: Message; Insert: Partial<Message> & { channel_id: string; sender_id: string }; Update: Partial<Message>; Relationships: [] }
      message_reads: { Row: MessageRead; Insert: Partial<MessageRead> & { channel_id: string; user_id: string }; Update: Partial<MessageRead>; Relationships: [] }
      formations: { Row: Formation; Insert: Partial<Formation> & { title: string }; Update: Partial<Formation>; Relationships: [] }
      formation_modules: { Row: FormationModule; Insert: Partial<FormationModule> & { formation_id: string; title: string }; Update: Partial<FormationModule>; Relationships: [] }
      module_items: { Row: ModuleItem; Insert: Partial<ModuleItem> & { module_id: string; title: string }; Update: Partial<ModuleItem>; Relationships: [] }
      item_completions: { Row: ItemCompletion; Insert: Partial<ItemCompletion> & { item_id: string; user_id: string }; Update: Partial<ItemCompletion>; Relationships: [] }
      closer_calls: { Row: CloserCall; Insert: Partial<CloserCall> & { date: string }; Update: Partial<CloserCall>; Relationships: [] }
      social_content: { Row: SocialContent; Insert: Partial<SocialContent> & { title: string }; Update: Partial<SocialContent>; Relationships: [] }
      instagram_accounts: { Row: InstagramAccount; Insert: Partial<InstagramAccount> & { username: string }; Update: Partial<InstagramAccount>; Relationships: [] }
      instagram_post_stats: { Row: InstagramPostStat; Insert: Partial<InstagramPostStat> & { account_id: string }; Update: Partial<InstagramPostStat>; Relationships: [] }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: { Args: { _role: AppRole }; Returns: boolean }
      is_assigned_to_client: { Args: { _client_id: string }; Returns: boolean }
      is_channel_member: { Args: { p_channel_id: string }; Returns: boolean }
      get_dashboard_stats: { Args: Record<string, never>; Returns: DashboardStats }
      global_search: { Args: { search_term: string }; Returns: GlobalSearchResult }
      get_user_channels: { Args: Record<string, never>; Returns: ChannelWithDetails[] }
      mark_channel_read: { Args: { p_channel_id: string }; Returns: void }
      get_formation_progress: { Args: { p_formation_id: string; p_user_id?: string }; Returns: FormationProgress }
      get_student_overview: { Args: { p_user_id: string }; Returns: StudentOverview }
      get_students_overview: { Args: Record<string, never>; Returns: StudentOverview[] }
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
  leads: Array<{ id: string; name: string; email: string | null; status: string }>
}

// Gamification types
export interface XpTransaction {
  id: string
  profile_id: string
  action: string
  xp_amount: number
  metadata: Record<string, unknown>
  created_at: string
}

export interface GamificationBadge {
  id: string
  name: string
  description: string | null
  icon: string | null
  category: string
  rarity: string | null
  condition: Record<string, unknown> | null
  xp_reward: number
  is_active: boolean
  created_at: string
}

export interface UserBadge {
  id: string
  profile_id: string
  badge_id: string
  earned_at: string
  badge?: GamificationBadge
}

export interface LevelConfig {
  level: number
  name: string
  min_xp: number
  icon: string | null
  color: string | null
}

export interface Challenge {
  id: string
  title: string
  description: string | null
  challenge_type: string
  condition: Record<string, unknown> | null
  xp_reward: number
  badge_reward: string | null
  starts_at: string | null
  ends_at: string | null
  is_active: boolean
  created_by: string | null
  created_at: string
}

export interface ChallengeParticipant {
  id: string
  challenge_id: string
  profile_id: string
  progress: number
  completed: boolean
  completed_at: string | null
  joined_at: string
}

// Forms types
export interface Form {
  id: string
  title: string
  description: string | null
  status: string
  created_by: string
  cover_image_url: string | null
  thank_you_message: string | null
  is_anonymous: boolean
  allow_multiple_submissions: boolean
  closes_at: string | null
  target_audience: string | null
  target_student_ids: string[] | null
  notification_on_submit: boolean
  created_at: string
  updated_at: string
}

export interface FormField {
  id: string
  form_id: string
  field_type: string
  label: string
  description: string | null
  placeholder: string | null
  is_required: boolean
  options: Record<string, unknown> | null
  validation: Record<string, unknown> | null
  conditional_logic: Record<string, unknown> | null
  sort_order: number
  created_at: string
}

export interface FormSubmission {
  id: string
  form_id: string
  respondent_id: string | null
  answers: Record<string, unknown>
  submitted_at: string
}

export type FormWithFields = Form & { fields: FormField[] }
