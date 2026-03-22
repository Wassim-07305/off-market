-- ============================================================
-- Migration: Add SMART goal fields + ensure lesson time tracking
-- ============================================================

-- 1. Add SMART fields to coaching_goals
ALTER TABLE coaching_goals
  ADD COLUMN IF NOT EXISTS difficulty smallint CHECK (difficulty >= 1 AND difficulty <= 5),
  ADD COLUMN IF NOT EXISTS coach_notes text,
  ADD COLUMN IF NOT EXISTS milestones jsonb DEFAULT '[]'::jsonb;

COMMENT ON COLUMN coaching_goals.difficulty IS 'SMART: Atteignable - difficulty rating 1-5';
COMMENT ON COLUMN coaching_goals.coach_notes IS 'SMART: Realiste - coach notes on why goal is realistic';
COMMENT ON COLUMN coaching_goals.milestones IS 'Array of {id, title, completed, due_date} milestone objects';

-- 2. Ensure lesson_progress.time_spent column exists (should already exist, but safe check)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'lesson_progress' AND column_name = 'time_spent'
  ) THEN
    ALTER TABLE lesson_progress ADD COLUMN time_spent integer DEFAULT 0;
  END IF;
END $$;
