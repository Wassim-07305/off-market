-- 044: Add is_urgent flag to messages for urgent message system
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_urgent BOOLEAN DEFAULT false;

-- Index for efficient urgent message queries
CREATE INDEX IF NOT EXISTS idx_messages_is_urgent ON messages (channel_id, is_urgent) WHERE is_urgent = true;

-- Index for archived channel filtering (already exists in schema but add index)
CREATE INDEX IF NOT EXISTS idx_channels_is_archived ON channels (is_archived);

-- Index for muted notifications
CREATE INDEX IF NOT EXISTS idx_channel_members_muted ON channel_members (profile_id, notifications_muted) WHERE notifications_muted = true;
