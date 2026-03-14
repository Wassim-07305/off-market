-- ============================================================
-- Migration: 044_csm_enhancements
-- Description: Ajout de assigned_by + contrainte unique active par client
-- ============================================================

-- Add assigned_by column if missing
ALTER TABLE coach_assignments
  ADD COLUMN IF NOT EXISTS assigned_by uuid REFERENCES profiles(id) ON DELETE SET NULL;

-- Create a unique partial index: one active assignment per client
-- (allows ended/paused duplicates, but only one active row per client)
CREATE UNIQUE INDEX IF NOT EXISTS idx_coach_assignments_unique_active_client
  ON coach_assignments (client_id)
  WHERE status = 'active';
