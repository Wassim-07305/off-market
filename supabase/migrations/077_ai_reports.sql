-- Migration 077: AI periodic reports + AI consent scope on profiles + is_ai_generated on messages

-- 1. ai_reports table for stored periodic reports
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

CREATE POLICY ai_reports_own ON ai_reports
  FOR ALL USING (user_id = auth.uid());

CREATE INDEX idx_ai_reports_user_type ON ai_reports (user_id, type, generated_at DESC);
CREATE INDEX idx_ai_reports_unread ON ai_reports (user_id) WHERE read_at IS NULL;

-- 2. AI consent columns on profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'ai_consent_given_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN ai_consent_given_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'ai_consent_scope'
  ) THEN
    ALTER TABLE profiles ADD COLUMN ai_consent_scope JSONB DEFAULT '[]';
  END IF;
END $$;

-- 3. is_ai_generated flag on messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'messages' AND column_name = 'is_ai_generated'
  ) THEN
    ALTER TABLE messages ADD COLUMN is_ai_generated BOOLEAN DEFAULT false;
  END IF;
END $$;
