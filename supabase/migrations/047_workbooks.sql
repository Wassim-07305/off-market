-- =============================================================================
-- 047 — Workbooks (questionnaires adaptatifs) + Call Documents (transcript fusion)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. workbooks — templates de questionnaires par module
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workbooks (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  description  TEXT,
  course_id    UUID REFERENCES courses(id) ON DELETE SET NULL,
  module_type  TEXT CHECK (module_type IN (
    'marche', 'offre', 'communication', 'acquisition', 'conversion', 'diagnostic', 'general'
  )),
  fields       JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_workbooks_course ON workbooks(course_id) WHERE course_id IS NOT NULL;
CREATE INDEX idx_workbooks_module_type ON workbooks(module_type);

-- ---------------------------------------------------------------------------
-- 2. workbook_submissions — reponses des clients
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workbook_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workbook_id     UUID NOT NULL REFERENCES workbooks(id) ON DELETE CASCADE,
  client_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  call_id         UUID REFERENCES call_calendar(id) ON DELETE SET NULL,
  answers         JSONB NOT NULL DEFAULT '{}'::jsonb,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'reviewed')),
  reviewer_notes  TEXT,
  reviewed_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  submitted_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_wb_submissions_workbook ON workbook_submissions(workbook_id);
CREATE INDEX idx_wb_submissions_client ON workbook_submissions(client_id);
CREATE INDEX idx_wb_submissions_call ON workbook_submissions(call_id) WHERE call_id IS NOT NULL;
CREATE UNIQUE INDEX idx_wb_submissions_unique ON workbook_submissions(workbook_id, client_id)
  WHERE call_id IS NULL;

-- ---------------------------------------------------------------------------
-- 3. call_documents — documents generes (fusion transcript, export, etc.)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS call_documents (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id           UUID NOT NULL REFERENCES call_calendar(id) ON DELETE CASCADE,
  type              TEXT NOT NULL CHECK (type IN ('transcript_fusion', 'summary', 'workbook_export')),
  title             TEXT NOT NULL,
  content_html      TEXT NOT NULL DEFAULT '',
  content_markdown  TEXT,
  generated_by      TEXT NOT NULL DEFAULT 'ai',
  model             TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_call_documents_call ON call_documents(call_id);

-- ---------------------------------------------------------------------------
-- 4. updated_at trigger for workbooks
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_workbooks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_workbooks_updated_at
  BEFORE UPDATE ON workbooks
  FOR EACH ROW EXECUTE FUNCTION update_workbooks_updated_at();

-- ---------------------------------------------------------------------------
-- 5. RLS
-- ---------------------------------------------------------------------------
ALTER TABLE workbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE workbook_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_documents ENABLE ROW LEVEL SECURITY;

-- Workbooks: staff can manage, all authenticated can read active
CREATE POLICY workbooks_read ON workbooks
  FOR SELECT TO authenticated
  USING (is_active = true);

CREATE POLICY workbooks_manage ON workbooks
  FOR ALL TO authenticated
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

-- Workbook submissions: clients see own, staff see all
CREATE POLICY wb_submissions_own ON workbook_submissions
  FOR ALL TO authenticated
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

CREATE POLICY wb_submissions_staff ON workbook_submissions
  FOR ALL TO authenticated
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

-- Call documents: staff can manage, client can read own call docs
CREATE POLICY call_docs_staff ON call_documents
  FOR ALL TO authenticated
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

CREATE POLICY call_docs_client_read ON call_documents
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM call_calendar
      WHERE call_calendar.id = call_documents.call_id
        AND call_calendar.client_id = auth.uid()
    )
  );
