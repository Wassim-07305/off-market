-- 050: Enhanced onboarding — step tracking + CSM welcome videos

-- ─── onboarding_steps: granular step tracking ────────────────────
CREATE TABLE IF NOT EXISTS onboarding_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  step_key text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  data jsonb DEFAULT '{}',
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE (profile_id, step_key)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_steps_profile
  ON onboarding_steps(profile_id);

-- RLS
ALTER TABLE onboarding_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own onboarding steps"
  ON onboarding_steps
  FOR ALL
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Staff can view all onboarding steps"
  ON onboarding_steps
  FOR SELECT
  USING (get_my_role() IN ('admin', 'coach'));

-- ─── csm_welcome_videos: personalized coach intro videos ────────
CREATE TABLE IF NOT EXISTS csm_welcome_videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  video_url text NOT NULL,
  thumbnail_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_csm_welcome_videos_coach
  ON csm_welcome_videos(coach_id);

-- RLS
ALTER TABLE csm_welcome_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view active CSM videos"
  ON csm_welcome_videos
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Coaches manage own welcome videos"
  ON csm_welcome_videos
  FOR ALL
  USING (auth.uid() = coach_id)
  WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Admins manage all CSM videos"
  ON csm_welcome_videos
  FOR ALL
  USING (get_my_role() = 'admin');
