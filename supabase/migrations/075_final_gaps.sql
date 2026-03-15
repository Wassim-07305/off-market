-- Migration 075: Final CDC gaps — audit_logs, upsell_opportunities, saved_segments
-- Off-Market Sprint 40

-- ─── 1. AUDIT LOGS ──────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- RLS: admin only
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_admin_read" ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "audit_logs_insert_authenticated" ON audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ─── 2. UPSELL OPPORTUNITIES ────────────────────────
CREATE TABLE IF NOT EXISTS upsell_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES student_details(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL DEFAULT 'manual',
  trigger_value TEXT,
  offer_name TEXT NOT NULL,
  offer_type TEXT NOT NULL DEFAULT 'avancee' CHECK (offer_type IN ('avancee', 'mastermind', 'vip')),
  amount NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'detected' CHECK (status IN ('detected', 'proposed', 'accepted', 'declined')),
  message TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_upsell_opps_status ON upsell_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_upsell_opps_student ON upsell_opportunities(student_id);

ALTER TABLE upsell_opportunities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "upsell_opps_admin_all" ON upsell_opportunities
  FOR ALL USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "upsell_opps_coach_read" ON upsell_opportunities
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin', 'coach'))
  );

-- ─── 3. SAVED SEGMENTS ─────────────────────────────
CREATE TABLE IF NOT EXISTS saved_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_shared BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_saved_segments_created_by ON saved_segments(created_by);

ALTER TABLE saved_segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_segments_owner_all" ON saved_segments
  FOR ALL USING (created_by = auth.uid());

CREATE POLICY "saved_segments_shared_read" ON saved_segments
  FOR SELECT USING (is_shared = true);

-- ─── 4. AI CONSENT (if not exists from 074) ──────────
-- Add ai_consent column to profiles if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'ai_consent'
  ) THEN
    ALTER TABLE profiles ADD COLUMN ai_consent BOOLEAN DEFAULT NULL;
    ALTER TABLE profiles ADD COLUMN ai_consent_at TIMESTAMPTZ;
  END IF;
END $$;

-- ─── 5. NOTIFICATION SOUND PREFERENCES ──────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'notification_sounds'
  ) THEN
    ALTER TABLE profiles ADD COLUMN notification_sounds BOOLEAN DEFAULT true;
    ALTER TABLE profiles ADD COLUMN urgent_sounds BOOLEAN DEFAULT true;
  END IF;
END $$;

-- ─── 6. JOURNAL PRIVACY + EXPORT TRACKING ───────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'journal_entries' AND column_name = 'export_count'
  ) THEN
    ALTER TABLE journal_entries ADD COLUMN export_count INTEGER DEFAULT 0;
  END IF;
END $$;
