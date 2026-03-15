-- ============================================
-- 042: User Management & Security
-- Audit logs, user sessions, profile archival
-- ============================================

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id),
  action text NOT NULL,
  entity_type text,
  entity_id uuid,
  details jsonb DEFAULT '{}',
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- User sessions tracking
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  device_info text,
  ip_address text,
  last_active_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- User archival columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS archived_at timestamptz;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS archived_by uuid REFERENCES auth.users(id);

-- Add resent status to user_invites
ALTER TABLE user_invites ADD COLUMN IF NOT EXISTS resent_at timestamptz;
ALTER TABLE user_invites ADD COLUMN IF NOT EXISTS resent_count integer DEFAULT 0;

-- RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Audit logs: only admins can view
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Audit logs: any authenticated user can insert (to log their own actions)
CREATE POLICY "Authenticated users can insert audit logs" ON audit_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- User sessions: users see their own
CREATE POLICY "Users can view own sessions" ON user_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sessions" ON user_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON user_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sessions" ON user_sessions FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_profiles_archived ON profiles(is_archived) WHERE is_archived = true;
