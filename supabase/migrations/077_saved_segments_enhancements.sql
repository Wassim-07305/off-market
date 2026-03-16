-- Migration 077: Enhance saved_segments — admin policy, color column
-- Off-Market CRM segments feature

-- Add color column for visual segment identification
ALTER TABLE saved_segments ADD COLUMN IF NOT EXISTS color TEXT DEFAULT 'zinc';

-- Admin can see and manage all segments
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'saved_segments_admin_all' AND tablename = 'saved_segments'
  ) THEN
    CREATE POLICY "saved_segments_admin_all" ON saved_segments
      FOR ALL USING (
        EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
      );
  END IF;
END $$;

-- Index on is_shared for faster shared segment queries
CREATE INDEX IF NOT EXISTS idx_saved_segments_shared ON saved_segments(is_shared) WHERE is_shared = true;
