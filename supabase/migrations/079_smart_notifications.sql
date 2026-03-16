-- 079: Smart Notification Batching & Analytics
-- Adds priority, batching, tracking columns + notification_preferences table + analytics view

-- ═══════════════════════════════════════════
-- Feature 1: Notification Batching
-- ═══════════════════════════════════════════

-- Add priority, batch, and tracking columns to notifications
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'normal',
  ADD COLUMN IF NOT EXISTS batched_at timestamptz,
  ADD COLUMN IF NOT EXISTS batch_id uuid;

-- Priority check constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'notifications_priority_check'
  ) THEN
    ALTER TABLE notifications
      ADD CONSTRAINT notifications_priority_check
      CHECK (priority IN ('critical', 'high', 'normal', 'low'));
  END IF;
END $$;

-- Index for batch processing: unbatched notifications by user
CREATE INDEX IF NOT EXISTS idx_notifications_batch_pending
  ON notifications (recipient_id, created_at DESC)
  WHERE batched_at IS NULL AND batch_id IS NULL;

-- Index for batch grouping
CREATE INDEX IF NOT EXISTS idx_notifications_batch_id
  ON notifications (batch_id)
  WHERE batch_id IS NOT NULL;

-- ═══════════════════════════════════════════
-- Notification Preferences table
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiet_hours_start time NOT NULL DEFAULT '22:00',
  quiet_hours_end time NOT NULL DEFAULT '08:00',
  batch_frequency text NOT NULL DEFAULT 'instant'
    CHECK (batch_frequency IN ('instant', 'hourly', 'daily')),
  priority_threshold text NOT NULL DEFAULT 'all'
    CHECK (priority_threshold IN ('all', 'high', 'critical')),
  email_digest boolean NOT NULL DEFAULT true,
  push_enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Users can read their own preferences
CREATE POLICY "Users can view own notification_preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own notification_preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own notification_preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-create preferences when a profile is created
CREATE OR REPLACE FUNCTION ensure_notification_preferences()
RETURNS trigger AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_ensure_notification_preferences ON profiles;
CREATE TRIGGER trg_ensure_notification_preferences
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION ensure_notification_preferences();

-- Updated_at trigger
DROP TRIGGER IF EXISTS set_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER set_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- ═══════════════════════════════════════════
-- Feature 2: Notification Analytics
-- ═══════════════════════════════════════════

-- Add delivery/engagement tracking columns
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz,
  ADD COLUMN IF NOT EXISTS opened_at timestamptz,
  ADD COLUMN IF NOT EXISTS clicked_at timestamptz;

-- Index for analytics: opened_at for open rate calculation
CREATE INDEX IF NOT EXISTS idx_notifications_opened
  ON notifications (opened_at)
  WHERE opened_at IS NOT NULL;

-- Index for analytics: type + created_at for aggregation
CREATE INDEX IF NOT EXISTS idx_notifications_type_created
  ON notifications (type, created_at DESC);

-- Analytics view: aggregated stats by type and date
CREATE OR REPLACE VIEW notification_analytics AS
SELECT
  type,
  DATE(created_at) AS date,
  COUNT(*) AS count_sent,
  COUNT(delivered_at) AS count_delivered,
  COUNT(opened_at) AS count_opened,
  COUNT(clicked_at) AS count_clicked,
  CASE WHEN COUNT(*) > 0
    THEN ROUND((COUNT(opened_at)::numeric / COUNT(*)::numeric) * 100, 1)
    ELSE 0
  END AS open_rate,
  CASE WHEN COUNT(*) > 0
    THEN ROUND((COUNT(clicked_at)::numeric / COUNT(*)::numeric) * 100, 1)
    ELSE 0
  END AS click_rate
FROM notifications
GROUP BY type, DATE(created_at);
