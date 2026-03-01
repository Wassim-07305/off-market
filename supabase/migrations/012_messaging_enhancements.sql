-- Migration 012: Messaging enhancements for Slack-like UI
-- Adds 'audio' content_type, reactions realtime, reaction index

-- 1. Add 'audio' to the content_type CHECK constraint on messages
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_content_type_check;
ALTER TABLE public.messages ADD CONSTRAINT messages_content_type_check
  CHECK (content_type IN ('text', 'image', 'file', 'video', 'audio', 'system'));

-- 2. Add message_reactions to realtime publication
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;
EXCEPTION WHEN duplicate_object THEN
  NULL; -- already added
END $$;

-- 3. Index for faster reaction lookups
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id
  ON public.message_reactions(message_id);
