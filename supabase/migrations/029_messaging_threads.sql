-- Sprint 17: Messaging enhancements — threads + scheduled messages

-- Thread support: count replies per parent message (materialized for perf)
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS reply_count integer DEFAULT 0;

-- Scheduled messages
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS scheduled_at timestamptz DEFAULT null;

-- Function to increment reply_count on parent when a reply is inserted
CREATE OR REPLACE FUNCTION update_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reply_to IS NOT NULL THEN
    UPDATE messages SET reply_count = reply_count + 1 WHERE id = NEW.reply_to;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_reply_count
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_reply_count();

-- Decrement on soft-delete
CREATE OR REPLACE FUNCTION decrement_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL AND NEW.reply_to IS NOT NULL THEN
    UPDATE messages SET reply_count = GREATEST(reply_count - 1, 0) WHERE id = NEW.reply_to;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_decrement_reply_count
  AFTER UPDATE OF deleted_at ON messages
  FOR EACH ROW
  EXECUTE FUNCTION decrement_reply_count();

-- Index for fetching thread replies
CREATE INDEX IF NOT EXISTS idx_messages_reply_to
  ON messages(reply_to) WHERE reply_to IS NOT NULL;

-- Index for scheduled messages
CREATE INDEX IF NOT EXISTS idx_messages_scheduled_at
  ON messages(scheduled_at) WHERE scheduled_at IS NOT NULL;
