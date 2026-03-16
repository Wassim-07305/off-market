-- ============================================================
-- Nested/Threaded Comments & Trending Posts
-- ============================================================

-- 1. Add reply_count to feed_comments for efficient display
ALTER TABLE feed_comments ADD COLUMN IF NOT EXISTS reply_count INTEGER DEFAULT 0;

-- 2. Backfill reply_count from existing data
UPDATE feed_comments c
SET reply_count = (
  SELECT COUNT(*) FROM feed_comments r WHERE r.parent_id = c.id
)
WHERE EXISTS (SELECT 1 FROM feed_comments r WHERE r.parent_id = c.id);

-- 3. Trigger to auto-update reply_count on child insert/delete
CREATE OR REPLACE FUNCTION update_comment_reply_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.parent_id IS NOT NULL THEN
    UPDATE feed_comments SET reply_count = reply_count + 1 WHERE id = NEW.parent_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' AND OLD.parent_id IS NOT NULL THEN
    UPDATE feed_comments SET reply_count = GREATEST(reply_count - 1, 0) WHERE id = OLD.parent_id;
    RETURN OLD;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_comment_reply_count ON feed_comments;
CREATE TRIGGER on_comment_reply_count
  AFTER INSERT OR DELETE ON feed_comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_reply_count();

-- 4. Index on parent_id (already exists from 007_feed, but ensure it)
CREATE INDEX IF NOT EXISTS idx_feed_comments_parent_id ON feed_comments(parent_id);

-- ─── TRENDING SCORE ──────────────────────

-- 5. Add trending_score to feed_posts
ALTER TABLE feed_posts ADD COLUMN IF NOT EXISTS trending_score NUMERIC DEFAULT 0;

-- 6. Function to calculate trending_score
-- Formula: likes * 2 + comments * 3 + recency factor (decays over 48h)
CREATE OR REPLACE FUNCTION calculate_trending_score(
  p_likes_count INTEGER,
  p_comments_count INTEGER,
  p_created_at TIMESTAMPTZ
) RETURNS NUMERIC AS $$
DECLARE
  age_hours NUMERIC;
  recency_factor NUMERIC;
BEGIN
  age_hours := EXTRACT(EPOCH FROM (now() - p_created_at)) / 3600.0;
  -- Recency factor: 100 at t=0, decays to ~0 after 48h (exponential decay)
  recency_factor := 100.0 * EXP(-0.1 * age_hours);
  RETURN (p_likes_count * 2) + (p_comments_count * 3) + recency_factor;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 7. Trigger to recalculate trending_score on post update (likes/comments change)
CREATE OR REPLACE FUNCTION update_post_trending_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.trending_score := calculate_trending_score(NEW.likes_count, NEW.comments_count, NEW.created_at);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_post_trending_recalc ON feed_posts;
CREATE TRIGGER on_post_trending_recalc
  BEFORE INSERT OR UPDATE OF likes_count, comments_count ON feed_posts
  FOR EACH ROW EXECUTE FUNCTION update_post_trending_score();

-- 8. Backfill trending_score for existing posts
UPDATE feed_posts
SET trending_score = calculate_trending_score(likes_count, comments_count, created_at);

-- 9. Index for trending queries
CREATE INDEX IF NOT EXISTS idx_feed_posts_trending_score ON feed_posts(trending_score DESC);
