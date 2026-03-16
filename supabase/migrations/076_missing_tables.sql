-- Migration 076: Create missing tables identified during QA testing
-- Tables that were referenced in frontend code but didn't exist in DB

-- user_preferences (notification settings)
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  notification_messages BOOLEAN DEFAULT true,
  notification_calls BOOLEAN DEFAULT true,
  notification_formations BOOLEAN DEFAULT true,
  notification_community BOOLEAN DEFAULT true,
  notification_coaching BOOLEAN DEFAULT true,
  notification_system BOOLEAN DEFAULT true,
  notification_badges BOOLEAN DEFAULT true,
  notification_challenges BOOLEAN DEFAULT true,
  notification_digest BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS user_prefs_own ON user_preferences FOR ALL USING (user_id = auth.uid());

-- daily_activity (streak tracking)
CREATE TABLE IF NOT EXISTS daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  activity_type TEXT NOT NULL,
  count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, activity_date, activity_type)
);
ALTER TABLE daily_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS daily_activity_own ON daily_activity FOR ALL USING (user_id = auth.uid());

-- rituals (habit tracking)
CREATE TABLE IF NOT EXISTS rituals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'daily',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE rituals ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS rituals_own ON rituals FOR ALL USING (user_id = auth.uid());

-- push_subscriptions (Web Push notifications)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, endpoint)
);
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS push_subs_own ON push_subscriptions FOR ALL USING (user_id = auth.uid());

-- message_templates (quick reply templates)
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  created_by UUID REFERENCES auth.users(id),
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS msg_templates_read ON message_templates FOR SELECT USING (created_by = auth.uid() OR is_shared = true);
CREATE POLICY IF NOT EXISTS msg_templates_write ON message_templates FOR ALL USING (created_by = auth.uid());

-- course_prerequisites (formation ordering)
CREATE TABLE IF NOT EXISTS course_prerequisites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL,
  prerequisite_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(course_id, prerequisite_id)
);
ALTER TABLE course_prerequisites ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS prereqs_read ON course_prerequisites FOR SELECT USING (true);

-- coach_assignments (CSM attribution)
CREATE TABLE IF NOT EXISTS coach_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id)
);
ALTER TABLE coach_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS coach_assign_read ON coach_assignments FOR SELECT USING (
  client_id = auth.uid() OR coach_id = auth.uid()
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY IF NOT EXISTS coach_assign_admin ON coach_assignments FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
