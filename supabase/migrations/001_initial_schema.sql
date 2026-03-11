-- ═══════════════════════════════════════
-- OFF MARKET — INITIAL SCHEMA
-- ═══════════════════════════════════════

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'coach', 'team', 'student')),
  phone TEXT,
  bio TEXT,
  timezone TEXT DEFAULT 'Europe/Paris',
  onboarding_completed BOOLEAN DEFAULT false,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- STUDENT DETAILS
CREATE TABLE public.student_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tag TEXT DEFAULT 'standard' CHECK (tag IN ('vip', 'standard', 'new', 'at_risk', 'churned')),
  revenue NUMERIC(10,2) DEFAULT 0,
  lifetime_value NUMERIC(10,2) DEFAULT 0,
  acquisition_source TEXT,
  enrollment_date DATE DEFAULT CURRENT_DATE,
  program TEXT,
  goals TEXT,
  coach_notes TEXT,
  health_score INTEGER DEFAULT 50 CHECK (health_score BETWEEN 0 AND 100),
  last_engagement_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id)
);

-- STUDENT ACTIVITIES
CREATE TABLE public.student_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'module_started', 'module_completed', 'lesson_completed',
    'form_submitted', 'message_sent', 'login', 'milestone_reached',
    'note_added', 'call_scheduled', 'payment_received'
  )),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- STUDENT NOTES
CREATE TABLE public.student_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- STUDENT TASKS
CREATE TABLE public.student_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES public.profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'overdue')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- CHANNELS
CREATE TABLE public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'public' CHECK (type IN ('public', 'private', 'dm')),
  created_by UUID REFERENCES public.profiles(id),
  is_archived BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  avatar_url TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- CHANNEL MEMBERS
CREATE TABLE public.channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'moderator', 'member')),
  last_read_at TIMESTAMPTZ DEFAULT now(),
  notifications_muted BOOLEAN DEFAULT false,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(channel_id, profile_id)
);

-- MESSAGES
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'file', 'video', 'system')),
  reply_to UUID REFERENCES public.messages(id),
  is_pinned BOOLEAN DEFAULT false,
  is_edited BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- MESSAGE REACTIONS
CREATE TABLE public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(message_id, profile_id, emoji)
);

-- MESSAGE ATTACHMENTS
CREATE TABLE public.message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- COURSES
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  sort_order INTEGER DEFAULT 0,
  is_mandatory BOOLEAN DEFAULT false,
  estimated_duration INTEGER,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- MODULES
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_locked BOOLEAN DEFAULT false,
  unlock_condition JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- LESSONS
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'text', 'pdf', 'quiz', 'assignment')),
  content JSONB NOT NULL DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  estimated_duration INTEGER,
  is_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- LESSON PROGRESS
CREATE TABLE public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  progress_percent INTEGER DEFAULT 0,
  time_spent INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(lesson_id, student_id)
);

-- LESSON COMMENTS
CREATE TABLE public.lesson_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT NOT NULL,
  reply_to UUID REFERENCES public.lesson_comments(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- FORMS
CREATE TABLE public.forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  cover_image_url TEXT,
  thank_you_message TEXT DEFAULT 'Merci pour ta reponse !',
  is_anonymous BOOLEAN DEFAULT false,
  allow_multiple_submissions BOOLEAN DEFAULT false,
  closes_at TIMESTAMPTZ,
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'vip', 'standard', 'new', 'custom')),
  target_student_ids UUID[] DEFAULT '{}',
  notification_on_submit BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- FORM FIELDS
CREATE TABLE public.form_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  field_type TEXT NOT NULL CHECK (field_type IN (
    'short_text', 'long_text', 'email', 'phone', 'number',
    'single_select', 'multi_select', 'dropdown',
    'rating', 'nps', 'scale',
    'date', 'time',
    'file_upload',
    'heading', 'paragraph', 'divider'
  )),
  label TEXT NOT NULL,
  description TEXT,
  placeholder TEXT,
  is_required BOOLEAN DEFAULT false,
  options JSONB DEFAULT '[]',
  validation JSONB DEFAULT '{}',
  conditional_logic JSONB DEFAULT '{}',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- FORM SUBMISSIONS
CREATE TABLE public.form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES public.forms(id) ON DELETE CASCADE,
  respondent_id UUID REFERENCES public.profiles(id),
  answers JSONB NOT NULL DEFAULT '{}',
  submitted_at TIMESTAMPTZ DEFAULT now(),
  ip_address INET,
  user_agent TEXT
);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN (
    'new_message', 'mention', 'form_response', 'module_complete',
    'task_assigned', 'task_due', 'student_inactive', 'new_enrollment',
    'ai_insight', 'system'
  )),
  title TEXT NOT NULL,
  body TEXT,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI CONVERSATIONS
CREATE TABLE public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT,
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- AI MESSAGES
CREATE TABLE public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- AI INSIGHTS
CREATE TABLE public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('student_risk', 'engagement_drop', 'content_suggestion', 'revenue_insight', 'weekly_summary')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  is_dismissed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════

CREATE INDEX idx_messages_channel_created ON public.messages(channel_id, created_at DESC);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_channel_members_profile ON public.channel_members(profile_id);
CREATE INDEX idx_lesson_progress_student ON public.lesson_progress(student_id);
CREATE INDEX idx_student_activities_student ON public.student_activities(student_id, created_at DESC);
CREATE INDEX idx_notifications_recipient ON public.notifications(recipient_id, is_read, created_at DESC);
CREATE INDEX idx_form_submissions_form ON public.form_submissions(form_id, submitted_at DESC);
CREATE INDEX idx_ai_messages_conversation ON public.ai_messages(conversation_id, created_at);
CREATE INDEX idx_student_details_profile ON public.student_details(profile_id);
CREATE INDEX idx_student_notes_student ON public.student_notes(student_id);
CREATE INDEX idx_student_tasks_student ON public.student_tasks(student_id);
CREATE INDEX idx_channels_type ON public.channels(type);
CREATE INDEX idx_courses_status ON public.courses(status);
CREATE INDEX idx_forms_status ON public.forms(status);

-- ═══════════════════════════════════════
-- TRIGGERS
-- ═══════════════════════════════════════

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_student_details_updated_at BEFORE UPDATE ON public.student_details FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_student_notes_updated_at BEFORE UPDATE ON public.student_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_courses_updated_at BEFORE UPDATE ON public.courses FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_lessons_updated_at BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_forms_updated_at BEFORE UPDATE ON public.forms FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_ai_conversations_updated_at BEFORE UPDATE ON public.ai_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-create student_details for student role
CREATE OR REPLACE FUNCTION handle_student_profile()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'student' THEN
    INSERT INTO public.student_details (profile_id, tag)
    VALUES (NEW.id, 'new')
    ON CONFLICT (profile_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_role_set
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION handle_student_profile();

-- Update channel last_message_at
CREATE OR REPLACE FUNCTION update_channel_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.channels SET last_message_at = NEW.created_at WHERE id = NEW.channel_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_channel_last_message
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_channel_last_message();

-- ═══════════════════════════════════════
-- REALTIME
-- ═══════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.channel_members;

-- ═══════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admin/Coach can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);
CREATE POLICY "Team can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'team')
);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin can update any profile" ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- STUDENT DETAILS
CREATE POLICY "Admin/Coach can view all student_details" ON public.student_details FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach', 'team'))
);
CREATE POLICY "Students can view own details" ON public.student_details FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Admin/Coach can manage student_details" ON public.student_details FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);

-- STUDENT ACTIVITIES
CREATE POLICY "Admin/Coach can view all activities" ON public.student_activities FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach', 'team'))
);
CREATE POLICY "Students can view own activities" ON public.student_activities FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Authenticated can insert activities" ON public.student_activities FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- STUDENT NOTES
CREATE POLICY "Admin/Coach can manage notes" ON public.student_notes FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach', 'team'))
);

-- STUDENT TASKS
CREATE POLICY "Admin/Coach can manage tasks" ON public.student_tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach', 'team'))
);
CREATE POLICY "Students can view own tasks" ON public.student_tasks FOR SELECT USING (student_id = auth.uid());
CREATE POLICY "Students can update own tasks" ON public.student_tasks FOR UPDATE USING (student_id = auth.uid());

-- CHANNELS
CREATE POLICY "Members can view their channels" ON public.channels FOR SELECT USING (
  type = 'public' OR
  EXISTS (SELECT 1 FROM public.channel_members WHERE channel_id = channels.id AND profile_id = auth.uid())
);
CREATE POLICY "Admin/Coach can manage channels" ON public.channels FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);
CREATE POLICY "Authenticated can create channels" ON public.channels FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- CHANNEL MEMBERS
CREATE POLICY "Members can view channel members" ON public.channel_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.channel_members cm WHERE cm.channel_id = channel_members.channel_id AND cm.profile_id = auth.uid())
);
CREATE POLICY "Admin/Coach can manage channel members" ON public.channel_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);
CREATE POLICY "Users can join public channels" ON public.channel_members FOR INSERT WITH CHECK (
  profile_id = auth.uid() AND
  EXISTS (SELECT 1 FROM public.channels WHERE id = channel_id AND type = 'public')
);

-- MESSAGES
CREATE POLICY "Members can view messages in their channels" ON public.messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.channel_members WHERE channel_id = messages.channel_id AND profile_id = auth.uid())
);
CREATE POLICY "Members can send messages" ON public.messages FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (SELECT 1 FROM public.channel_members WHERE channel_id = messages.channel_id AND profile_id = auth.uid())
);
CREATE POLICY "Users can update own messages" ON public.messages FOR UPDATE USING (sender_id = auth.uid());
CREATE POLICY "Admin/Coach can delete messages" ON public.messages FOR DELETE USING (
  sender_id = auth.uid() OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);

-- MESSAGE REACTIONS
CREATE POLICY "Members can view reactions" ON public.message_reactions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.channel_members cm ON cm.channel_id = m.channel_id
    WHERE m.id = message_reactions.message_id AND cm.profile_id = auth.uid()
  )
);
CREATE POLICY "Members can react" ON public.message_reactions FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Users can remove own reactions" ON public.message_reactions FOR DELETE USING (profile_id = auth.uid());

-- MESSAGE ATTACHMENTS
CREATE POLICY "Members can view attachments" ON public.message_attachments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.messages m
    JOIN public.channel_members cm ON cm.channel_id = m.channel_id
    WHERE m.id = message_attachments.message_id AND cm.profile_id = auth.uid()
  )
);
CREATE POLICY "Members can add attachments" ON public.message_attachments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- COURSES
CREATE POLICY "Published courses visible to all" ON public.courses FOR SELECT USING (
  status = 'published' OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);
CREATE POLICY "Admin/Coach can manage courses" ON public.courses FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);

-- MODULES
CREATE POLICY "Modules visible with course" ON public.modules FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.courses c WHERE c.id = modules.course_id AND (
      c.status = 'published' OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    )
  )
);
CREATE POLICY "Admin/Coach can manage modules" ON public.modules FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);

-- LESSONS
CREATE POLICY "Lessons visible with module" ON public.lessons FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.modules m
    JOIN public.courses c ON c.id = m.course_id
    WHERE m.id = lessons.module_id AND (
      c.status = 'published' OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    )
  )
);
CREATE POLICY "Admin/Coach can manage lessons" ON public.lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);

-- LESSON PROGRESS
CREATE POLICY "Students can manage own progress" ON public.lesson_progress FOR ALL USING (student_id = auth.uid());
CREATE POLICY "Admin/Coach can view all progress" ON public.lesson_progress FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach', 'team'))
);

-- LESSON COMMENTS
CREATE POLICY "Authenticated can view comments" ON public.lesson_comments FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated can add comments" ON public.lesson_comments FOR INSERT WITH CHECK (author_id = auth.uid());
CREATE POLICY "Users can delete own comments" ON public.lesson_comments FOR DELETE USING (author_id = auth.uid());

-- FORMS
CREATE POLICY "Active forms visible to targets" ON public.forms FOR SELECT USING (
  status = 'active' OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);
CREATE POLICY "Admin/Coach can manage forms" ON public.forms FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);

-- FORM FIELDS
CREATE POLICY "Fields visible with form" ON public.form_fields FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.forms f WHERE f.id = form_fields.form_id AND (
      f.status = 'active' OR
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    )
  )
);
CREATE POLICY "Admin/Coach can manage fields" ON public.form_fields FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);

-- FORM SUBMISSIONS
CREATE POLICY "Students can submit forms" ON public.form_submissions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Students can view own submissions" ON public.form_submissions FOR SELECT USING (respondent_id = auth.uid());
CREATE POLICY "Admin/Coach can view all submissions" ON public.form_submissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);

-- NOTIFICATIONS
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (recipient_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (recipient_id = auth.uid());
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- AI CONVERSATIONS
CREATE POLICY "Users can manage own conversations" ON public.ai_conversations FOR ALL USING (user_id = auth.uid());

-- AI MESSAGES
CREATE POLICY "Users can view messages in own conversations" ON public.ai_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.ai_conversations WHERE id = ai_messages.conversation_id AND user_id = auth.uid())
);
CREATE POLICY "Users can add messages to own conversations" ON public.ai_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.ai_conversations WHERE id = ai_messages.conversation_id AND user_id = auth.uid())
);

-- AI INSIGHTS
CREATE POLICY "Admin/Coach can view insights" ON public.ai_insights FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);
CREATE POLICY "Admin/Coach can manage insights" ON public.ai_insights FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);

-- ═══════════════════════════════════════
-- STORAGE BUCKETS
-- ═══════════════════════════════════════

INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('course-assets', 'course-assets', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('message-attachments', 'message-attachments', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('form-uploads', 'form-uploads', false);

-- Storage policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload avatars" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid() IS NOT NULL);

CREATE POLICY "Course assets are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'course-assets');
CREATE POLICY "Admin/Coach can upload course assets" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'course-assets' AND
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);

CREATE POLICY "Authenticated can view message attachments" ON storage.objects FOR SELECT USING (
  bucket_id = 'message-attachments' AND auth.uid() IS NOT NULL
);
CREATE POLICY "Authenticated can upload message attachments" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'message-attachments' AND auth.uid() IS NOT NULL
);

CREATE POLICY "Authenticated can view form uploads" ON storage.objects FOR SELECT USING (
  bucket_id = 'form-uploads' AND auth.uid() IS NOT NULL
);
CREATE POLICY "Authenticated can upload form files" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'form-uploads' AND auth.uid() IS NOT NULL
);
