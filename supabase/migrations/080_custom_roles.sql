-- ============================================================
-- 080 — Custom Roles & User Offboarding
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- 1. custom_roles — admin-defined roles with module permissions
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS custom_roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  description TEXT,
  permissions JSONB NOT NULL DEFAULT '[]'::jsonb,   -- array of module slugs
  color       TEXT DEFAULT '#6B7280',
  icon        TEXT DEFAULT 'Shield',
  is_system   BOOLEAN NOT NULL DEFAULT false,        -- built-in roles cannot be deleted
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_custom_roles_active ON custom_roles (is_active) WHERE is_active = true;

-- RLS
ALTER TABLE custom_roles ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read active roles
CREATE POLICY "custom_roles_select" ON custom_roles
  FOR SELECT TO authenticated
  USING (true);

-- Only admin can insert/update/delete
CREATE POLICY "custom_roles_insert" ON custom_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "custom_roles_update" ON custom_roles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "custom_roles_delete" ON custom_roles
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    AND is_system = false
  );

-- Seed default system roles matching existing permission matrix
INSERT INTO custom_roles (name, description, permissions, color, icon, is_system) VALUES
  (
    'Admin',
    'Acces complet a tous les modules',
    '["dashboard","messaging","formations","eleves","pipeline","calendrier","activite","finances","users","notifications","settings","analytics","closer-calls","social-content","instagram","clients","rituals","journal","gamification","forms","coaching","assistant","feed","contracts","documentation","billing","invitations","resources","school","community","hall-of-fame","audit","faq","upsell","roadmap"]',
    '#DC2626',
    'ShieldCheck',
    true
  ),
  (
    'Coach',
    'Gestion clients, formations, coaching',
    '["dashboard","messaging","formations","eleves","calendrier","notifications","settings","social-content","instagram","clients","rituals","journal","gamification","forms","coaching","assistant","feed","documentation","resources","school","community","hall-of-fame","faq","roadmap"]',
    '#2563EB',
    'GraduationCap',
    true
  ),
  (
    'Setter',
    'Prospection et prise de rendez-vous',
    '["dashboard","messaging","pipeline","activite","notifications","settings","contracts","resources"]',
    '#7C3AED',
    'Phone',
    true
  ),
  (
    'Closer',
    'Closing et suivi commercial',
    '["dashboard","messaging","pipeline","activite","notifications","settings","closer-calls","contracts","resources"]',
    '#059669',
    'Target',
    true
  ),
  (
    'Client',
    'Acces limite : formations, communaute, journal',
    '["dashboard","messaging","formations","notifications","settings","rituals","journal","gamification","assistant","feed","documentation","resources","school","community","hall-of-fame","roadmap"]',
    '#F59E0B',
    'User',
    true
  )
ON CONFLICT (name) DO NOTHING;

-- ────────────────────────────────────────────────────────────
-- 2. custom_role_id on profiles — link users to custom roles
-- ────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'custom_role_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN custom_role_id UUID REFERENCES custom_roles(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_custom_role ON profiles (custom_role_id) WHERE custom_role_id IS NOT NULL;

-- ────────────────────────────────────────────────────────────
-- 3. offboarding_requests — track user offboarding workflows
-- ────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS offboarding_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','cancelled')),
  transfer_to_id  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reason          TEXT,
  requested_by    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  data_actions    JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- e.g. { "transfer_clients": true, "transfer_channels": true, "archive_messages": false, "export_data": true }
  completed_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_offboarding_user ON offboarding_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_offboarding_status ON offboarding_requests (status) WHERE status IN ('pending','in_progress');

-- RLS
ALTER TABLE offboarding_requests ENABLE ROW LEVEL SECURITY;

-- Admin can manage all offboarding requests
CREATE POLICY "offboarding_select" ON offboarding_requests
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "offboarding_insert" ON offboarding_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "offboarding_update" ON offboarding_requests
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ────────────────────────────────────────────────────────────
-- 4. updated_at trigger for custom_roles
-- ────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_custom_roles_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_custom_roles_updated_at ON custom_roles;
CREATE TRIGGER trg_custom_roles_updated_at
  BEFORE UPDATE ON custom_roles
  FOR EACH ROW EXECUTE FUNCTION update_custom_roles_updated_at();
