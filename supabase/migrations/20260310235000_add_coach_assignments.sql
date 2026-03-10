-- ============================================================
-- Migration: coach_assignments
-- Description: Table d'assignation coach <-> client avec RLS
-- ============================================================

-- Table coach_assignments
CREATE TABLE IF NOT EXISTS coach_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended')),
  notes text,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (coach_id, client_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coach_assignments_coach_id ON coach_assignments(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_assignments_client_id ON coach_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_coach_assignments_status ON coach_assignments(status);

-- Enable RLS
ALTER TABLE coach_assignments ENABLE ROW LEVEL SECURITY;

-- Policy: admins can do everything
CREATE POLICY "admin_full_access_coach_assignments"
  ON coach_assignments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: coaches can view their own assignments
CREATE POLICY "coach_select_own_assignments"
  ON coach_assignments
  FOR SELECT
  TO authenticated
  USING (
    coach_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'coach'
    )
  );

-- Policy: coaches can update their own assignments (notes, status)
CREATE POLICY "coach_update_own_assignments"
  ON coach_assignments
  FOR UPDATE
  TO authenticated
  USING (
    coach_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'coach'
    )
  )
  WITH CHECK (
    coach_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'coach'
    )
  );

-- Policy: clients can view their own assignment
CREATE POLICY "client_select_own_assignment"
  ON coach_assignments
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'client'
    )
  );

-- Trigger: auto-update updated_at
CREATE OR REPLACE FUNCTION update_coach_assignments_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER coach_assignments_updated_at
  BEFORE UPDATE ON coach_assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_coach_assignments_updated_at();
