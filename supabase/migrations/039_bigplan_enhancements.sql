-- ============================================================
-- BigPlan v2 — Missing tables and enhancements
-- ============================================================

-- 1. Student flag change history (BigPlan 3.2)
CREATE TABLE IF NOT EXISTS student_flag_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES student_details(id) ON DELETE CASCADE,
  old_flag text,
  new_flag text NOT NULL,
  reason text,
  changed_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE student_flag_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage flag history" ON student_flag_history
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );

-- 2. Saved segments / filters (BigPlan 3.6)
CREATE TABLE IF NOT EXISTS saved_segments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  filters jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_shared boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE saved_segments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own segments" ON saved_segments
  FOR ALL USING (auth.uid() = user_id OR is_shared = true);

-- 3. Lesson action checklists (BigPlan 4.6)
CREATE TABLE IF NOT EXISTS lesson_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id uuid NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title text NOT NULL,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lesson_action_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id uuid NOT NULL REFERENCES lesson_actions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(action_id, user_id)
);

ALTER TABLE lesson_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_action_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lesson actions" ON lesson_actions FOR SELECT USING (true);
CREATE POLICY "Staff can manage lesson actions" ON lesson_actions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );
CREATE POLICY "Users manage own action completions" ON lesson_action_completions
  FOR ALL USING (auth.uid() = user_id);

-- 4. Drip content rules (BigPlan 4.4)
ALTER TABLE courses ADD COLUMN IF NOT EXISTS drip_type text DEFAULT 'none'
  CHECK (drip_type IN ('none', 'time_based', 'level_based', 'completion_based', 'manual'));
ALTER TABLE courses ADD COLUMN IF NOT EXISTS drip_delay_days int DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS drip_min_level int DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS access_type text DEFAULT 'all'
  CHECK (access_type IN ('all', 'level', 'group', 'time', 'manual'));

-- 5. Message pins and bookmarks (BigPlan 5.5)
CREATE TABLE IF NOT EXISTS message_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, message_id)
);

ALTER TABLE message_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own bookmarks" ON message_bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- 6. User status (BigPlan 5.11)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status_text text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status_emoji text;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status_expires_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dnd_enabled boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dnd_start text; -- e.g. "20:00"
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS dnd_end text;   -- e.g. "08:00"

-- 7. Community post categories (BigPlan 11.1)
ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS category text DEFAULT 'general'
  CHECK (category IN ('general', 'wins', 'questions', 'resources', 'off_topic'));

-- 8. Win post template fields (BigPlan 11.2)
ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS win_data jsonb;
-- win_data: { result: string, context: string, actions: string, lesson: string }

-- 9. Commission tracking (BigPlan 10.6)
CREATE TABLE IF NOT EXISTS commissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id uuid REFERENCES contracts(id) ON DELETE SET NULL,
  contractor_id uuid NOT NULL REFERENCES auth.users(id),
  contractor_role text NOT NULL, -- 'setter', 'closer', 'coach'
  percentage numeric(5,2) NOT NULL,
  amount numeric(12,2) NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  paid_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage commissions" ON commissions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
CREATE POLICY "Contractors view own commissions" ON commissions
  FOR SELECT USING (auth.uid() = contractor_id);

-- 10. Contract templates (BigPlan 10.1)
CREATE TABLE IF NOT EXISTS contract_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL, -- HTML/Markdown with {{variables}}
  variables jsonb DEFAULT '[]'::jsonb,
  category text DEFAULT 'standard',
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage contract templates" ON contract_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'setter', 'closer'))
  );

-- 11. Upsell tracking (BigPlan 20.1)
CREATE TABLE IF NOT EXISTS upsell_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES student_details(id) ON DELETE CASCADE,
  trigger_type text NOT NULL, -- 'revenue_milestone', 'completion', 'manual'
  trigger_value text,
  offer_name text NOT NULL,
  status text DEFAULT 'detected' CHECK (status IN ('detected', 'proposed', 'accepted', 'declined')),
  proposed_at timestamptz,
  resolved_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE upsell_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage upsells" ON upsell_opportunities
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );

-- 12. AlexIA knowledge base (BigPlan 13.2)
CREATE TABLE IF NOT EXISTS knowledge_base_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  category text DEFAULT 'general',
  source_type text DEFAULT 'manual', -- 'manual', 'faq', 'transcript', 'document', 'url'
  source_url text,
  tags text[] DEFAULT '{}',
  question_count int DEFAULT 0,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE knowledge_base_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff can manage KB" ON knowledge_base_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );
CREATE POLICY "Clients can read KB" ON knowledge_base_entries
  FOR SELECT USING (true);

-- 13. AI question tracking (BigPlan 13.3)
CREATE TABLE IF NOT EXISTS ai_question_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  question text NOT NULL,
  answer text,
  was_escalated boolean DEFAULT false,
  was_helpful boolean, -- null = not rated, true = 👍, false = 👎
  kb_entry_id uuid REFERENCES knowledge_base_entries(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_question_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own questions" ON ai_question_log
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Staff can view all questions" ON ai_question_log
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_flag_history_student ON student_flag_history(student_id);
CREATE INDEX IF NOT EXISTS idx_lesson_actions_lesson ON lesson_actions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_message_bookmarks_user ON message_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_commissions_contractor ON commissions(contractor_id);
CREATE INDEX IF NOT EXISTS idx_kb_entries_category ON knowledge_base_entries(category);
CREATE INDEX IF NOT EXISTS idx_ai_questions_user ON ai_question_log(user_id);
CREATE INDEX IF NOT EXISTS idx_upsell_student ON upsell_opportunities(student_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_category ON feed_posts(category);
