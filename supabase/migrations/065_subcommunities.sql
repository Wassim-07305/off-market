-- ═══════════════════════════════════════════════════════════
-- 065: Sub-communities (thematic groups)
-- ═══════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.communities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT UNIQUE NOT NULL,
  icon TEXT, -- emoji or lucide icon name
  color TEXT DEFAULT '#ef4444', -- hex color for theming
  is_private BOOLEAN DEFAULT false,
  max_members INTEGER,
  created_by UUID REFERENCES auth.users(id),
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- 'admin' | 'moderator' | 'member'
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(community_id, user_id)
);

-- ─── RLS ─────────────────────────────────────────────────

ALTER TABLE public.communities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

-- Anyone can see public communities
CREATE POLICY "communities_select" ON public.communities FOR SELECT
  USING (is_private = false OR EXISTS (
    SELECT 1 FROM public.community_members WHERE community_id = id AND user_id = auth.uid()
  ));

-- Admin/coach can create
CREATE POLICY "communities_insert" ON public.communities FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','coach')));

-- Creator or admin can update
CREATE POLICY "communities_update" ON public.communities FOR UPDATE
  USING (created_by = auth.uid() OR EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin'));

-- Members can see their memberships
CREATE POLICY "members_select" ON public.community_members FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.community_members cm WHERE cm.community_id = community_id AND cm.user_id = auth.uid()
  ));

-- Admin/coach can manage members
CREATE POLICY "members_manage" ON public.community_members FOR ALL
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('admin','coach')));

-- Allow users to join public communities
CREATE POLICY "members_join" ON public.community_members FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (SELECT 1 FROM public.communities WHERE id = community_id AND is_private = false)
  );

-- Allow users to leave
CREATE POLICY "members_leave" ON public.community_members FOR DELETE
  USING (user_id = auth.uid());

-- ─── Link feed posts to communities ──────────────────────

ALTER TABLE public.feed_posts ADD COLUMN IF NOT EXISTS community_id UUID REFERENCES public.communities(id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_community ON public.feed_posts(community_id) WHERE community_id IS NOT NULL;

-- ─── Indexes ─────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_communities_slug ON public.communities(slug);
CREATE INDEX IF NOT EXISTS idx_communities_created_by ON public.communities(created_by);
CREATE INDEX IF NOT EXISTS idx_community_members_user ON public.community_members(user_id);
CREATE INDEX IF NOT EXISTS idx_community_members_community ON public.community_members(community_id);

-- ─── Member count trigger ────────────────────────────────

CREATE OR REPLACE FUNCTION public.update_community_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.communities SET member_count = member_count + 1 WHERE id = NEW.community_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.communities SET member_count = GREATEST(member_count - 1, 0) WHERE id = OLD.community_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_community_member_count
AFTER INSERT OR DELETE ON public.community_members
FOR EACH ROW EXECUTE FUNCTION public.update_community_member_count();
