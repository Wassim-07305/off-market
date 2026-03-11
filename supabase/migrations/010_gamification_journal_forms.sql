-- Migration 010: Gamification, Journal/Check-ins, Form Builder
-- Off-Market CRM Platform

-- ============================================================
-- 1. GAMIFICATION SYSTEM
-- ============================================================

-- Points ledger: tracks every point earned/spent
CREATE TABLE IF NOT EXISTS points_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Badges catalog + earned badges
CREATE TABLE IF NOT EXISTS badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- lucide icon name
  category TEXT NOT NULL DEFAULT 'general', -- general, streak, milestone, social
  threshold INTEGER DEFAULT 0, -- points/count needed
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Streaks tracking
CREATE TABLE IF NOT EXISTS streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'daily_checkin', -- daily_checkin, weekly_goal, ritual
  current_count INTEGER NOT NULL DEFAULT 0,
  longest_count INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, type)
);

-- ============================================================
-- 2. DAILY JOURNAL / CHECK-INS
-- ============================================================

CREATE TABLE IF NOT EXISTS journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood INTEGER CHECK (mood BETWEEN 1 AND 5), -- 1=bad, 5=great
  energy INTEGER CHECK (energy BETWEEN 1 AND 5),
  wins TEXT, -- daily wins
  blockers TEXT, -- blockers/challenges
  goals_tomorrow TEXT, -- goals for next day
  notes TEXT, -- free-form notes
  revenue_today NUMERIC DEFAULT 0, -- revenue generated today
  calls_made INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Weekly check-ins (coach reviews)
CREATE TABLE IF NOT EXISTS weekly_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES auth.users(id),
  week_start DATE NOT NULL,
  revenue_goal NUMERIC DEFAULT 0,
  revenue_actual NUMERIC DEFAULT 0,
  calls_goal INTEGER DEFAULT 0,
  calls_actual INTEGER DEFAULT 0,
  messages_goal INTEGER DEFAULT 0,
  messages_actual INTEGER DEFAULT 0,
  highlights TEXT,
  improvements TEXT,
  coach_feedback TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'submitted', 'reviewed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, week_start)
);

-- ============================================================
-- 3. FORM BUILDER
-- ============================================================

-- Form templates
CREATE TABLE IF NOT EXISTS forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  schema JSONB NOT NULL DEFAULT '[]', -- array of field definitions
  settings JSONB DEFAULT '{}', -- form-level settings
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Form submissions
CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  data JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. ONBOARDING STEPS
-- ============================================================

CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step TEXT NOT NULL, -- 'profile', 'goals', 'first_checkin', 'first_call', etc.
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, step)
);

-- ============================================================
-- 5. RLS POLICIES
-- ============================================================

ALTER TABLE points_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;

-- Points: users see their own, admins see all
CREATE POLICY "points_own" ON points_ledger FOR SELECT USING (
  auth.uid() = user_id OR get_my_role() = 'admin'
);
CREATE POLICY "points_insert" ON points_ledger FOR INSERT WITH CHECK (
  auth.uid() = user_id OR get_my_role() = 'admin'
);

-- Badges catalog: everyone can see
CREATE POLICY "badges_select" ON badges FOR SELECT USING (true);
CREATE POLICY "badges_admin" ON badges FOR ALL USING (get_my_role() = 'admin');

-- User badges: own or admin
CREATE POLICY "user_badges_select" ON user_badges FOR SELECT USING (
  auth.uid() = user_id OR get_my_role() = 'admin'
);
CREATE POLICY "user_badges_insert" ON user_badges FOR INSERT WITH CHECK (
  get_my_role() = 'admin'
);

-- Streaks: own or admin
CREATE POLICY "streaks_own" ON streaks FOR ALL USING (
  auth.uid() = user_id OR get_my_role() = 'admin'
);

-- Journal: own entries or coach/admin
CREATE POLICY "journal_own" ON journal_entries FOR ALL USING (
  auth.uid() = user_id OR get_my_role() = 'admin'
);

-- Weekly checkins: own or coach or admin
CREATE POLICY "checkins_own" ON weekly_checkins FOR ALL USING (
  auth.uid() = user_id OR auth.uid() = coach_id OR get_my_role() = 'admin'
);

-- Forms: creator or admin
CREATE POLICY "forms_select" ON forms FOR SELECT USING (
  is_published = true OR auth.uid() = created_by OR get_my_role() = 'admin'
);
CREATE POLICY "forms_manage" ON forms FOR ALL USING (
  auth.uid() = created_by OR get_my_role() = 'admin'
);

-- Form submissions: submitter, form creator, or admin
CREATE POLICY "submissions_select" ON form_submissions FOR SELECT USING (
  auth.uid() = submitted_by OR get_my_role() = 'admin'
  OR EXISTS (SELECT 1 FROM forms WHERE forms.id = form_id AND forms.created_by = auth.uid())
);
CREATE POLICY "submissions_insert" ON form_submissions FOR INSERT WITH CHECK (true);

-- Onboarding: own or admin
CREATE POLICY "onboarding_own" ON onboarding_progress FOR ALL USING (
  auth.uid() = user_id OR get_my_role() = 'admin'
);

-- ============================================================
-- 6. INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_points_user ON points_ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_points_created ON points_ledger(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_streaks_user ON streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_user_date ON journal_entries(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_checkins_user ON weekly_checkins(user_id, week_start DESC);
CREATE INDEX IF NOT EXISTS idx_forms_creator ON forms(created_by);
CREATE INDEX IF NOT EXISTS idx_submissions_form ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user ON form_submissions(submitted_by);
CREATE INDEX IF NOT EXISTS idx_onboarding_user ON onboarding_progress(user_id);

-- ============================================================
-- 7. TRIGGERS
-- ============================================================

CREATE OR REPLACE TRIGGER update_streaks_updated_at
  BEFORE UPDATE ON streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_journal_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_checkins_updated_at
  BEFORE UPDATE ON weekly_checkins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE TRIGGER update_forms_updated_at
  BEFORE UPDATE ON forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 8. SEED BADGES
-- ============================================================

INSERT INTO badges (slug, name, description, icon, category, threshold) VALUES
  ('first_checkin', 'Premier Check-in', 'Complété votre premier check-in quotidien', 'CheckCircle', 'milestone', 1),
  ('week_streak_7', 'Semaine parfaite', '7 jours consécutifs de check-in', 'Flame', 'streak', 7),
  ('month_streak_30', 'Mois de feu', '30 jours consécutifs de check-in', 'Trophy', 'streak', 30),
  ('first_call', 'Premier appel', 'Réalisé votre premier appel', 'Phone', 'milestone', 1),
  ('closer_10k', '10K Club', 'Atteint 10 000€ de CA cumulé', 'Star', 'milestone', 10000),
  ('closer_50k', '50K Club', 'Atteint 50 000€ de CA cumulé', 'Crown', 'milestone', 50000),
  ('social_creator', 'Créateur', 'Publié 10 contenus sociaux', 'Film', 'social', 10),
  ('social_machine', 'Machine à contenu', 'Publié 50 contenus sociaux', 'Zap', 'social', 50),
  ('team_player', 'Team Player', 'Assigné à 5 clients différents', 'Users', 'general', 5),
  ('goal_crusher', 'Objectif atteint', 'Dépassé vos objectifs hebdomadaires 4 semaines de suite', 'Target', 'streak', 4)
ON CONFLICT (slug) DO NOTHING;
