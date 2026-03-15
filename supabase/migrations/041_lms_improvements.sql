-- ============================================================================
-- 041: LMS Improvements — Drip content, lesson actions, replays
-- ============================================================================

-- ─── Lesson action items / checklist ────────────────────────────────────────

CREATE TABLE IF NOT EXISTS lesson_actions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id uuid NOT NULL,
  title text NOT NULL,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lesson_action_completions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  action_id uuid REFERENCES lesson_actions(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at timestamptz DEFAULT now(),
  UNIQUE(action_id, user_id)
);

-- ─── Drip settings on modules ──────────────────────────────────────────────

ALTER TABLE modules ADD COLUMN IF NOT EXISTS drip_type text DEFAULT 'immediate';
ALTER TABLE modules ADD COLUMN IF NOT EXISTS drip_days int;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS drip_after_module_id uuid;
ALTER TABLE modules ADD COLUMN IF NOT EXISTS drip_min_level int;

-- ─── Replays library ───────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS replays (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  duration_minutes int,
  coach_id uuid REFERENCES auth.users(id),
  tags text[] DEFAULT '{}',
  category text,
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- ─── RLS ────────────────────────────────────────────────────────────────────

ALTER TABLE lesson_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_action_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE replays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view lesson actions" ON lesson_actions FOR SELECT USING (true);
CREATE POLICY "Staff can manage lesson actions" ON lesson_actions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);

CREATE POLICY "Anyone can view replays" ON replays FOR SELECT USING (true);
CREATE POLICY "Staff can manage replays" ON replays FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
);

CREATE POLICY "Users manage their action completions" ON lesson_action_completions
  FOR ALL USING (auth.uid() = user_id);

-- ─── Indexes ────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_lesson_actions_lesson_id ON lesson_actions(lesson_id);
CREATE INDEX IF NOT EXISTS idx_lesson_action_completions_action_id ON lesson_action_completions(action_id);
CREATE INDEX IF NOT EXISTS idx_lesson_action_completions_user_id ON lesson_action_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_replays_category ON replays(category);
CREATE INDEX IF NOT EXISTS idx_replays_coach_id ON replays(coach_id);
CREATE INDEX IF NOT EXISTS idx_modules_drip_type ON modules(drip_type);
