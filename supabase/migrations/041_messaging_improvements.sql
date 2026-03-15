-- ============================================================
-- Sprint: Messaging improvements
-- Reactions, pins, bookmarks, replies, search enhancements
-- ============================================================

-- 1. Message reactions table (may already exist — IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS message_reactions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(message_id, profile_id, emoji)
);

ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist before recreating
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can manage their reactions" ON message_reactions;
  DROP POLICY IF EXISTS "Users can view reactions" ON message_reactions;
  DROP POLICY IF EXISTS "Authenticated users can manage reactions" ON message_reactions;
  DROP POLICY IF EXISTS "Anyone can view reactions" ON message_reactions;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

CREATE POLICY "Authenticated users can manage reactions" ON message_reactions
  FOR ALL USING (auth.uid() = profile_id);
CREATE POLICY "Anyone can view reactions" ON message_reactions
  FOR SELECT USING (true);

-- 2. Message pins — add pinned_by and pinned_at columns
ALTER TABLE messages ADD COLUMN IF NOT EXISTS pinned_by uuid REFERENCES auth.users(id);
ALTER TABLE messages ADD COLUMN IF NOT EXISTS pinned_at timestamptz;

-- 3. Message replies — reply_to column (may already exist from migration 029)
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reply_to_id uuid REFERENCES messages(id);

-- 4. Message bookmarks table (may already exist from migration 039)
CREATE TABLE IF NOT EXISTS message_bookmarks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, message_id)
);

ALTER TABLE message_bookmarks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users manage own bookmarks" ON message_bookmarks;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

CREATE POLICY "Users manage own bookmarks" ON message_bookmarks
  FOR ALL USING (auth.uid() = user_id);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id
  ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_profile
  ON message_reactions(profile_id);
CREATE INDEX IF NOT EXISTS idx_message_bookmarks_user
  ON message_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_message_bookmarks_message
  ON message_bookmarks(message_id);
CREATE INDEX IF NOT EXISTS idx_messages_pinned
  ON messages(is_pinned) WHERE is_pinned = true;
CREATE INDEX IF NOT EXISTS idx_messages_content_trgm
  ON messages USING gin(content gin_trgm_ops);

-- 6. Full-text search support for messages (French)
CREATE INDEX IF NOT EXISTS idx_messages_fts
  ON messages USING gin(to_tsvector('french', coalesce(content, '')));

-- 7. Add realtime for bookmarks
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.message_bookmarks;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
