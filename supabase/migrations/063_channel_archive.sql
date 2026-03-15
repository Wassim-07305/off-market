-- Channel archive enhancements
-- Note: is_archived already exists on channels table (added in prior migration)
-- This adds archived_at, archived_by, and an index for archive queries

ALTER TABLE channels ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;
ALTER TABLE channels ADD COLUMN IF NOT EXISTS archived_by UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_channels_archived ON channels(is_archived) WHERE is_archived = true;
