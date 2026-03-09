-- Feed reports / moderation
CREATE TABLE public.feed_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.feed_comments(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason TEXT NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate', 'misinformation', 'other')),
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'actioned', 'dismissed')),
  action_taken TEXT CHECK (action_taken IN ('warning', 'content_removed', 'user_suspended', NULL)),
  reviewed_by UUID REFERENCES public.profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT report_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL)
    OR (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

CREATE INDEX idx_feed_reports_status ON public.feed_reports(status);
CREATE INDEX idx_feed_reports_post_id ON public.feed_reports(post_id) WHERE post_id IS NOT NULL;
CREATE INDEX idx_feed_reports_comment_id ON public.feed_reports(comment_id) WHERE comment_id IS NOT NULL;
CREATE INDEX idx_feed_reports_reporter ON public.feed_reports(reporter_id);

-- RLS
ALTER TABLE public.feed_reports ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can create a report
CREATE POLICY "Users can create reports"
  ON public.feed_reports FOR INSERT
  TO authenticated
  WITH CHECK (reporter_id = auth.uid());

-- Users can see their own reports
CREATE POLICY "Users can view own reports"
  ON public.feed_reports FOR SELECT
  TO authenticated
  USING (reporter_id = auth.uid());

-- Admin/coach can see all reports
CREATE POLICY "Staff can view all reports"
  ON public.feed_reports FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'coach')
    )
  );

-- Admin/coach can update reports (review/action)
CREATE POLICY "Staff can update reports"
  ON public.feed_reports FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'coach')
    )
  );
