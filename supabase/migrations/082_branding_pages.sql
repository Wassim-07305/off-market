-- 082_branding_pages.sql
-- Feature 1: Branded login/landing pages
-- Feature 2: Asynchronous video responses
-- Feature 3: External embeds in LMS

-- ============================================================================
-- Feature 1: Branding enhancements
-- ============================================================================

ALTER TABLE branding_settings
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS auth_background_url TEXT,
  ADD COLUMN IF NOT EXISTS landing_enabled BOOLEAN DEFAULT false;

-- ============================================================================
-- Feature 2: Asynchronous video responses
-- ============================================================================

CREATE TABLE IF NOT EXISTS video_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  related_type TEXT NOT NULL CHECK (related_type IN ('call', 'coaching_session', 'question')),
  related_id UUID,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration INT,
  message TEXT,
  viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_video_responses_sender ON video_responses(sender_id);
CREATE INDEX IF NOT EXISTS idx_video_responses_recipient ON video_responses(recipient_id);
CREATE INDEX IF NOT EXISTS idx_video_responses_related ON video_responses(related_type, related_id);

-- RLS
ALTER TABLE video_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own video responses"
  ON video_responses FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert video responses"
  ON video_responses FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Sender can update their video responses"
  ON video_responses FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Sender can delete their video responses"
  ON video_responses FOR DELETE
  USING (auth.uid() = sender_id);

-- ============================================================================
-- Feature 3: External embeds in LMS
-- ============================================================================

ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS embed_url TEXT,
  ADD COLUMN IF NOT EXISTS embed_type TEXT CHECK (embed_type IN ('figma', 'miro', 'google_docs', 'canva', 'notion', 'generic'));
