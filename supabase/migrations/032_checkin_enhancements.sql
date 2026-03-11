-- Migration 032: Checkin enhancements
-- Adds energy level, gratitudes, daily goals, and notes to weekly check-ins

-- New columns
ALTER TABLE weekly_checkins
  ADD COLUMN IF NOT EXISTS energy integer CHECK (energy BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS gratitudes text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS daily_goals text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS notes text;

-- Index for faster heatmap queries (recent checkins by client)
CREATE INDEX IF NOT EXISTS idx_weekly_checkins_client_created
  ON weekly_checkins (client_id, created_at DESC);
