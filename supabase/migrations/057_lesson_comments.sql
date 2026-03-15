-- ─── Lesson Comments ──────────────────────────────────────────
-- Allows students and coaches to comment on lessons with threaded replies.

CREATE TABLE IF NOT EXISTS lesson_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL,
  profile_id UUID NOT NULL REFERENCES profiles(id),
  content TEXT NOT NULL,
  parent_id UUID REFERENCES lesson_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_lesson_comments_lesson ON lesson_comments(lesson_id);
CREATE INDEX idx_lesson_comments_parent ON lesson_comments(parent_id);

ALTER TABLE lesson_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read comments" ON lesson_comments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create comments" ON lesson_comments
  FOR INSERT TO authenticated WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can edit own comments" ON lesson_comments
  FOR UPDATE TO authenticated USING (profile_id = auth.uid());

CREATE POLICY "Users can delete own comments" ON lesson_comments
  FOR DELETE TO authenticated USING (profile_id = auth.uid());
