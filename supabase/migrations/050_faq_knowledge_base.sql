-- ============================================================
-- 050 — FAQ / Knowledge Base IA
-- ============================================================

-- Table des entrees FAQ (base de connaissances)
CREATE TABLE IF NOT EXISTS faq_entries (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question      text NOT NULL,
  answer        text NOT NULL DEFAULT '',
  category      text NOT NULL DEFAULT 'general',
  occurrence_count integer NOT NULL DEFAULT 1,
  auto_answer_enabled boolean NOT NULL DEFAULT false,
  source_message_id uuid REFERENCES messages(id) ON DELETE SET NULL,
  created_by    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_asked_at timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- Log de chaque occurrence d'une question
CREATE TABLE IF NOT EXISTS faq_question_logs (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  faq_entry_id    uuid NOT NULL REFERENCES faq_entries(id) ON DELETE CASCADE,
  asked_by        uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  channel_id      uuid REFERENCES channels(id) ON DELETE SET NULL,
  message_id      uuid REFERENCES messages(id) ON DELETE SET NULL,
  similarity_score float NOT NULL DEFAULT 1.0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_faq_entries_occurrence ON faq_entries(occurrence_count DESC);
CREATE INDEX IF NOT EXISTS idx_faq_entries_last_asked ON faq_entries(last_asked_at DESC);
CREATE INDEX IF NOT EXISTS idx_faq_entries_category ON faq_entries(category);
CREATE INDEX IF NOT EXISTS idx_faq_entries_auto_answer ON faq_entries(auto_answer_enabled) WHERE auto_answer_enabled = true;
CREATE INDEX IF NOT EXISTS idx_faq_entries_question_trgm ON faq_entries USING gin (question gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_faq_question_logs_entry ON faq_question_logs(faq_entry_id);
CREATE INDEX IF NOT EXISTS idx_faq_question_logs_created ON faq_question_logs(created_at DESC);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_faq_entries_fts ON faq_entries USING gin (
  to_tsvector('french', question || ' ' || answer)
);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_faq_entries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_faq_entries_updated_at ON faq_entries;
CREATE TRIGGER trg_faq_entries_updated_at
  BEFORE UPDATE ON faq_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_faq_entries_updated_at();

-- ============================================================
-- RLS
-- ============================================================

ALTER TABLE faq_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_question_logs ENABLE ROW LEVEL SECURITY;

-- Staff (admin + coach) can do everything on faq_entries
CREATE POLICY faq_entries_staff_all ON faq_entries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'coach')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'coach')
    )
  );

-- Clients can read auto-answer-enabled entries
CREATE POLICY faq_entries_client_read ON faq_entries
  FOR SELECT
  TO authenticated
  USING (
    auto_answer_enabled = true
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'client'
    )
  );

-- Staff can do everything on faq_question_logs
CREATE POLICY faq_question_logs_staff_all ON faq_question_logs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'coach')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'coach')
    )
  );

-- Clients can insert logs (when they ask a question)
CREATE POLICY faq_question_logs_client_insert ON faq_question_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    asked_by = auth.uid()
  );
