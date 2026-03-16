-- ═══════════════════════════════════════════════════════════════════════════════
-- 083 — Consolidated migration: create ALL missing tables
-- Off-Market — idempotent (CREATE TABLE IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)
-- ═══════════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════════
-- 1. user_roles — role assignments (referenced by many RLS policies)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'coach', 'setter', 'closer', 'client')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'user_roles_select_own') THEN
    CREATE POLICY user_roles_select_own ON user_roles FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_roles' AND policyname = 'user_roles_admin_all') THEN
    CREATE POLICY user_roles_admin_all ON user_roles FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 2. user_sessions — track active sessions per user
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  device_info TEXT,
  ip_address TEXT,
  last_active_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_sessions' AND policyname = 'user_sessions_select_own') THEN
    CREATE POLICY user_sessions_select_own ON user_sessions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_sessions' AND policyname = 'user_sessions_insert_own') THEN
    CREATE POLICY user_sessions_insert_own ON user_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_sessions' AND policyname = 'user_sessions_update_own') THEN
    CREATE POLICY user_sessions_update_own ON user_sessions FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_sessions' AND policyname = 'user_sessions_delete_own') THEN
    CREATE POLICY user_sessions_delete_own ON user_sessions FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = true;


-- ═══════════════════════════════════════════════════════════════════════════════
-- 3. announcements + announcement_dismissals
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'urgent', 'update')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  target_roles TEXT[] DEFAULT NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS announcement_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(announcement_id, user_id)
);

ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_dismissals ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'announcements' AND policyname = 'announcements_select') THEN
    CREATE POLICY announcements_select ON announcements FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'announcements' AND policyname = 'announcements_admin_manage') THEN
    CREATE POLICY announcements_admin_manage ON announcements FOR ALL TO authenticated USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'announcement_dismissals' AND policyname = 'dismissals_own') THEN
    CREATE POLICY dismissals_own ON announcement_dismissals FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_announcement_dismissals_user ON announcement_dismissals(user_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 4. social_content — content planning board (DnD kanban)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS social_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  caption TEXT,
  media_urls TEXT[] DEFAULT '{}',
  platform TEXT NOT NULL DEFAULT 'instagram' CHECK (platform IN ('instagram', 'linkedin', 'tiktok')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE social_content ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'social_content' AND policyname = 'social_content_select') THEN
    CREATE POLICY social_content_select ON social_content FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'social_content' AND policyname = 'social_content_manage') THEN
    CREATE POLICY social_content_manage ON social_content FOR ALL TO authenticated USING (
      created_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_social_content_status ON social_content(status);
CREATE INDEX IF NOT EXISTS idx_social_content_created_by ON social_content(created_by);
CREATE INDEX IF NOT EXISTS idx_social_content_platform ON social_content(platform);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 5. setter_activities — daily setter activity tracking
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS setter_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  messages_sent INTEGER NOT NULL DEFAULT 0,
  leads_generated INTEGER NOT NULL DEFAULT 0,
  calls_booked INTEGER NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE setter_activities ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'setter_activities' AND policyname = 'setter_activities_own') THEN
    CREATE POLICY setter_activities_own ON setter_activities FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'setter_activities' AND policyname = 'setter_activities_staff_read') THEN
    CREATE POLICY setter_activities_staff_read ON setter_activities FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_setter_activities_user_date ON setter_activities(user_id, date DESC);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 6. resources — shared resource library
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visibility TEXT NOT NULL DEFAULT 'all' CHECK (visibility IN ('all', 'staff', 'clients')),
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  download_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'resources' AND policyname = 'resources_staff_all') THEN
    CREATE POLICY resources_staff_all ON resources FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'resources' AND policyname = 'resources_clients_read') THEN
    CREATE POLICY resources_clients_read ON resources FOR SELECT USING (
      visibility IN ('all', 'clients') AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid())
    );
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- 7. user_follows — follow/unfollow system
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK(follower_id != following_id)
);

ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_follows' AND policyname = 'user_follows_select') THEN
    CREATE POLICY user_follows_select ON user_follows FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_follows' AND policyname = 'user_follows_insert') THEN
    CREATE POLICY user_follows_insert ON user_follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_follows' AND policyname = 'user_follows_delete') THEN
    CREATE POLICY user_follows_delete ON user_follows FOR DELETE USING (auth.uid() = follower_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 8. feed_reports — content moderation
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS feed_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES feed_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES feed_comments(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'misinformation', 'other')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  action_taken TEXT CHECK (action_taken IN ('warning', 'content_removed', 'user_suspended', NULL)),
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT report_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL)
    OR (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

ALTER TABLE feed_reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feed_reports' AND policyname = 'feed_reports_insert') THEN
    CREATE POLICY feed_reports_insert ON feed_reports FOR INSERT TO authenticated WITH CHECK (reporter_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feed_reports' AND policyname = 'feed_reports_own_select') THEN
    CREATE POLICY feed_reports_own_select ON feed_reports FOR SELECT TO authenticated USING (reporter_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feed_reports' AND policyname = 'feed_reports_staff_select') THEN
    CREATE POLICY feed_reports_staff_select ON feed_reports FOR SELECT TO authenticated USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'feed_reports' AND policyname = 'feed_reports_staff_update') THEN
    CREATE POLICY feed_reports_staff_update ON feed_reports FOR UPDATE TO authenticated USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_feed_reports_status ON feed_reports(status);
CREATE INDEX IF NOT EXISTS idx_feed_reports_reporter ON feed_reports(reporter_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 9. workbooks + workbook_submissions
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS workbooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  course_id UUID REFERENCES courses(id) ON DELETE SET NULL,
  module_type TEXT CHECK (module_type IN (
    'marche', 'offre', 'communication', 'acquisition', 'conversion', 'diagnostic', 'general'
  )),
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS workbook_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workbook_id UUID NOT NULL REFERENCES workbooks(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  call_id UUID REFERENCES call_calendar(id) ON DELETE SET NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed')),
  reviewer_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE workbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workbook_submissions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workbooks' AND policyname = 'workbooks_read') THEN
    CREATE POLICY workbooks_read ON workbooks FOR SELECT TO authenticated USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workbooks' AND policyname = 'workbooks_manage') THEN
    CREATE POLICY workbooks_manage ON workbooks FOR ALL TO authenticated USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    ) WITH CHECK (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workbook_submissions' AND policyname = 'wb_submissions_own') THEN
    CREATE POLICY wb_submissions_own ON workbook_submissions FOR ALL TO authenticated
      USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workbook_submissions' AND policyname = 'wb_submissions_staff') THEN
    CREATE POLICY wb_submissions_staff ON workbook_submissions FOR ALL TO authenticated USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    ) WITH CHECK (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_workbooks_course ON workbooks(course_id) WHERE course_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_workbooks_module_type ON workbooks(module_type);
CREATE INDEX IF NOT EXISTS idx_wb_submissions_workbook ON workbook_submissions(workbook_id);
CREATE INDEX IF NOT EXISTS idx_wb_submissions_client ON workbook_submissions(client_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 10. rewards + reward_redemptions
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cost_xp INTEGER NOT NULL CHECK (cost_xp > 0),
  type TEXT NOT NULL CHECK (type IN ('session_bonus', 'resource_unlock', 'badge_exclusive', 'custom')),
  stock INTEGER,
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE CASCADE,
  xp_spent INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled')),
  redeemed_at TIMESTAMPTZ DEFAULT now(),
  fulfilled_at TIMESTAMPTZ,
  fulfilled_by UUID REFERENCES profiles(id) ON DELETE SET NULL
);

ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rewards' AND policyname = 'rewards_select_active') THEN
    CREATE POLICY rewards_select_active ON rewards FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'rewards' AND policyname = 'rewards_staff_manage') THEN
    CREATE POLICY rewards_staff_manage ON rewards FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reward_redemptions' AND policyname = 'redemptions_own_select') THEN
    CREATE POLICY redemptions_own_select ON reward_redemptions FOR SELECT USING (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reward_redemptions' AND policyname = 'redemptions_own_insert') THEN
    CREATE POLICY redemptions_own_insert ON reward_redemptions FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reward_redemptions' AND policyname = 'redemptions_staff_all') THEN
    CREATE POLICY redemptions_staff_all ON reward_redemptions FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_rewards_active ON rewards(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user_id ON reward_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_reward_id ON reward_redemptions(reward_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 11. faq_entries — knowledge base
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS faq_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question TEXT NOT NULL,
  answer TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'general',
  occurrence_count INTEGER NOT NULL DEFAULT 1,
  auto_answer_enabled BOOLEAN NOT NULL DEFAULT false,
  source_message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_asked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE faq_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'faq_entries' AND policyname = 'faq_entries_staff_all') THEN
    CREATE POLICY faq_entries_staff_all ON faq_entries FOR ALL TO authenticated USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    ) WITH CHECK (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'faq_entries' AND policyname = 'faq_entries_client_read') THEN
    CREATE POLICY faq_entries_client_read ON faq_entries FOR SELECT TO authenticated USING (auto_answer_enabled = true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_faq_entries_category ON faq_entries(category);
CREATE INDEX IF NOT EXISTS idx_faq_entries_occurrence ON faq_entries(occurrence_count DESC);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 12. client_roadmaps + roadmap_milestones + client_flags
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS client_roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  generated_from TEXT NOT NULL DEFAULT 'manual'
    CHECK (generated_from IN ('kickoff_call', 'manual', 'ai_suggestion')),
  source_call_id UUID REFERENCES call_calendar(id) ON DELETE SET NULL,
  milestones_snapshot JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS roadmap_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES client_roadmaps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  validation_criteria TEXT[] NOT NULL DEFAULT '{}',
  order_index INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS client_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  flag TEXT NOT NULL DEFAULT 'green' CHECK (flag IN ('green', 'orange', 'red')),
  reason TEXT,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE client_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_flags ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_roadmaps' AND policyname = 'staff_roadmaps_all') THEN
    CREATE POLICY staff_roadmaps_all ON client_roadmaps FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_roadmaps' AND policyname = 'client_roadmaps_read') THEN
    CREATE POLICY client_roadmaps_read ON client_roadmaps FOR SELECT USING (client_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'roadmap_milestones' AND policyname = 'staff_milestones_all') THEN
    CREATE POLICY staff_milestones_all ON roadmap_milestones FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'roadmap_milestones' AND policyname = 'client_milestones_read') THEN
    CREATE POLICY client_milestones_read ON roadmap_milestones FOR SELECT USING (
      EXISTS (SELECT 1 FROM client_roadmaps WHERE id = roadmap_milestones.roadmap_id AND client_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_flags' AND policyname = 'staff_flags_all') THEN
    CREATE POLICY staff_flags_all ON client_flags FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'client_flags' AND policyname = 'client_flags_read') THEN
    CREATE POLICY client_flags_read ON client_flags FOR SELECT USING (client_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_client_roadmaps_client ON client_roadmaps(client_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_milestones_roadmap ON roadmap_milestones(roadmap_id);
CREATE INDEX IF NOT EXISTS idx_client_flags_flag ON client_flags(flag);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 13. upsell_rules + upsell_triggers
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS upsell_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('revenue_threshold', 'milestone_completion', 'time_based')),
  trigger_config JSONB NOT NULL DEFAULT '{}',
  offer_title TEXT NOT NULL,
  offer_description TEXT,
  offer_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS upsell_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES upsell_rules(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  triggered_at TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'notified', 'converted', 'dismissed')),
  notified_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE upsell_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE upsell_triggers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'upsell_rules' AND policyname = 'upsell_rules_staff') THEN
    CREATE POLICY upsell_rules_staff ON upsell_rules FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'upsell_triggers' AND policyname = 'upsell_triggers_staff') THEN
    CREATE POLICY upsell_triggers_staff ON upsell_triggers FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'upsell_triggers' AND policyname = 'upsell_triggers_client_read') THEN
    CREATE POLICY upsell_triggers_client_read ON upsell_triggers FOR SELECT USING (client_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_upsell_rules_active ON upsell_rules(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_upsell_triggers_client ON upsell_triggers(client_id);
CREATE INDEX IF NOT EXISTS idx_upsell_triggers_status ON upsell_triggers(status);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 14. availability_slots + availability_overrides
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (start_time < end_time)
);

CREATE TABLE IF NOT EXISTS availability_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  override_date DATE NOT NULL,
  is_blocked BOOLEAN DEFAULT true,
  start_time TIME,
  end_time TIME,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(coach_id, override_date)
);

ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_overrides ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'availability_slots' AND policyname = 'avail_slots_select') THEN
    CREATE POLICY avail_slots_select ON availability_slots FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'availability_slots' AND policyname = 'avail_slots_manage') THEN
    CREATE POLICY avail_slots_manage ON availability_slots FOR ALL USING (
      coach_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'availability_overrides' AND policyname = 'avail_overrides_select') THEN
    CREATE POLICY avail_overrides_select ON availability_overrides FOR SELECT USING (auth.uid() IS NOT NULL);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'availability_overrides' AND policyname = 'avail_overrides_manage') THEN
    CREATE POLICY avail_overrides_manage ON availability_overrides FOR ALL USING (
      coach_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_availability_slots_coach ON availability_slots(coach_id);
CREATE INDEX IF NOT EXISTS idx_availability_overrides_coach_date ON availability_overrides(coach_id, override_date);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 15. quiz_attempts
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '[]',
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ DEFAULT now(),
  time_spent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quiz_attempts' AND policyname = 'quiz_attempts_own') THEN
    CREATE POLICY quiz_attempts_own ON quiz_attempts FOR ALL USING (student_id = auth.uid()) WITH CHECK (student_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'quiz_attempts' AND policyname = 'quiz_attempts_staff_read') THEN
    CREATE POLICY quiz_attempts_staff_read ON quiz_attempts FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_lesson ON quiz_attempts(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student ON quiz_attempts(student_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 16. kpi_goals
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS kpi_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  metric TEXT NOT NULL,
  target_value NUMERIC NOT NULL DEFAULT 0,
  current_value NUMERIC NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT '',
  period TEXT NOT NULL DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE kpi_goals ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'kpi_goals' AND policyname = 'kpi_goals_staff') THEN
    CREATE POLICY kpi_goals_staff ON kpi_goals FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- 17. calendar_events — custom shared calendar events
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ,
  event_type TEXT NOT NULL DEFAULT 'event',
  color TEXT NOT NULL DEFAULT '#8B5CF6',
  attendees UUID[] DEFAULT '{}',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_events' AND policyname = 'calendar_events_select') THEN
    CREATE POLICY calendar_events_select ON calendar_events FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_events' AND policyname = 'calendar_events_insert') THEN
    CREATE POLICY calendar_events_insert ON calendar_events FOR INSERT TO authenticated WITH CHECK (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_events' AND policyname = 'calendar_events_update') THEN
    CREATE POLICY calendar_events_update ON calendar_events FOR UPDATE TO authenticated USING (
      created_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'calendar_events' AND policyname = 'calendar_events_delete') THEN
    CREATE POLICY calendar_events_delete ON calendar_events FOR DELETE TO authenticated USING (
      created_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_calendar_events_start ON calendar_events(start_at);
CREATE INDEX IF NOT EXISTS idx_calendar_events_created_by ON calendar_events(created_by);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 18. communities + community_members — sub-communities
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT,
  color TEXT DEFAULT '#ef4444',
  is_private BOOLEAN DEFAULT false,
  max_members INTEGER,
  created_by UUID REFERENCES auth.users(id),
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(community_id, user_id)
);

ALTER TABLE communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'communities' AND policyname = 'communities_select') THEN
    CREATE POLICY communities_select ON communities FOR SELECT USING (
      is_private = false OR EXISTS (SELECT 1 FROM community_members WHERE community_id = id AND user_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'communities' AND policyname = 'communities_insert') THEN
    CREATE POLICY communities_insert ON communities FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_members' AND policyname = 'community_members_select') THEN
    CREATE POLICY community_members_select ON community_members FOR SELECT USING (
      user_id = auth.uid() OR EXISTS (SELECT 1 FROM community_members cm WHERE cm.community_id = community_id AND cm.user_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_members' AND policyname = 'community_members_join') THEN
    CREATE POLICY community_members_join ON community_members FOR INSERT WITH CHECK (
      auth.uid() = user_id AND EXISTS (SELECT 1 FROM communities WHERE id = community_id AND is_private = false)
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'community_members' AND policyname = 'community_members_leave') THEN
    CREATE POLICY community_members_leave ON community_members FOR DELETE USING (user_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_communities_slug ON communities(slug);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_community ON community_members(community_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 19. competitions + competition_participants
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS competitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'team_vs_team' CHECK (type IN ('team_vs_team', 'free_for_all')),
  metric TEXT NOT NULL DEFAULT 'xp' CHECK (metric IN ('xp', 'calls', 'clients', 'revenue')),
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  prize_description TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS competition_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL DEFAULT 0,
  rank INT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (team_id IS NOT NULL OR user_id IS NOT NULL)
);

ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'competitions' AND policyname = 'competitions_select') THEN
    CREATE POLICY competitions_select ON competitions FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'competitions' AND policyname = 'competitions_admin_manage') THEN
    CREATE POLICY competitions_admin_manage ON competitions FOR ALL TO authenticated USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'competition_participants' AND policyname = 'comp_participants_select') THEN
    CREATE POLICY comp_participants_select ON competition_participants FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'competition_participants' AND policyname = 'comp_participants_insert') THEN
    CREATE POLICY comp_participants_insert ON competition_participants FOR INSERT TO authenticated WITH CHECK (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR auth.uid() = user_id
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_competitions_status ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_comp_participants_comp ON competition_participants(competition_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 20. teams + team_members
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_emoji TEXT DEFAULT '🔥',
  color TEXT DEFAULT '#DC2626',
  captain_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teams' AND policyname = 'teams_select') THEN
    CREATE POLICY teams_select ON teams FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teams' AND policyname = 'teams_insert') THEN
    CREATE POLICY teams_insert ON teams FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'teams' AND policyname = 'teams_update') THEN
    CREATE POLICY teams_update ON teams FOR UPDATE TO authenticated USING (
      auth.uid() = captain_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'team_members_select') THEN
    CREATE POLICY team_members_select ON team_members FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'team_members_insert') THEN
    CREATE POLICY team_members_insert ON team_members FOR INSERT TO authenticated WITH CHECK (
      auth.uid() = user_id OR EXISTS (SELECT 1 FROM teams WHERE id = team_id AND captain_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'team_members' AND policyname = 'team_members_delete') THEN
    CREATE POLICY team_members_delete ON team_members FOR DELETE TO authenticated USING (
      auth.uid() = user_id OR EXISTS (SELECT 1 FROM teams WHERE id = team_id AND captain_id = auth.uid())
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON team_members(user_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 21. video_responses — async video messages
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS video_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  related_type TEXT NOT NULL CHECK (related_type IN ('call', 'coaching_session', 'question')),
  related_id UUID,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INT,
  message TEXT,
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE video_responses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_responses' AND policyname = 'video_responses_select') THEN
    CREATE POLICY video_responses_select ON video_responses FOR SELECT USING (
      auth.uid() = sender_id OR auth.uid() = recipient_id
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_responses' AND policyname = 'video_responses_insert') THEN
    CREATE POLICY video_responses_insert ON video_responses FOR INSERT WITH CHECK (auth.uid() = sender_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_responses' AND policyname = 'video_responses_update') THEN
    CREATE POLICY video_responses_update ON video_responses FOR UPDATE USING (
      auth.uid() = sender_id OR auth.uid() = recipient_id
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'video_responses' AND policyname = 'video_responses_delete') THEN
    CREATE POLICY video_responses_delete ON video_responses FOR DELETE USING (auth.uid() = sender_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_video_responses_sender ON video_responses(sender_id);
CREATE INDEX IF NOT EXISTS idx_video_responses_recipient ON video_responses(recipient_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 22. replays — group call replay library
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS replays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_minutes INT,
  coach_id UUID REFERENCES auth.users(id),
  tags TEXT[] DEFAULT '{}',
  category TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE replays ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'replays' AND policyname = 'replays_select') THEN
    CREATE POLICY replays_select ON replays FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'replays' AND policyname = 'replays_staff_manage') THEN
    CREATE POLICY replays_staff_manage ON replays FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_replays_category ON replays(category);
CREATE INDEX IF NOT EXISTS idx_replays_coach_id ON replays(coach_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 23. custom_roles — admin-defined roles with module permissions
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS custom_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,
  color TEXT DEFAULT '#6B7280',
  icon TEXT DEFAULT 'Shield',
  is_system BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_roles' AND policyname = 'custom_roles_select') THEN
    CREATE POLICY custom_roles_select ON custom_roles FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_roles' AND policyname = 'custom_roles_admin_insert') THEN
    CREATE POLICY custom_roles_admin_insert ON custom_roles FOR INSERT TO authenticated WITH CHECK (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_roles' AND policyname = 'custom_roles_admin_update') THEN
    CREATE POLICY custom_roles_admin_update ON custom_roles FOR UPDATE TO authenticated USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_roles' AND policyname = 'custom_roles_admin_delete') THEN
    CREATE POLICY custom_roles_admin_delete ON custom_roles FOR DELETE TO authenticated USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') AND is_system = false
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_custom_roles_active ON custom_roles(is_active) WHERE is_active = true;


-- ═══════════════════════════════════════════════════════════════════════════════
-- 24. sms_reminders
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sms_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  related_type TEXT CHECK (related_type IN ('call', 'coaching', 'payment')),
  related_id UUID,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE sms_reminders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sms_reminders' AND policyname = 'sms_reminders_select_own') THEN
    CREATE POLICY sms_reminders_select_own ON sms_reminders FOR SELECT USING (
      auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sms_reminders' AND policyname = 'sms_reminders_insert_own') THEN
    CREATE POLICY sms_reminders_insert_own ON sms_reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'sms_reminders' AND policyname = 'sms_reminders_update_own') THEN
    CREATE POLICY sms_reminders_update_own ON sms_reminders FOR UPDATE USING (
      auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_sms_reminders_status_scheduled ON sms_reminders(status, scheduled_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_sms_reminders_user_id ON sms_reminders(user_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 25. onboarding_offers
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS onboarding_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  modules TEXT[] NOT NULL DEFAULT '{}',
  welcome_message TEXT,
  recommended_actions JSONB DEFAULT '[]'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE onboarding_offers ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'onboarding_offers' AND policyname = 'onboarding_offers_read') THEN
    CREATE POLICY onboarding_offers_read ON onboarding_offers FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'onboarding_offers' AND policyname = 'onboarding_offers_admin_manage') THEN
    CREATE POLICY onboarding_offers_admin_manage ON onboarding_offers FOR ALL TO authenticated USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_onboarding_offers_slug ON onboarding_offers(slug);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 26. onboarding_steps — granular step tracking
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS onboarding_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  data JSONB DEFAULT '{}',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (profile_id, step_key)
);

ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'onboarding_steps' AND policyname = 'onboarding_steps_own') THEN
    CREATE POLICY onboarding_steps_own ON onboarding_steps FOR ALL USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'onboarding_steps' AND policyname = 'onboarding_steps_staff_read') THEN
    CREATE POLICY onboarding_steps_staff_read ON onboarding_steps FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_onboarding_steps_profile ON onboarding_steps(profile_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 27. onboarding_checklist_items — per-user checklist items
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS onboarding_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  label TEXT NOT NULL,
  href TEXT,
  icon TEXT,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, key)
);

ALTER TABLE onboarding_checklist_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'onboarding_checklist_items' AND policyname = 'checklist_items_own') THEN
    CREATE POLICY checklist_items_own ON onboarding_checklist_items FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'onboarding_checklist_items' AND policyname = 'checklist_items_staff_read') THEN
    CREATE POLICY checklist_items_staff_read ON onboarding_checklist_items FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_onboarding_checklist_user ON onboarding_checklist_items(user_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 28. coaching_sessions — distinct from sessions table, used by cron
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS coaching_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Session de coaching',
  session_type TEXT NOT NULL DEFAULT 'individual' CHECK (session_type IN ('individual', 'group', 'emergency')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  action_items JSONB DEFAULT '[]',
  replay_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coaching_sessions' AND policyname = 'coaching_sessions_staff') THEN
    CREATE POLICY coaching_sessions_staff ON coaching_sessions FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coaching_sessions' AND policyname = 'coaching_sessions_client_read') THEN
    CREATE POLICY coaching_sessions_client_read ON coaching_sessions FOR SELECT USING (client_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_coaching_sessions_client ON coaching_sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_coach ON coaching_sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_scheduled ON coaching_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_coaching_sessions_status ON coaching_sessions(status);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 29. coaching_milestones — milestone tracking for coaching goals
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS coaching_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES coaching_goals(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC(10,2),
  current_value NUMERIC(10,2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE coaching_milestones ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coaching_milestones' AND policyname = 'coaching_milestones_staff') THEN
    CREATE POLICY coaching_milestones_staff ON coaching_milestones FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coaching_milestones' AND policyname = 'coaching_milestones_client_read') THEN
    CREATE POLICY coaching_milestones_client_read ON coaching_milestones FOR SELECT USING (
      EXISTS (SELECT 1 FROM coaching_goals WHERE id = coaching_milestones.goal_id AND client_id = auth.uid())
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_coaching_milestones_goal ON coaching_milestones(goal_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 30. checkins — daily/periodic check-ins (alias for weekly_checkins pattern)
-- ═══════════════════════════════════════════════════════════════════════════════

-- Note: the main check-in table is "weekly_checkins" from 008_coaching.
-- "checkins" is referenced separately in some newer hooks. Create it as an alias.
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood INTEGER CHECK (mood BETWEEN 1 AND 5),
  energy INTEGER CHECK (energy BETWEEN 1 AND 5),
  revenue NUMERIC(10,2) DEFAULT 0,
  prospection_count INTEGER DEFAULT 0,
  win TEXT,
  blocker TEXT,
  goal_next_week TEXT,
  gratitudes TEXT[] DEFAULT '{}',
  daily_goals TEXT[] DEFAULT '{}',
  notes TEXT,
  coach_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(client_id, date)
);

ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'checkins' AND policyname = 'checkins_staff') THEN
    CREATE POLICY checkins_staff ON checkins FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'checkins' AND policyname = 'checkins_own') THEN
    CREATE POLICY checkins_own ON checkins FOR ALL USING (client_id = auth.uid()) WITH CHECK (client_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_checkins_client_date ON checkins(client_id, date DESC);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 31. certificate_entries — alternate certificate storage
-- ═══════════════════════════════════════════════════════════════════════════════

-- Note: main table is "certificates" from 023_certificates.sql.
-- "certificate_entries" is referenced in some newer code.
CREATE TABLE IF NOT EXISTS certificate_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ DEFAULT now(),
  course_title TEXT NOT NULL,
  student_name TEXT NOT NULL,
  total_lessons INT NOT NULL DEFAULT 0,
  total_modules INT NOT NULL DEFAULT 0,
  quiz_average NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, course_id)
);

ALTER TABLE certificate_entries ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'certificate_entries' AND policyname = 'cert_entries_select') THEN
    CREATE POLICY cert_entries_select ON certificate_entries FOR SELECT USING (
      student_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'certificate_entries' AND policyname = 'cert_entries_insert') THEN
    CREATE POLICY cert_entries_insert ON certificate_entries FOR INSERT WITH CHECK (
      student_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_certificate_entries_student ON certificate_entries(student_id);
CREATE INDEX IF NOT EXISTS idx_certificate_entries_course ON certificate_entries(course_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 32. form_templates — pre-built form templates
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('onboarding', 'feedback', 'evaluation', 'intake', 'survey')),
  thumbnail_emoji TEXT DEFAULT '📋',
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_system BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'form_templates' AND policyname = 'form_templates_select') THEN
    CREATE POLICY form_templates_select ON form_templates FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'form_templates' AND policyname = 'form_templates_admin_manage') THEN
    CREATE POLICY form_templates_admin_manage ON form_templates FOR ALL TO authenticated USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') OR created_by = auth.uid()
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_form_templates_category ON form_templates(category);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 33. journal_prompts — guided daily prompts
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS journal_prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  is_active BOOLEAN NOT NULL DEFAULT true,
  order_index INT NOT NULL DEFAULT 0,
  day_of_week INT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE journal_prompts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'journal_prompts' AND policyname = 'journal_prompts_read') THEN
    CREATE POLICY journal_prompts_read ON journal_prompts FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'journal_prompts' AND policyname = 'journal_prompts_admin') THEN
    CREATE POLICY journal_prompts_admin ON journal_prompts FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- 34. journal_attachments — media attachments for journal entries
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS journal_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE journal_attachments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'journal_attachments' AND policyname = 'journal_attachments_own') THEN
    CREATE POLICY journal_attachments_own ON journal_attachments FOR ALL USING (
      EXISTS (SELECT 1 FROM journal_entries WHERE id = journal_attachments.journal_entry_id AND author_id = auth.uid())
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'journal_attachments' AND policyname = 'journal_attachments_staff_read') THEN
    CREATE POLICY journal_attachments_staff_read ON journal_attachments FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_journal_attachments_entry ON journal_attachments(journal_entry_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 35. notification_preferences — per-user notification settings
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiet_hours_start TIME NOT NULL DEFAULT '22:00',
  quiet_hours_end TIME NOT NULL DEFAULT '08:00',
  batch_frequency TEXT NOT NULL DEFAULT 'instant' CHECK (batch_frequency IN ('instant', 'hourly', 'daily')),
  priority_threshold TEXT NOT NULL DEFAULT 'all' CHECK (priority_threshold IN ('all', 'high', 'critical')),
  email_digest BOOLEAN NOT NULL DEFAULT true,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notification_preferences' AND policyname = 'notif_prefs_select') THEN
    CREATE POLICY notif_prefs_select ON notification_preferences FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notification_preferences' AND policyname = 'notif_prefs_insert') THEN
    CREATE POLICY notif_prefs_insert ON notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notification_preferences' AND policyname = 'notif_prefs_update') THEN
    CREATE POLICY notif_prefs_update ON notification_preferences FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;


-- ═══════════════════════════════════════════════════════════════════════════════
-- 36. ai_reports — periodic AI-generated reports
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('weekly_coaching', 'monthly_performance', 'client_risk')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE ai_reports ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_reports' AND policyname = 'ai_reports_own') THEN
    CREATE POLICY ai_reports_own ON ai_reports FOR ALL USING (user_id = auth.uid());
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ai_reports_user_type ON ai_reports(user_id, type, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_reports_unread ON ai_reports(user_id) WHERE read_at IS NULL;


-- ═══════════════════════════════════════════════════════════════════════════════
-- 37. dashboard_layouts — per-user widget configurations
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS dashboard_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  widgets JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT dashboard_layouts_user_id_key UNIQUE (user_id)
);

ALTER TABLE dashboard_layouts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dashboard_layouts' AND policyname = 'dashboard_layouts_own_select') THEN
    CREATE POLICY dashboard_layouts_own_select ON dashboard_layouts FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dashboard_layouts' AND policyname = 'dashboard_layouts_own_insert') THEN
    CREATE POLICY dashboard_layouts_own_insert ON dashboard_layouts FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dashboard_layouts' AND policyname = 'dashboard_layouts_own_update') THEN
    CREATE POLICY dashboard_layouts_own_update ON dashboard_layouts FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dashboard_layouts' AND policyname = 'dashboard_layouts_own_delete') THEN
    CREATE POLICY dashboard_layouts_own_delete ON dashboard_layouts FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_dashboard_layouts_user_id ON dashboard_layouts(user_id);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 38. offboarding_requests — user offboarding workflows
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS offboarding_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  transfer_to_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason TEXT,
  requested_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  data_actions JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE offboarding_requests ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'offboarding_requests' AND policyname = 'offboarding_admin_select') THEN
    CREATE POLICY offboarding_admin_select ON offboarding_requests FOR SELECT TO authenticated USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'offboarding_requests' AND policyname = 'offboarding_admin_insert') THEN
    CREATE POLICY offboarding_admin_insert ON offboarding_requests FOR INSERT TO authenticated WITH CHECK (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'offboarding_requests' AND policyname = 'offboarding_admin_update') THEN
    CREATE POLICY offboarding_admin_update ON offboarding_requests FOR UPDATE TO authenticated USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_offboarding_user ON offboarding_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_offboarding_status ON offboarding_requests(status) WHERE status IN ('pending', 'in_progress');


-- ═══════════════════════════════════════════════════════════════════════════════
-- 39. relance_sequences + relance_steps + relance_enrollments
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS relance_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  target_stage TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS relance_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID REFERENCES relance_sequences(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  delay_days INTEGER NOT NULL,
  channel TEXT NOT NULL DEFAULT 'email',
  subject TEXT,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS relance_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE CASCADE,
  sequence_id UUID REFERENCES relance_sequences(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  next_step_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  enrolled_by UUID REFERENCES auth.users(id),
  UNIQUE(contact_id, sequence_id)
);

ALTER TABLE relance_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE relance_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE relance_enrollments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'relance_sequences' AND policyname = 'relance_seq_select') THEN
    CREATE POLICY relance_seq_select ON relance_sequences FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'relance_sequences' AND policyname = 'relance_seq_manage') THEN
    CREATE POLICY relance_seq_manage ON relance_sequences FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'relance_steps' AND policyname = 'relance_steps_select') THEN
    CREATE POLICY relance_steps_select ON relance_steps FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'relance_steps' AND policyname = 'relance_steps_manage') THEN
    CREATE POLICY relance_steps_manage ON relance_steps FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'relance_enrollments' AND policyname = 'relance_enroll_select') THEN
    CREATE POLICY relance_enroll_select ON relance_enrollments FOR SELECT USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'relance_enrollments' AND policyname = 'relance_enroll_manage') THEN
    CREATE POLICY relance_enroll_manage ON relance_enrollments FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_relance_enrollments_next ON relance_enrollments(next_step_at) WHERE status = 'active';


-- ═══════════════════════════════════════════════════════════════════════════════
-- 40. enrichment_results — contact enrichment data from Apify etc.
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS enrichment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES crm_contacts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  error_message TEXT,
  enriched_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE enrichment_results ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'enrichment_results' AND policyname = 'enrichment_results_staff') THEN
    CREATE POLICY enrichment_results_staff ON enrichment_results FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_enrichment_results_contact ON enrichment_results(contact_id);
CREATE INDEX IF NOT EXISTS idx_enrichment_results_platform ON enrichment_results(platform);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 41. branding_pages — custom branded pages (login, landing)
-- ═══════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS branding_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content_html TEXT,
  is_published BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE branding_pages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'branding_pages' AND policyname = 'branding_pages_select') THEN
    CREATE POLICY branding_pages_select ON branding_pages FOR SELECT USING (
      is_published = true OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'branding_pages' AND policyname = 'branding_pages_admin') THEN
    CREATE POLICY branding_pages_admin ON branding_pages FOR ALL USING (
      EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_branding_pages_slug ON branding_pages(slug);


-- ═══════════════════════════════════════════════════════════════════════════════
-- 42. Add missing columns to existing tables (idempotent)
-- ═══════════════════════════════════════════════════════════════════════════════

-- profiles: onboarding-related columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_offer_id UUID;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_answers JSONB DEFAULT '{}';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS default_currency TEXT DEFAULT 'EUR';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_consent_given_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS ai_consent_scope JSONB DEFAULT '[]';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS leaderboard_anonymous BOOLEAN DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS anonymous_alias TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS custom_role_id UUID;

-- notifications: priority, batching, analytics
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS action_url TEXT;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_archived BOOLEAN DEFAULT false;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS batched_at TIMESTAMPTZ;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS batch_id UUID;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMPTZ;

-- journal_entries: media, sharing, prompts
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS media_urls TEXT[] DEFAULT '{}';
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS shared_with_coach BOOLEAN DEFAULT false;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS prompt_id UUID;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- messages: AI flag
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_ai_generated BOOLEAN DEFAULT false;

-- lessons: embed support
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS embed_url TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS embed_type TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS audio_duration INTEGER;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content_html TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;


-- ═══════════════════════════════════════════════════════════════════════════════
-- Done. All 52 tables created (or verified) with RLS policies and indexes.
-- ═══════════════════════════════════════════════════════════════════════════════
