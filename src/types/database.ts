export type AppRole = "admin" | "coach" | "client" | "setter" | "closer" | "prospect";

/**
 * Converts an interface to a sealed mapped type so it satisfies
 * Record<string, unknown> in TypeScript 5.9+ (interfaces are open
 * and no longer extend index signatures implicitly).
 */
type Seal<T> = { [K in keyof T]: T[K] };

// Upsell opportunity types used by dashboard components
export type UpsellStatus = "detected" | "proposed" | "accepted" | "declined";

export interface UpsellOpportunity {
  id: string;
  student_id: string;
  trigger_type: string;
  trigger_value: string | null;
  offer_name: string;
  offer_type: string;
  amount: number | null;
  status: UpsellStatus;
  message: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  student?: unknown;
}

export type UserRole = {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
};

export interface OnboardingOffer {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  modules: string[];
  welcome_message: string | null;
  recommended_actions: OnboardingAction[];
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface OnboardingAction {
  key: string;
  label: string;
  href: string;
  icon: string;
}

export interface CallCalendar {
  id: string;
  title: string;
  date: string;
  time: string;
  duration_minutes: number;
  call_type: string;
  status: string;
  link: string | null;
  notes: string | null;
  client_id: string | null;
  assigned_to: string;
  created_at: string;
  updated_at: string;
  client?: Profile;
  assigned_user?: Profile;
}

export type CallCalendarWithRelations = CallCalendar & {
  client?: Profile;
  assigned_user?: Profile;
};

export interface ChannelWithDetails extends Channel {
  members?: ChannelMember[];
  unread_count?: number;
  last_message?: Message;
}

export interface ClientAssignment {
  id: string;
  coach_id: string;
  client_id: string;
  status: "active" | "paused" | "ended";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientAssignmentWithRelations extends ClientAssignment {
  coach?: Profile;
  client?: Profile;
}

export interface DashboardStats {
  total_clients: number;
  total_leads: number;
  total_revenue: number;
  active_calls: number;
  conversion_rate: number;
  [key: string]: unknown;
}

export type Formation = Course;
export type FormationProgress = LessonProgress;
export type FormationModule = Module;
export type ModuleItem = Lesson;
export type ItemCompletion = LessonProgress;

export interface XpTransaction {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface GamificationBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: Record<string, unknown>;
  category: string;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: GamificationBadge;
}

export interface LevelConfig {
  level: number;
  xp_required: number;
  title: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  target: number;
  reward_xp: number;
  starts_at: string;
  ends_at: string;
  created_at: string;
}

export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  user_id: string;
  progress: number;
  completed_at: string | null;
  joined_at: string;
}

export interface InstagramAccount {
  id: string;
  user_id: string;
  username: string;
  account_id: string;
  access_token: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface InstagramAccountWithRelations extends InstagramAccount {
  user?: Profile;
}

export interface InstagramPostStat {
  id: string;
  account_id: string;
  post_id: string;
  likes: number;
  comments: number;
  shares: number;
  impressions: number;
  reach: number;
  created_at: string;
}

export interface MessageReactionWithUser extends MessageReaction {
  profile: Profile;
}

export interface MessageWithSender extends Message {
  sender: Profile;
}

export interface SetterActivity {
  id: string;
  user_id: string;
  date: string;
  messages_sent: number;
  leads_generated: number;
  calls_booked: number;
  notes: string | null;
  created_at: string;
}

export interface SocialContent {
  id: string;
  user_id: string;
  title: string;
  content: string;
  platform: string;
  status: "draft" | "scheduled" | "published";
  scheduled_at: string | null;
  published_at: string | null;
  media_urls: string[];
  created_at: string;
  updated_at: string;
}

export interface SocialContentWithRelations extends SocialContent {
  user?: Profile;
}

export interface StudentOverview {
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  last_seen_at: string | null;
  messages_count: number;
  created_at: string;
  last_message_at: string | null;
  formations: Array<{
    formation_id: string;
    title: string;
    progress?: {
      completed_items: number;
      total_items: number;
    };
  }>;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: "info" | "warning" | "success" | "urgent" | "update";
  is_active: boolean;
  target_roles: string[] | null;
  starts_at: string | null;
  ends_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: AppRole;
  phone: string | null;
  bio: string | null;
  timezone: string;
  default_currency: string;
  onboarding_completed: boolean;
  onboarding_step: number;
  onboarding_offer_id: string | null;
  onboarding_answers: Record<string, string> | null;
  onboarding_completed_at: string | null;
  ai_consent_given_at: string | null;
  ai_consent_scope: string[];
  leaderboard_anonymous: boolean;
  anonymous_alias: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export type StudentFlag = "green" | "yellow" | "orange" | "red";
export type StudentPipelineStage =
  | "onboarding"
  | "learning"
  | "practicing"
  | "launching"
  | "scaling"
  | "autonomous";
export type StudentEngagementTag =
  | "vip"
  | "standard"
  | "new"
  | "at_risk"
  | "churned";

export interface StudentDetail {
  id: string;
  profile_id: string;
  tag: StudentEngagementTag;
  flag: StudentFlag;
  pipeline_stage: StudentPipelineStage;
  engagement_score: number;
  niche: string | null;
  current_revenue: number;
  revenue_objective: number;
  obstacles: string | null;
  assigned_coach: string | null;
  // Joined via query (not always present)
  assigned_coach_profile?: { full_name: string } | null;
  revenue: number;
  lifetime_value: number;
  acquisition_source: string | null;
  enrollment_date: string;
  program: string | null;
  goals: string | null;
  coach_notes: string | null;
  health_score: number;
  last_engagement_at: string | null;
  stage_entered_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentActivity {
  id: string;
  student_id: string;
  activity_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface StudentNote {
  id: string;
  student_id: string;
  author_id: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface StudentTask {
  id: string;
  student_id: string;
  assigned_by: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  status: "todo" | "in_progress" | "done" | "overdue";
  priority: "low" | "medium" | "high" | "urgent";
  created_at: string;
  completed_at: string | null;
}

export interface Channel {
  id: string;
  name: string;
  description: string | null;
  type: "public" | "private" | "dm";
  created_by: string | null;
  is_archived: boolean;
  is_default: boolean;
  avatar_url: string | null;
  last_message_at: string | null;
  archived_at: string | null;
  archived_by: string | null;
  created_at: string;
}

export interface ChannelMember {
  id: string;
  channel_id: string;
  profile_id: string;
  role: "admin" | "moderator" | "member";
  last_read_at: string;
  notifications_muted: boolean;
  joined_at: string;
  profile?: Profile;
}

export interface Message {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string;
  content_type:
    | "text"
    | "image"
    | "file"
    | "video"
    | "audio"
    | "system"
    | "gif";
  reply_to: string | null;
  is_pinned: boolean;
  is_edited: boolean;
  is_urgent: boolean;
  reply_count: number;
  scheduled_at: string | null;
  is_ai_generated: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sender?: Profile;
  reactions?: MessageReaction[];
  attachments?: MessageAttachment[];
  reply_message?: Message;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  profile_id: string;
  emoji: string;
  created_at: string;
  profile?: Profile;
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number | null;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  description: string | null;
  cover_image_url: string | null;
  status: "draft" | "published" | "archived";
  sort_order: number;
  is_mandatory: boolean;
  estimated_duration: number | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  modules?: Module[];
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sort_order: number;
  is_locked: boolean;
  unlock_condition: Record<string, unknown>;
  created_at: string;
  lessons?: Lesson[];
}

export interface LessonAttachment {
  name: string;
  url: string;
  type: string;
}

export type EmbedType =
  | "figma"
  | "miro"
  | "google_docs"
  | "canva"
  | "notion"
  | "generic";

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  content_type:
    | "video"
    | "text"
    | "pdf"
    | "quiz"
    | "assignment"
    | "audio"
    | "embed";
  content: Record<string, unknown>;
  video_url: string | null;
  audio_url: string | null;
  audio_duration: number | null;
  content_html: string | null;
  attachments: LessonAttachment[];
  embed_url: string | null;
  embed_type: EmbedType | null;
  sort_order: number;
  estimated_duration: number | null;
  is_preview: boolean;
  created_at: string;
  updated_at: string;
  progress?: LessonProgress;
}

export interface LessonProgress {
  id: string;
  lesson_id: string;
  student_id: string;
  status: "not_started" | "in_progress" | "completed";
  progress_percent: number;
  time_spent: number;
  completed_at: string | null;
  last_accessed_at: string;
  created_at: string;
}

export interface LessonComment {
  id: string;
  lesson_id: string;
  author_id: string;
  content: string;
  reply_to: string | null;
  created_at: string;
  author?: Profile;
}

export type FormTemplateCategory =
  | "onboarding"
  | "feedback"
  | "evaluation"
  | "intake"
  | "survey";

export interface FormTemplate {
  id: string;
  name: string;
  description: string | null;
  category: FormTemplateCategory;
  thumbnail_emoji: string;
  fields: Array<{
    field_type: string;
    label: string;
    description: string;
    placeholder: string;
    is_required: boolean;
    options: Array<{ label: string; value: string }>;
    sort_order: number;
  }>;
  is_system: boolean;
  created_by: string | null;
  created_at: string;
}

export interface Form {
  id: string;
  title: string;
  description: string | null;
  status: "draft" | "active" | "closed" | "archived";
  created_by: string;
  cover_image_url: string | null;
  thank_you_message: string;
  is_anonymous: boolean;
  allow_multiple_submissions: boolean;
  closes_at: string | null;
  target_audience: "all" | "vip" | "standard" | "new" | "custom";
  target_student_ids: string[];
  notification_on_submit: boolean;
  created_at: string;
  updated_at: string;
  fields?: FormField[];
  _count?: { submissions: number };
}

export type ConditionalOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "is_empty"
  | "is_not_empty"
  | "gt"
  | "lt";

export interface ConditionalRule {
  fieldId: string;
  operator: ConditionalOperator;
  value: string;
}

export interface ConditionalLogic {
  enabled: boolean;
  action: "show" | "hide";
  rules: ConditionalRule[];
  logic: "and" | "or"; // all rules must match or any
}

export interface FormField {
  id: string;
  form_id: string;
  field_type: string;
  label: string;
  description: string | null;
  placeholder: string | null;
  is_required: boolean;
  options: Array<{ label: string; value: string }>;
  validation: Record<string, unknown>;
  conditional_logic: ConditionalLogic | Record<string, never>;
  sort_order: number;
  created_at: string;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  respondent_id: string | null;
  answers: Record<string, unknown>;
  submitted_at: string;
  ip_address: string | null;
  user_agent: string | null;
  respondent?: Profile;
}

export type NotificationCategory =
  | "general"
  | "messaging"
  | "billing"
  | "coaching"
  | "gamification"
  | "system";

export type NotificationPriority = "critical" | "high" | "normal" | "low";

export interface Notification {
  id: string;
  recipient_id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  category: NotificationCategory;
  action_url: string | null;
  is_archived: boolean;
  priority: NotificationPriority;
  batched_at: string | null;
  batch_id: string | null;
  delivered_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  created_at: string;
}

export type BatchFrequency = "instant" | "hourly" | "daily";
export type PriorityThreshold = "all" | "high" | "critical";

export interface NotificationPreferences {
  id: string;
  user_id: string;
  quiet_hours_start: string;
  quiet_hours_end: string;
  batch_frequency: BatchFrequency;
  priority_threshold: PriorityThreshold;
  email_digest: boolean;
  push_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Certificate {
  id: string;
  student_id: string;
  course_id: string;
  certificate_number: string;
  issued_at: string;
  course_title: string;
  student_name: string;
  total_lessons: number;
  total_modules: number;
  quiz_average: number | null;
  created_at: string;
}

export interface Resource {
  id: string;
  title: string;
  description: string | null;
  category: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  uploaded_by: string;
  visibility: "all" | "staff" | "clients";
  is_pinned: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
  uploader?: Profile;
}

export type AiReportType =
  | "weekly_coaching"
  | "monthly_performance"
  | "client_risk";

export type AiConsentScope =
  | "chat_analysis"
  | "risk_scoring"
  | "report_generation"
  | "content_suggestions";

export interface AiReport {
  id: string;
  user_id: string;
  type: AiReportType;
  title: string;
  content: string;
  data: Record<string, unknown>;
  generated_at: string;
  read_at: string | null;
  created_at: string;
}

export interface AIConversation {
  id: string;
  user_id: string;
  title: string | null;
  context: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface AIMessage {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface AIInsight {
  id: string;
  type:
    | "student_risk"
    | "engagement_drop"
    | "content_suggestion"
    | "revenue_insight"
    | "weekly_summary";
  title: string;
  description: string;
  data: Record<string, unknown>;
  priority: "low" | "medium" | "high";
  is_dismissed: boolean;
  created_at: string;
}

export interface GoogleCalendarToken {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string | null;
  token_expiry: string | null;
  google_email: string | null;
  calendar_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
  user?: Profile;
}

export interface SmsReminder {
  id: string;
  user_id: string;
  recipient_phone: string;
  message: string;
  scheduled_at: string;
  sent_at: string | null;
  status: "pending" | "sent" | "failed" | "cancelled";
  related_type: "call" | "coaching" | "payment" | null;
  related_id: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContactInteraction {
  id: string;
  contact_id: string;
  type: "call" | "email" | "meeting" | "note" | "message";
  content: string | null;
  metadata: Record<string, unknown>;
  created_by: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Workbooks
// ---------------------------------------------------------------------------

export type WorkbookModuleType =
  | "marche"
  | "offre"
  | "communication"
  | "acquisition"
  | "conversion"
  | "diagnostic"
  | "general";

export interface WorkbookFieldOption {
  label: string;
  value: string;
}

export interface WorkbookFieldCondition {
  field_id: string;
  operator: "equals" | "not_equals" | "contains";
  value: string;
}

export interface WorkbookField {
  id: string;
  type: "text" | "textarea" | "select" | "number" | "rating";
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  options?: WorkbookFieldOption[];
  min?: number;
  max?: number;
  condition?: WorkbookFieldCondition;
}

export interface Workbook {
  id: string;
  title: string;
  description: string | null;
  course_id: string | null;
  module_type: WorkbookModuleType | null;
  fields: WorkbookField[];
  created_by: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type WorkbookSubmissionStatus = "draft" | "submitted" | "reviewed";

export interface WorkbookSubmission {
  id: string;
  workbook_id: string;
  client_id: string;
  call_id: string | null;
  answers: Record<string, unknown>;
  status: WorkbookSubmissionStatus;
  reviewer_notes: string | null;
  reviewed_by: string | null;
  submitted_at: string | null;
  created_at: string;
  workbook?: Workbook;
  client?: Profile;
}

export type VideoResponseRelatedType = "call" | "coaching_session" | "question";

export interface VideoResponse {
  id: string;
  sender_id: string;
  recipient_id: string;
  related_type: VideoResponseRelatedType;
  related_id: string | null;
  video_url: string;
  thumbnail_url: string | null;
  duration: number | null;
  message: string | null;
  viewed_at: string | null;
  created_at: string;
  sender?: Profile;
  recipient?: Profile;
}

export type CallDocumentType =
  | "transcript_fusion"
  | "summary"
  | "workbook_export";

export interface CallDocument {
  id: string;
  call_id: string;
  type: CallDocumentType;
  title: string;
  content_html: string;
  content_markdown: string | null;
  generated_by: string;
  model: string | null;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Custom Roles
// ---------------------------------------------------------------------------

export interface CustomRole {
  id: string;
  name: string;
  description: string | null;
  permissions: string[]; // array of module slugs
  color: string;
  icon: string;
  is_system: boolean;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  user_count?: number;
}

// ---------------------------------------------------------------------------
// Offboarding
// ---------------------------------------------------------------------------

export type OffboardingStatus =
  | "pending"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface OffboardingDataActions {
  transfer_clients: boolean;
  transfer_channels: boolean;
  archive_messages: boolean;
  export_data: boolean;
}

export interface OffboardingRequest {
  id: string;
  user_id: string;
  status: OffboardingStatus;
  transfer_to_id: string | null;
  reason: string | null;
  requested_by: string;
  data_actions: OffboardingDataActions;
  completed_at: string | null;
  created_at: string;
  user?: Profile;
  transfer_to?: Profile;
  requested_by_profile?: Profile;
}

// ---------------------------------------------------------------------------
// Row types for tables not yet generated by supabase gen types
// ---------------------------------------------------------------------------

export interface InvoiceRow {
  id: string;
  invoice_number: string;
  contract_id: string | null;
  client_id: string;
  amount: number;
  tax: number;
  tax_rate: number;
  total: number;
  status: string;
  due_date: string | null;
  paid_at: string | null;
  stripe_invoice_id: string | null;
  notes: string | null;
  discount: number;
  line_items: unknown;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface ContractRow {
  id: string;
  template_id: string | null;
  client_id: string;
  title: string;
  content: string;
  status: string;
  signature_data: unknown;
  signature_image: string | null;
  sent_at: string | null;
  signed_at: string | null;
  expires_at: string | null;
  cancellation_reason: string | null;
  version: number;
  auto_renew: boolean;
  renewal_period_months: number;
  renewal_notice_days: number;
  renewed_from_id: string | null;
  renewal_status: string | null;
  amount: number | null;
  start_date: string | null;
  end_date: string | null;
  renewal_of: string | null;
  renewed_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentScheduleRow {
  id: string;
  contract_id: string | null;
  client_id: string;
  total_amount: number;
  installments: number;
  frequency: string;
  start_date: string;
  installment_details: unknown;
  created_at: string;
  updated_at: string;
}

export interface CallCalendarRow {
  id: string;
  client_id: string | null;
  assigned_to: string;
  title: string;
  date: string;
  time: string;
  duration_minutes: number;
  call_type: string;
  status: string;
  link: string | null;
  notes: string | null;
  room_status: string;
  started_at: string | null;
  ended_at: string | null;
  actual_duration_seconds: number | null;
  reschedule_reason: string | null;
  original_date: string | null;
  original_time: string | null;
  satisfaction_rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface CallTranscriptRow {
  id: string;
  call_id: string;
  content: string;
  language: string;
  duration_seconds: number | null;
  created_at: string;
}

export interface CallNoteTemplateRow {
  id: string;
  title: string;
  structure: unknown;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
}

export interface WeeklyCheckinRow {
  id: string;
  user_id: string;
  week_start: string;
  mood: number | null;
  revenue: number | null;
  created_at: string;
}

export interface CoachAssignmentRow {
  id: string;
  coach_id: string;
  client_id: string;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BadgeRow {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  criteria: unknown;
  category: string | null;
  created_at: string;
}

export interface UserBadgeRow {
  id: string;
  profile_id: string;
  badge_id: string;
  earned_at: string;
  created_at: string;
}

export interface OnboardingProgressRow {
  id: string;
  user_id: string;
  step: string;
  completed_at: string | null;
  created_at: string;
}

export interface StudentFlagHistoryRow {
  id: string;
  student_id: string;
  old_flag: string | null;
  new_flag: string;
  reason: string | null;
  changed_by: string | null;
  created_at: string;
}

// Supabase Database type map
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Seal<Profile>;
        Insert: Seal<Partial<Profile> & { id: string; email: string; full_name: string }>;
        Update: Seal<Partial<Profile>>;
        Relationships: [];
      };
      student_details: {
        Row: Seal<StudentDetail>;
        Insert: Seal<Partial<StudentDetail> & { profile_id: string }>;
        Update: Seal<Partial<StudentDetail>>;
        Relationships: [];
      };
      student_activities: {
        Row: Seal<StudentActivity>;
        Insert: Seal<Partial<StudentActivity> & { student_id: string; activity_type: string }>;
        Update: Seal<Partial<StudentActivity>>;
        Relationships: [];
      };
      student_notes: {
        Row: Seal<StudentNote>;
        Insert: Seal<Partial<StudentNote> & { student_id: string; author_id: string; content: string }>;
        Update: Seal<Partial<StudentNote>>;
        Relationships: [];
      };
      student_tasks: {
        Row: Seal<StudentTask>;
        Insert: Seal<Partial<StudentTask> & { student_id: string; title: string }>;
        Update: Seal<Partial<StudentTask>>;
        Relationships: [];
      };
      channels: {
        Row: Seal<Channel>;
        Insert: Seal<Partial<Channel> & { name: string }>;
        Update: Seal<Partial<Channel>>;
        Relationships: [];
      };
      channel_members: {
        Row: Seal<ChannelMember>;
        Insert: Seal<Partial<ChannelMember> & { channel_id: string; profile_id: string }>;
        Update: Seal<Partial<ChannelMember>>;
        Relationships: [];
      };
      messages: {
        Row: Seal<Message>;
        Insert: Seal<Partial<Message> & { channel_id: string; sender_id: string; content: string }>;
        Update: Seal<Partial<Message>>;
        Relationships: [];
      };
      message_reactions: {
        Row: Seal<MessageReaction>;
        Insert: Seal<Partial<MessageReaction> & { message_id: string; profile_id: string; emoji: string }>;
        Update: Seal<Partial<MessageReaction>>;
        Relationships: [];
      };
      message_attachments: {
        Row: Seal<MessageAttachment>;
        Insert: Seal<Partial<MessageAttachment> & { message_id: string; file_name: string; file_url: string; file_type: string }>;
        Update: Seal<Partial<MessageAttachment>>;
        Relationships: [];
      };
      courses: {
        Row: Seal<Course>;
        Insert: Seal<Partial<Course> & { title: string }>;
        Update: Seal<Partial<Course>>;
        Relationships: [];
      };
      modules: {
        Row: Seal<Module>;
        Insert: Seal<Partial<Module> & { course_id: string; title: string }>;
        Update: Seal<Partial<Module>>;
        Relationships: [];
      };
      lessons: {
        Row: Seal<Lesson>;
        Insert: Seal<Partial<Lesson> & { module_id: string; title: string; content_type: string }>;
        Update: Seal<Partial<Lesson>>;
        Relationships: [];
      };
      lesson_progress: {
        Row: Seal<LessonProgress>;
        Insert: Seal<Partial<LessonProgress> & { lesson_id: string; student_id: string }>;
        Update: Seal<Partial<LessonProgress>>;
        Relationships: [];
      };
      lesson_comments: {
        Row: Seal<LessonComment>;
        Insert: Seal<Partial<LessonComment> & { lesson_id: string; author_id: string; content: string }>;
        Update: Seal<Partial<LessonComment>>;
        Relationships: [];
      };
      form_templates: {
        Row: Seal<FormTemplate>;
        Insert: Seal<Partial<FormTemplate> & { name: string; category: string }>;
        Update: Seal<Partial<FormTemplate>>;
        Relationships: [];
      };
      forms: {
        Row: Seal<Form>;
        Insert: Seal<Partial<Form> & { title: string; created_by: string }>;
        Update: Seal<Partial<Form>>;
        Relationships: [];
      };
      form_fields: {
        Row: Seal<FormField>;
        Insert: Seal<Partial<FormField> & { form_id: string; field_type: string; label: string }>;
        Update: Seal<Partial<FormField>>;
        Relationships: [];
      };
      form_submissions: {
        Row: Seal<FormSubmission>;
        Insert: Seal<Partial<FormSubmission> & { form_id: string }>;
        Update: Seal<Partial<FormSubmission>>;
        Relationships: [];
      };
      notifications: {
        Row: Seal<Notification>;
        Insert: Seal<Partial<Notification> & { recipient_id: string; type: string; title: string }>;
        Update: Seal<Partial<Notification>>;
        Relationships: [];
      };
      notification_preferences: {
        Row: Seal<NotificationPreferences>;
        Insert: Seal<Partial<NotificationPreferences> & { user_id: string }>;
        Update: Seal<Partial<NotificationPreferences>>;
        Relationships: [];
      };
      ai_reports: {
        Row: Seal<AiReport>;
        Insert: Seal<Partial<AiReport> & { user_id: string; type: string; title: string; content: string }>;
        Update: Seal<Partial<AiReport>>;
        Relationships: [];
      };
      ai_conversations: {
        Row: Seal<AIConversation>;
        Insert: Seal<Partial<AIConversation> & { user_id: string }>;
        Update: Seal<Partial<AIConversation>>;
        Relationships: [];
      };
      ai_messages: {
        Row: Seal<AIMessage>;
        Insert: Seal<Partial<AIMessage> & { conversation_id: string; role: string; content: string }>;
        Update: Seal<Partial<AIMessage>>;
        Relationships: [];
      };
      ai_insights: {
        Row: Seal<AIInsight>;
        Insert: Seal<Partial<AIInsight> & { type: string; title: string; description: string }>;
        Update: Seal<Partial<AIInsight>>;
        Relationships: [];
      };
      invoices: {
        Row: Seal<InvoiceRow>;
        Insert: Seal<Partial<InvoiceRow> & { client_id: string; amount: number; total: number }>;
        Update: Seal<Partial<InvoiceRow>>;
        Relationships: [];
      };
      contracts: {
        Row: Seal<ContractRow>;
        Insert: Seal<Partial<ContractRow> & { client_id: string; title: string }>;
        Update: Seal<Partial<ContractRow>>;
        Relationships: [];
      };
      payment_schedules: {
        Row: Seal<PaymentScheduleRow>;
        Insert: Seal<Partial<PaymentScheduleRow> & { client_id: string; total_amount: number; installments: number }>;
        Update: Seal<Partial<PaymentScheduleRow>>;
        Relationships: [];
      };
      call_calendar: {
        Row: Seal<CallCalendarRow>;
        Insert: Seal<Partial<CallCalendarRow> & { title: string; date: string; time: string }>;
        Update: Seal<Partial<CallCalendarRow>>;
        Relationships: [];
      };
      call_transcripts: {
        Row: Seal<CallTranscriptRow>;
        Insert: Seal<Partial<CallTranscriptRow> & { call_id: string; content: string }>;
        Update: Seal<Partial<CallTranscriptRow>>;
        Relationships: [];
      };
      call_note_templates: {
        Row: Seal<CallNoteTemplateRow>;
        Insert: Seal<Partial<CallNoteTemplateRow> & { title: string }>;
        Update: Seal<Partial<CallNoteTemplateRow>>;
        Relationships: [];
      };
      weekly_checkins: {
        Row: Seal<WeeklyCheckinRow>;
        Insert: Seal<Partial<WeeklyCheckinRow>>;
        Update: Seal<Partial<WeeklyCheckinRow>>;
        Relationships: [];
      };
      coach_assignments: {
        Row: Seal<CoachAssignmentRow>;
        Insert: Seal<Partial<CoachAssignmentRow> & { coach_id: string; client_id: string }>;
        Update: Seal<Partial<CoachAssignmentRow>>;
        Relationships: [];
      };
      badges: {
        Row: Seal<BadgeRow>;
        Insert: Seal<Partial<BadgeRow> & { name: string }>;
        Update: Seal<Partial<BadgeRow>>;
        Relationships: [];
      };
      user_badges: {
        Row: Seal<UserBadgeRow>;
        Insert: Seal<Partial<UserBadgeRow> & { profile_id: string; badge_id: string }>;
        Update: Seal<Partial<UserBadgeRow>>;
        Relationships: [];
      };
      onboarding_progress: {
        Row: Seal<OnboardingProgressRow>;
        Insert: Seal<Partial<OnboardingProgressRow> & { user_id: string; step: string }>;
        Update: Seal<Partial<OnboardingProgressRow>>;
        Relationships: [];
      };
      student_flag_history: {
        Row: Seal<StudentFlagHistoryRow>;
        Insert: Seal<Partial<StudentFlagHistoryRow> & { student_id: string; new_flag: string }>;
        Update: Seal<Partial<StudentFlagHistoryRow>>;
        Relationships: [];
      };
      workbooks: {
        Row: Seal<Workbook>;
        Insert: Seal<Partial<Workbook> & { title: string }>;
        Update: Seal<Partial<Workbook>>;
        Relationships: [];
      };
      workbook_submissions: {
        Row: Seal<WorkbookSubmission>;
        Insert: Seal<Partial<WorkbookSubmission> & { workbook_id: string; client_id: string }>;
        Update: Seal<Partial<WorkbookSubmission>>;
        Relationships: [];
      };
      announcements: {
        Row: Seal<Announcement>;
        Insert: Seal<Partial<Announcement> & { title: string; content: string }>;
        Update: Seal<Partial<Announcement>>;
        Relationships: [];
      };
      announcement_reads: {
        Row: Seal<AnnouncementRead>;
        Insert: Seal<Partial<AnnouncementRead> & { announcement_id: string; user_id: string }>;
        Update: Seal<Partial<AnnouncementRead>>;
        Relationships: [];
      };
      user_roles: {
        Row: Seal<UserRole>;
        Insert: Seal<Partial<UserRole> & { user_id: string; role: AppRole }>;
        Update: Seal<Partial<UserRole>>;
        Relationships: [];
      };
      leads: {
        Row: Seal<LeadRow>;
        Insert: Seal<Partial<LeadRow> & { name: string }>;
        Update: Seal<Partial<LeadRow>>;
        Relationships: [];
      };
      sessions: {
        Row: Seal<SessionRow>;
        Insert: Seal<Partial<SessionRow> & { client_id: string; coach_id: string }>;
        Update: Seal<Partial<SessionRow>>;
        Relationships: [];
      };
      coaching_goals: {
        Row: Seal<CoachingGoalRow>;
        Insert: Seal<Partial<CoachingGoalRow> & { client_id: string; title: string }>;
        Update: Seal<Partial<CoachingGoalRow>>;
        Relationships: [];
      };
      coach_alerts: {
        Row: Seal<CoachAlertRow>;
        Insert: Seal<Partial<CoachAlertRow> & { client_id: string; alert_type: string; title: string }>;
        Update: Seal<Partial<CoachAlertRow>>;
        Relationships: [];
      };
      booking_pages: {
        Row: Seal<BookingPageRow>;
        Insert: Seal<Partial<BookingPageRow> & { slug: string; title: string }>;
        Update: Seal<Partial<BookingPageRow>>;
        Relationships: [];
      };
      booking_availability: {
        Row: Seal<BookingAvailabilityRow>;
        Insert: Seal<Partial<BookingAvailabilityRow> & { booking_page_id: string; day_of_week: number }>;
        Update: Seal<Partial<BookingAvailabilityRow>>;
        Relationships: [];
      };
      booking_exceptions: {
        Row: Seal<BookingExceptionRow>;
        Insert: Seal<Partial<BookingExceptionRow> & { booking_page_id: string; exception_date: string }>;
        Update: Seal<Partial<BookingExceptionRow>>;
        Relationships: [];
      };
      bookings: {
        Row: Seal<BookingRow>;
        Insert: Seal<Partial<BookingRow> & { booking_page_id: string; prospect_name: string; date: string }>;
        Update: Seal<Partial<BookingRow>>;
        Relationships: [];
      };
      availability_slots: {
        Row: Seal<AvailabilitySlotRow>;
        Insert: Seal<Partial<AvailabilitySlotRow> & { user_id: string; day_of_week: number }>;
        Update: Seal<Partial<AvailabilitySlotRow>>;
        Relationships: [];
      };
      availability_overrides: {
        Row: Seal<AvailabilityOverrideRow>;
        Insert: Seal<Partial<AvailabilityOverrideRow> & { user_id: string; date: string }>;
        Update: Seal<Partial<AvailabilityOverrideRow>>;
        Relationships: [];
      };
      message_templates: {
        Row: Seal<MessageTemplateRow>;
        Insert: Seal<Partial<MessageTemplateRow> & { title: string; content: string; created_by: string }>;
        Update: Seal<Partial<MessageTemplateRow>>;
        Relationships: [];
      };
      message_template_usage: {
        Row: Seal<MessageTemplateUsageRow>;
        Insert: Seal<Partial<MessageTemplateUsageRow> & { template_id: string }>;
        Update: Seal<Partial<MessageTemplateUsageRow>>;
        Relationships: [];
      };
      setter_leads: {
        Row: Seal<SetterLeadRow>;
        Insert: Seal<Partial<SetterLeadRow> & { setter_id: string }>;
        Update: Seal<Partial<SetterLeadRow>>;
        Relationships: [];
      };
      pipeline_columns: {
        Row: Seal<PipelineColumnRow>;
        Insert: Seal<Partial<PipelineColumnRow> & { name: string }>;
        Update: Seal<Partial<PipelineColumnRow>>;
        Relationships: [];
      };
      setter_activities: {
        Row: Seal<SetterActivityRow>;
        Insert: Seal<Partial<SetterActivityRow> & { user_id: string; date: string }>;
        Update: Seal<Partial<SetterActivityRow>>;
        Relationships: [];
      };
      feed_posts: {
        Row: Seal<FeedPostRow>;
        Insert: Seal<Partial<FeedPostRow> & { author_id: string; content: string }>;
        Update: Seal<Partial<FeedPostRow>>;
        Relationships: [];
      };
      feed_comments: {
        Row: Seal<FeedCommentRow>;
        Insert: Seal<Partial<FeedCommentRow> & { post_id: string; author_id: string; content: string }>;
        Update: Seal<Partial<FeedCommentRow>>;
        Relationships: [];
      };
      feed_likes: {
        Row: Seal<FeedLikeRow>;
        Insert: Seal<Partial<FeedLikeRow> & { post_id: string; profile_id: string }>;
        Update: Seal<Partial<FeedLikeRow>>;
        Relationships: [];
      };
      user_invites: {
        Row: Seal<UserInviteRow>;
        Insert: Seal<Partial<UserInviteRow> & { email: string; role: string; invite_code: string; invited_by: string }>;
        Update: Seal<Partial<UserInviteRow>>;
        Relationships: [];
      };
      quiz_attempts: {
        Row: Seal<QuizAttemptRow>;
        Insert: Seal<Partial<QuizAttemptRow> & { lesson_id: string; student_id: string }>;
        Update: Seal<Partial<QuizAttemptRow>>;
        Relationships: [];
      };
      gamification_rewards: {
        Row: Seal<GamificationRewardRow>;
        Insert: Seal<Partial<GamificationRewardRow> & { title: string; cost_xp: number }>;
        Update: Seal<Partial<GamificationRewardRow>>;
        Relationships: [];
      };
      reward_redemptions: {
        Row: Seal<RewardRedemptionRow>;
        Insert: Seal<Partial<RewardRedemptionRow> & { user_id: string; reward_id: string; xp_spent: number }>;
        Update: Seal<Partial<RewardRedemptionRow>>;
        Relationships: [];
      };
      journal_entries: {
        Row: Seal<JournalEntryRow>;
        Insert: Seal<Partial<JournalEntryRow> & { user_id: string }>;
        Update: Seal<Partial<JournalEntryRow>>;
        Relationships: [];
      };
      xp_transactions: {
        Row: Seal<XpTransactionRow>;
        Insert: Seal<Partial<XpTransactionRow> & { profile_id: string; amount: number; reason: string }>;
        Update: Seal<Partial<XpTransactionRow>>;
        Relationships: [];
      };
      gamification_entries: {
        Row: Seal<GamificationEntryRow>;
        Insert: Seal<Partial<GamificationEntryRow> & { profile_id: string }>;
        Update: Seal<Partial<GamificationEntryRow>>;
        Relationships: [];
      };
      resources: {
        Row: Seal<Resource>;
        Insert: Seal<Partial<Resource> & { title: string }>;
        Update: Seal<Partial<Resource>>;
        Relationships: [];
      };
      certificates: {
        Row: Seal<Certificate>;
        Insert: Seal<Partial<Certificate> & { student_id: string; course_id: string }>;
        Update: Seal<Partial<Certificate>>;
        Relationships: [];
      };
      ai_consent: {
        Row: Seal<AiConsentRow>;
        Insert: Seal<Partial<AiConsentRow> & { user_id: string }>;
        Update: Seal<Partial<AiConsentRow>>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
  };
}

// ─── Row type aliases for new tables ────────────────────────────────────────

export interface AnnouncementRead {
  id: string;
  announcement_id: string;
  user_id: string;
  read_at: string;
}

export interface LeadRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  status: string;
  source: string | null;
  notes: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionRow {
  id: string;
  client_id: string;
  coach_id: string;
  title: string;
  session_type: string;
  scheduled_at: string;
  duration_minutes: number;
  status: string;
  notes: string | null;
  action_items: unknown[];
  replay_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface CoachingGoalRow {
  id: string;
  client_id: string;
  set_by: string | null;
  title: string;
  description: string | null;
  target_value: number | null;
  current_value: number;
  unit: string | null;
  deadline: string | null;
  status: string;
  difficulty: number | null;
  coach_notes: string | null;
  milestones: unknown[] | null;
  created_at: string;
  updated_at: string;
}

export interface CoachAlertRow {
  id: string;
  client_id: string;
  coach_id: string | null;
  alert_type: string;
  title: string;
  description: string | null;
  severity: string;
  is_resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

export interface BookingPageRow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  is_active: boolean;
  brand_color: string;
  slot_duration: number;
  buffer_minutes: number;
  min_notice_hours: number;
  max_days_ahead: number;
  qualification_fields: unknown[];
  timezone: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingAvailabilityRow {
  id: string;
  booking_page_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

export interface BookingExceptionRow {
  id: string;
  booking_page_id: string;
  exception_date: string;
  type: string;
  reason: string | null;
  created_at: string;
}

export interface BookingRow {
  id: string;
  booking_page_id: string;
  prospect_name: string;
  prospect_email: string | null;
  prospect_phone: string | null;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  qualification_answers: Record<string, string>;
  google_event_id: string | null;
  meet_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface AvailabilitySlotRow {
  id: string;
  user_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
  created_at: string;
}

export interface AvailabilityOverrideRow {
  id: string;
  user_id: string;
  date: string;
  is_available: boolean;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  created_at: string;
}

export interface MessageTemplateRow {
  id: string;
  title: string;
  content: string;
  category: string;
  shortcut: string | null;
  is_shared: boolean;
  created_by: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface MessageTemplateUsageRow {
  id: string;
  template_id: string;
  used_by: string;
  used_at: string;
}

export interface SetterLeadRow {
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

export interface PipelineColumnRow {
  id: string;
  client_id: string | null;
  name: string;
  color: string;
  position: number;
  is_terminal: boolean;
  created_at: string;
}

export interface SetterActivityRow {
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

export interface FeedPostRow {
  id: string;
  author_id: string;
  content: string;
  post_type: string;
  media_urls: string[];
  community_id: string | null;
  is_pinned: boolean;
  likes_count: number;
  comments_count: number;
  trending_score: number;
  created_at: string;
  updated_at: string;
}

export interface FeedCommentRow {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_id: string | null;
  reply_count: number;
  created_at: string;
  updated_at: string;
}

export interface FeedLikeRow {
  id: string;
  post_id: string;
  profile_id: string;
  created_at: string;
}

export interface UserInviteRow {
  id: string;
  email: string;
  full_name: string;
  role: string;
  invite_code: string;
  status: string;
  invited_by: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  resent_count: number;
  resent_at: string | null;
}

export interface QuizAttemptRow {
  id: string;
  lesson_id: string;
  student_id: string;
  answers: unknown[];
  score: number;
  total_questions: number;
  correct_answers: number;
  passed: boolean;
  completed_at: string;
  time_spent: number;
  created_at: string;
}

export interface GamificationRewardRow {
  id: string;
  title: string;
  name: string;
  description: string | null;
  cost_xp: number;
  type: string;
  stock: number | null;
  is_active: boolean;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
}

export interface RewardRedemptionRow {
  id: string;
  user_id: string;
  reward_id: string;
  xp_spent: number;
  status: string;
  redeemed_at: string;
  created_at: string;
  fulfilled_at: string | null;
  fulfilled_by: string | null;
}

export interface JournalEntryRow {
  id: string;
  user_id: string;
  content: string | null;
  mood: number | null;
  energy: number | null;
  gratitude: string[] | null;
  wins: string[] | null;
  challenges: string[] | null;
  goals_tomorrow: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface XpTransactionRow {
  id: string;
  profile_id: string;
  amount: number;
  reason: string;
  source_type: string | null;
  source_id: string | null;
  created_at: string;
}

export interface GamificationEntryRow {
  id: string;
  profile_id: string;
  action: string;
  xp_earned: number;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

export interface AiConsentRow {
  id: string;
  user_id: string;
  scope: string[];
  given_at: string;
  created_at: string;
}
