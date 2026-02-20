export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  role: "admin" | "coach" | "team" | "student";
  phone: string | null;
  bio: string | null;
  timezone: string;
  onboarding_completed: boolean;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentDetail {
  id: string;
  profile_id: string;
  tag: "vip" | "standard" | "new" | "at_risk" | "churned";
  revenue: number;
  lifetime_value: number;
  acquisition_source: string | null;
  enrollment_date: string;
  program: string | null;
  goals: string | null;
  coach_notes: string | null;
  health_score: number;
  last_engagement_at: string | null;
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
  content_type: "text" | "image" | "file" | "video" | "system";
  reply_to: string | null;
  is_pinned: boolean;
  is_edited: boolean;
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

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  content_type: "video" | "text" | "pdf" | "quiz" | "assignment";
  content: Record<string, unknown>;
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
  conditional_logic: Record<string, unknown>;
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

export interface Notification {
  id: string;
  recipient_id: string;
  type: string;
  title: string;
  body: string | null;
  data: Record<string, unknown>;
  is_read: boolean;
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
  type: "student_risk" | "engagement_drop" | "content_suggestion" | "revenue_insight" | "weekly_summary";
  title: string;
  description: string;
  data: Record<string, unknown>;
  priority: "low" | "medium" | "high";
  is_dismissed: boolean;
  created_at: string;
}

// Supabase Database type map
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; email: string; full_name: string };
        Update: Partial<Profile>;
      };
      student_details: {
        Row: StudentDetail;
        Insert: Partial<StudentDetail> & { profile_id: string };
        Update: Partial<StudentDetail>;
      };
      student_activities: {
        Row: StudentActivity;
        Insert: Partial<StudentActivity> & { student_id: string; activity_type: string };
        Update: Partial<StudentActivity>;
      };
      student_notes: {
        Row: StudentNote;
        Insert: Partial<StudentNote> & { student_id: string; author_id: string; content: string };
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
        Insert: Partial<ChannelMember> & { channel_id: string; profile_id: string };
        Update: Partial<ChannelMember>;
      };
      messages: {
        Row: Message;
        Insert: Partial<Message> & { channel_id: string; sender_id: string; content: string };
        Update: Partial<Message>;
      };
      message_reactions: {
        Row: MessageReaction;
        Insert: Partial<MessageReaction> & { message_id: string; profile_id: string; emoji: string };
        Update: Partial<MessageReaction>;
      };
      message_attachments: {
        Row: MessageAttachment;
        Insert: Partial<MessageAttachment> & { message_id: string; file_name: string; file_url: string; file_type: string };
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
        Insert: Partial<Lesson> & { module_id: string; title: string; content_type: string };
        Update: Partial<Lesson>;
      };
      lesson_progress: {
        Row: LessonProgress;
        Insert: Partial<LessonProgress> & { lesson_id: string; student_id: string };
        Update: Partial<LessonProgress>;
      };
      lesson_comments: {
        Row: LessonComment;
        Insert: Partial<LessonComment> & { lesson_id: string; author_id: string; content: string };
        Update: Partial<LessonComment>;
      };
      forms: {
        Row: Form;
        Insert: Partial<Form> & { title: string; created_by: string };
        Update: Partial<Form>;
      };
      form_fields: {
        Row: FormField;
        Insert: Partial<FormField> & { form_id: string; field_type: string; label: string };
        Update: Partial<FormField>;
      };
      form_submissions: {
        Row: FormSubmission;
        Insert: Partial<FormSubmission> & { form_id: string };
        Update: Partial<FormSubmission>;
      };
      notifications: {
        Row: Notification;
        Insert: Partial<Notification> & { recipient_id: string; type: string; title: string };
        Update: Partial<Notification>;
      };
      ai_conversations: {
        Row: AIConversation;
        Insert: Partial<AIConversation> & { user_id: string };
        Update: Partial<AIConversation>;
      };
      ai_messages: {
        Row: AIMessage;
        Insert: Partial<AIMessage> & { conversation_id: string; role: string; content: string };
        Update: Partial<AIMessage>;
      };
      ai_insights: {
        Row: AIInsight;
        Insert: Partial<AIInsight> & { type: string; title: string; description: string };
        Update: Partial<AIInsight>;
      };
    };
  };
}
