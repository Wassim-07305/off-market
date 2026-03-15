-- ═══════════════════════════════════════════════════════════
-- Relance (follow-up) sequences for CRM pipeline
-- ═══════════════════════════════════════════════════════════

-- Relance sequence templates
CREATE TABLE IF NOT EXISTS relance_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  target_stage TEXT NOT NULL, -- which pipeline stage this targets
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Individual steps within a sequence
CREATE TABLE IF NOT EXISTS relance_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sequence_id UUID REFERENCES relance_sequences(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL,
  delay_days INTEGER NOT NULL, -- days after previous step (or enrollment)
  channel TEXT NOT NULL DEFAULT 'email', -- 'email' | 'sms' | 'notification'
  subject TEXT, -- for email
  content TEXT NOT NULL, -- message body, supports {{variables}}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Track which contacts are enrolled in which sequences
CREATE TABLE IF NOT EXISTS relance_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES crm_contacts(id) ON DELETE CASCADE,
  sequence_id UUID REFERENCES relance_sequences(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active', -- 'active' | 'completed' | 'paused' | 'cancelled'
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  next_step_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  enrolled_by UUID REFERENCES auth.users(id),
  UNIQUE(contact_id, sequence_id)
);

-- Log of sent relances
CREATE TABLE IF NOT EXISTS relance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES relance_enrollments(id) ON DELETE CASCADE,
  step_id UUID REFERENCES relance_steps(id),
  channel TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'sent', -- 'sent' | 'failed' | 'opened' | 'clicked'
  sent_at TIMESTAMPTZ DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- RLS
ALTER TABLE relance_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE relance_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE relance_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE relance_logs ENABLE ROW LEVEL SECURITY;

-- Admin + coach can manage sequences
CREATE POLICY "seq_select" ON relance_sequences FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','coach')));
CREATE POLICY "seq_insert" ON relance_sequences FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','coach')));
CREATE POLICY "seq_update" ON relance_sequences FOR UPDATE
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','coach')));
CREATE POLICY "seq_delete" ON relance_sequences FOR DELETE
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','coach')));

CREATE POLICY "steps_select" ON relance_steps FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','coach')));
CREATE POLICY "steps_manage" ON relance_steps FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','coach')));

CREATE POLICY "enroll_select" ON relance_enrollments FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','coach')));
CREATE POLICY "enroll_manage" ON relance_enrollments FOR ALL
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','coach')));

CREATE POLICY "logs_select" ON relance_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','coach')));
CREATE POLICY "logs_insert" ON relance_logs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','coach')));

-- Index for cron job
CREATE INDEX idx_relance_enrollments_next ON relance_enrollments(next_step_at) WHERE status = 'active';
