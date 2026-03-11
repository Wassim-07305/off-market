-- ═══════════════════════════════════════
-- OFF MARKET — FEED COMMUNAUTAIRE
-- ═══════════════════════════════════════

-- ─── FEED POSTS ───────────────────────
CREATE TABLE public.feed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  post_type TEXT NOT NULL DEFAULT 'general' CHECK (post_type IN ('victory', 'question', 'experience', 'general')),
  media_urls TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── FEED LIKES ───────────────────────
CREATE TABLE public.feed_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, profile_id)
);

-- ─── FEED COMMENTS ────────────────────
CREATE TABLE public.feed_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES public.feed_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── TRIGGERS: LIKE COUNT ─────────────
CREATE OR REPLACE FUNCTION update_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feed_posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feed_posts SET likes_count = GREATEST(likes_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_feed_like_change
  AFTER INSERT OR DELETE ON public.feed_likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes_count();

-- ─── TRIGGERS: COMMENT COUNT ──────────
CREATE OR REPLACE FUNCTION update_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feed_posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.feed_posts SET comments_count = GREATEST(comments_count - 1, 0) WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_feed_comment_change
  AFTER INSERT OR DELETE ON public.feed_comments
  FOR EACH ROW EXECUTE FUNCTION update_post_comments_count();

-- ─── UPDATED_AT TRIGGERS ──────────────
CREATE TRIGGER update_feed_posts_updated_at BEFORE UPDATE ON public.feed_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feed_comments_updated_at BEFORE UPDATE ON public.feed_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── RLS POLICIES ─────────────────────
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feed_comments ENABLE ROW LEVEL SECURITY;

-- Posts: all authenticated can read, authors can edit/delete, admin/coach can pin/delete all
CREATE POLICY "Authenticated users can view all posts"
  ON public.feed_posts FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create posts"
  ON public.feed_posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own posts"
  ON public.feed_posts FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete own posts"
  ON public.feed_posts FOR DELETE
  USING (auth.uid() = author_id);

CREATE POLICY "Staff can manage all posts"
  ON public.feed_posts FOR ALL
  USING (get_my_role() IN ('admin', 'coach'))
  WITH CHECK (get_my_role() IN ('admin', 'coach'));

-- Likes: all authenticated can like/unlike
CREATE POLICY "Authenticated users can view likes"
  ON public.feed_likes FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can like posts"
  ON public.feed_likes FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can unlike posts"
  ON public.feed_likes FOR DELETE
  USING (auth.uid() = profile_id);

-- Comments: all authenticated can read, authors can edit/delete, staff can delete all
CREATE POLICY "Authenticated users can view comments"
  ON public.feed_comments FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create comments"
  ON public.feed_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can update own comments"
  ON public.feed_comments FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Authors can delete own comments"
  ON public.feed_comments FOR DELETE
  USING (auth.uid() = author_id);

CREATE POLICY "Staff can manage all comments"
  ON public.feed_comments FOR ALL
  USING (get_my_role() IN ('admin', 'coach'))
  WITH CHECK (get_my_role() IN ('admin', 'coach'));

-- ─── INDEXES ──────────────────────────
CREATE INDEX idx_feed_posts_author_id ON public.feed_posts(author_id);
CREATE INDEX idx_feed_posts_post_type ON public.feed_posts(post_type);
CREATE INDEX idx_feed_posts_created_at ON public.feed_posts(created_at DESC);
CREATE INDEX idx_feed_posts_is_pinned ON public.feed_posts(is_pinned) WHERE is_pinned = true;
CREATE INDEX idx_feed_likes_post_id ON public.feed_likes(post_id);
CREATE INDEX idx_feed_likes_profile_id ON public.feed_likes(profile_id);
CREATE INDEX idx_feed_comments_post_id ON public.feed_comments(post_id);
CREATE INDEX idx_feed_comments_parent_id ON public.feed_comments(parent_id);

-- ─── REALTIME ─────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.feed_comments;
