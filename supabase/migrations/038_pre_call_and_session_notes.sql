-- Pre-call questions answers (BigPlan 6.6)
CREATE TABLE IF NOT EXISTS pre_call_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id uuid NOT NULL REFERENCES call_calendar(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  objective text NOT NULL,
  tried_solutions text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(call_id, user_id)
);

-- Session notes taken during calls (BigPlan 6.9)
CREATE TABLE IF NOT EXISTS call_session_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id uuid NOT NULL REFERENCES call_calendar(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text DEFAULT '',
  action_items jsonb DEFAULT '[]'::jsonb,
  is_shared_with_client boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(call_id, author_id)
);

-- RLS for pre_call_answers
ALTER TABLE pre_call_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own pre-call answers"
  ON pre_call_answers FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Coaches and admins can view pre-call answers"
  ON pre_call_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach')
    )
  );

-- RLS for call_session_notes
ALTER TABLE call_session_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authors can manage their own session notes"
  ON call_session_notes FOR ALL
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can view all session notes"
  ON call_session_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pre_call_answers_call ON pre_call_answers(call_id);
CREATE INDEX IF NOT EXISTS idx_call_session_notes_call ON call_session_notes(call_id);
