-- RGPD consent tracking
CREATE TABLE IF NOT EXISTS user_consents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type text NOT NULL, -- 'rgpd_general', 'marketing', 'analytics', etc.
  consent_version text NOT NULL DEFAULT '1.0',
  accepted boolean NOT NULL DEFAULT true,
  ip_address text,
  created_at timestamptz DEFAULT now(),
  revoked_at timestamptz,
  UNIQUE(user_id, consent_type)
);

CREATE INDEX IF NOT EXISTS idx_user_consents_user ON user_consents(user_id);

ALTER TABLE user_consents ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own consents
CREATE POLICY "consents_select_own" ON user_consents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "consents_insert_own" ON user_consents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "consents_update_own" ON user_consents
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can view all consents (for compliance)
CREATE POLICY "consents_admin_select" ON user_consents
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );
