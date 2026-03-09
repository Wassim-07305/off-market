-- Sprint 18: Système de notifications avancé
-- Add category, action_url, and is_archived columns to notifications

ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'general',
  ADD COLUMN IF NOT EXISTS action_url text,
  ADD COLUMN IF NOT EXISTS is_archived boolean NOT NULL DEFAULT false;

-- Add constraint for valid categories
ALTER TABLE notifications
  ADD CONSTRAINT notifications_category_check
  CHECK (category IN ('general', 'messaging', 'billing', 'coaching', 'gamification', 'system'));

-- Index for efficient queries: unread notifications by recipient, ordered by date
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read_created
  ON notifications (recipient_id, is_read, created_at DESC);

-- Index for category filtering
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_category
  ON notifications (recipient_id, category, created_at DESC);

-- Index for archived filtering
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_archived
  ON notifications (recipient_id, is_archived, created_at DESC);
