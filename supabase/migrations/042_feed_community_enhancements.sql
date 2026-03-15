-- ============================================================
-- Feed & Community Enhancements (BigPlan Section 11)
-- ============================================================

-- 1. Expand post_type constraint to allow 'resource' and 'off_topic'
ALTER TABLE feed_posts DROP CONSTRAINT IF EXISTS feed_posts_post_type_check;
ALTER TABLE feed_posts ADD CONSTRAINT feed_posts_post_type_check
  CHECK (post_type IN ('victory', 'question', 'experience', 'general', 'resource', 'off_topic'));

-- 2. Add win_data column if not exists (structured win posts)
ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS win_data jsonb;

-- 3. Add category column if not exists (already in 039)
ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS category text DEFAULT 'general'
  CHECK (category IN ('general', 'wins', 'questions', 'resources', 'off_topic'));

-- 4. Add niche column to profiles for member directory
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS niche text;

-- 5. XP transaction on like (trigger: +1 XP to post author when liked)
CREATE OR REPLACE FUNCTION feed_like_xp_reward()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Award 1 XP to the post author (not the liker)
    INSERT INTO xp_transactions (profile_id, action, xp_amount, metadata)
    SELECT fp.author_id, 'feed_like_received', 1,
           jsonb_build_object('post_id', NEW.post_id, 'liker_id', NEW.profile_id)
    FROM feed_posts fp
    WHERE fp.id = NEW.post_id
      AND fp.author_id != NEW.profile_id; -- Don't give XP for self-likes
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_feed_like_xp ON feed_likes;
CREATE TRIGGER on_feed_like_xp
  AFTER INSERT ON feed_likes
  FOR EACH ROW EXECUTE FUNCTION feed_like_xp_reward();

-- 6. Index for niche search in member directory
CREATE INDEX IF NOT EXISTS idx_profiles_niche ON profiles(niche) WHERE niche IS NOT NULL;
