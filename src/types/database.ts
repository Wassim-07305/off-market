export type AppRole = "admin" | "coach" | "client" | "setter" | "closer";

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
  role: "admin" | "coach" | "setter" | "closer" | "client";
  phone: string | null;
  bio: string | null;
  timezone: string;
  default_currency: string;
  onboarding_completed: boolean;
  onboarding_step: number;
  onboarding_offer_id: string | null;
  onboarding_answers: Record<string, string> | null;
  onboarding_completed_at: string | null;
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

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description: string | null;
  content_type: "video" | "text" | "pdf" | "quiz" | "assignment";
  content: Record<string, unknown>;
  video_url: string | null;
  content_html: string | null;
  attachments: LessonAttachment[];
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
  created_at: string;
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

export type CallDocumentType = "transcript_fusion" | "summary" | "workbook_export";

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

// Supabase Database type map
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & {
          id: string;
          email: string;
          full_name: string;
        };
        Update: Partial<Profile>;
      };
      student_details: {
        Row: StudentDetail;
        Insert: Partial<StudentDetail> & { profile_id: string };
        Update: Partial<StudentDetail>;
      };
      student_activities: {
        Row: StudentActivity;
        Insert: Partial<StudentActivity> & {
          student_id: string;
          activity_type: string;
        };
        Update: Partial<StudentActivity>;
      };
      student_notes: {
        Row: StudentNote;
        Insert: Partial<StudentNote> & {
          student_id: string;
          author_id: string;
          content: string;
        };
        Update: Partial<StudentNote>;
      };
      student_tasks: {
        Row: StudentTask;
        Insert: Partial<StudentTask> & { student_id: string; title: string };
        Update: Partial<StudentTask>;
      };
      channels: {
        Row: Channel;
        Insert: Partial<Channel> & { name: string };
        Update: Partial<Channel>;
      };
      channel_members: {
        Row: ChannelMember;
        Insert: Partial<ChannelMember> & {
          channel_id: string;
          profile_id: string;
        };
        Update: Partial<ChannelMember>;
      };
      messages: {
        Row: Message;
        Insert: Partial<Message> & {
          channel_id: string;
          sender_id: string;
          content: string;
        };
        Update: Partial<Message>;
      };
      message_reactions: {
        Row: MessageReaction;
        Insert: Partial<MessageReaction> & {
          message_id: string;
          profile_id: string;
          emoji: string;
        };
        Update: Partial<MessageReaction>;
      };
      message_attachments: {
        Row: MessageAttachment;
        Insert: Partial<MessageAttachment> & {
          message_id: string;
          file_name: string;
          file_url: string;
          file_type: string;
        };
        Update: Partial<MessageAttachment>;
      };
      courses: {
        Row: Course;
        Insert: Partial<Course> & { title: string };
        Update: Partial<Course>;
      };
      modules: {
        Row: Module;
        Insert: Partial<Module> & { course_id: string; title: string };
        Update: Partial<Module>;
      };
      lessons: {
        Row: Lesson;
        Insert: Partial<Lesson> & {
          module_id: string;
          title: string;
          content_type: string;
        };
        Update: Partial<Lesson>;
      };
      lesson_progress: {
        Row: LessonProgress;
        Insert: Partial<LessonProgress> & {
          lesson_id: string;
          student_id: string;
        };
        Update: Partial<LessonProgress>;
      };
      lesson_comments: {
        Row: LessonComment;
        Insert: Partial<LessonComment> & {
          lesson_id: string;
          author_id: string;
          content: string;
        };
        Update: Partial<LessonComment>;
      };
      forms: {
        Row: Form;
        Insert: Partial<Form> & { title: string; created_by: string };
        Update: Partial<Form>;
      };
      form_fields: {
        Row: FormField;
        Insert: Partial<FormField> & {
          form_id: string;
          field_type: string;
          label: string;
        };
        Update: Partial<FormField>;
      };
      form_submissions: {
        Row: FormSubmission;
        Insert: Partial<FormSubmission> & { form_id: string };
        Update: Partial<FormSubmission>;
      };
      notifications: {
        Row: Notification;
        Insert: Partial<Notification> & {
          recipient_id: string;
          type: string;
          title: string;
        };
        Update: Partial<Notification>;
      };
      ai_conversations: {
        Row: AIConversation;
        Insert: Partial<AIConversation> & { user_id: string };
        Update: Partial<AIConversation>;
      };
      ai_messages: {
        Row: AIMessage;
        Insert: Partial<AIMessage> & {
          conversation_id: string;
          role: string;
          content: string;
        };
        Update: Partial<AIMessage>;
      };
      ai_insights: {
        Row: AIInsight;
        Insert: Partial<AIInsight> & {
          type: string;
          title: string;
          description: string;
        };
        Update: Partial<AIInsight>;
      };
    };
  };
}
