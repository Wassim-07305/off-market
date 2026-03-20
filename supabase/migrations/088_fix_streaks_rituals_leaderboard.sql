-- ═══════════════════════════════════════════════════════════════
-- 088 — Fix missing tables: streaks, daily_activity, rituals
--       + update leaderboard view to include prospect role
-- Idempotent: safe to re-run
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. STREAKS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.streaks (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id         UUID         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak     INTEGER      NOT NULL DEFAULT 0,
  longest_streak     INTEGER      NOT NULL DEFAULT 0,
  last_activity_date DATE,
  xp_multiplier      NUMERIC(3,2) NOT NULL DEFAULT 1.00,
  total_active_days  INTEGER      NOT NULL DEFAULT 0,
  updated_at         TIMESTAMPTZ  DEFAULT now(),
  UNIQUE(profile_id)
);

-- If table existed with user_id instead of profile_id, add the missing column
ALTER TABLE public.streaks ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.streaks ADD COLUMN IF NOT EXISTS current_streak     INTEGER      NOT NULL DEFAULT 0;
ALTER TABLE public.streaks ADD COLUMN IF NOT EXISTS longest_streak     INTEGER      NOT NULL DEFAULT 0;
ALTER TABLE public.streaks ADD COLUMN IF NOT EXISTS last_activity_date DATE;
ALTER TABLE public.streaks ADD COLUMN IF NOT EXISTS xp_multiplier      NUMERIC(3,2) NOT NULL DEFAULT 1.00;
ALTER TABLE public.streaks ADD COLUMN IF NOT EXISTS total_active_days  INTEGER      NOT NULL DEFAULT 0;
ALTER TABLE public.streaks ADD COLUMN IF NOT EXISTS updated_at         TIMESTAMPTZ  DEFAULT now();

ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own streak"    ON public.streaks;
DROP POLICY IF EXISTS "System can manage streaks" ON public.streaks;
DROP POLICY IF EXISTS "Staff view all streaks"   ON public.streaks;

CREATE POLICY "Users view own streak" ON public.streaks
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Staff view all streaks" ON public.streaks
  FOR SELECT USING (get_my_role() IN ('admin', 'coach'));
CREATE POLICY "System can manage streaks" ON public.streaks
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_streaks_profile ON public.streaks(profile_id);

-- ─── 2. DAILY_ACTIVITY ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_activity (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_date DATE        NOT NULL DEFAULT CURRENT_DATE,
  actions       JSONB       DEFAULT '[]',
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id, activity_date)
);

-- If table existed with user_id or missing columns, patch it
ALTER TABLE public.daily_activity ADD COLUMN IF NOT EXISTS profile_id    UUID  REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.daily_activity ADD COLUMN IF NOT EXISTS activity_date DATE  NOT NULL DEFAULT CURRENT_DATE;
ALTER TABLE public.daily_activity ADD COLUMN IF NOT EXISTS actions       JSONB DEFAULT '[]';

ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own activity"    ON public.daily_activity;
DROP POLICY IF EXISTS "System can manage activity" ON public.daily_activity;
DROP POLICY IF EXISTS "Staff view all activity"    ON public.daily_activity;

CREATE POLICY "Users view own activity" ON public.daily_activity
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Staff view all activity" ON public.daily_activity
  FOR SELECT USING (get_my_role() IN ('admin', 'coach'));
CREATE POLICY "System can manage activity" ON public.daily_activity
  FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_daily_activity_profile_date
  ON public.daily_activity(profile_id, activity_date DESC);

-- ─── 3. RITUALS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.rituals (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title             TEXT        NOT NULL,
  description       TEXT,
  frequency         TEXT        NOT NULL DEFAULT 'quotidien',
  time_of_day       TEXT,
  is_active         BOOLEAN     NOT NULL DEFAULT true,
  streak_count      INTEGER     NOT NULL DEFAULT 0,
  last_completed_at TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- If table existed with user_id or missing columns, patch it
ALTER TABLE public.rituals ADD COLUMN IF NOT EXISTS profile_id        UUID        REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.rituals ADD COLUMN IF NOT EXISTS time_of_day       TEXT;
ALTER TABLE public.rituals ADD COLUMN IF NOT EXISTS streak_count      INTEGER     NOT NULL DEFAULT 0;
ALTER TABLE public.rituals ADD COLUMN IF NOT EXISTS last_completed_at TIMESTAMPTZ;
ALTER TABLE public.rituals ADD COLUMN IF NOT EXISTS is_active         BOOLEAN     NOT NULL DEFAULT true;

ALTER TABLE public.rituals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own rituals" ON public.rituals;
DROP POLICY IF EXISTS "Staff view all rituals"   ON public.rituals;
-- Clean up old policies from migrations 002/007 that may conflict
DROP POLICY IF EXISTS "rituals_admin_manager" ON public.rituals;
DROP POLICY IF EXISTS "rituals_assigned"      ON public.rituals;
DROP POLICY IF EXISTS "rituals_admin"         ON public.rituals;
DROP POLICY IF EXISTS "rituals_own"           ON public.rituals;

CREATE POLICY "Users manage own rituals" ON public.rituals
  FOR ALL USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Staff view all rituals" ON public.rituals
  FOR SELECT USING (get_my_role() IN ('admin', 'coach'));

CREATE INDEX IF NOT EXISTS idx_rituals_profile ON public.rituals(profile_id);
CREATE INDEX IF NOT EXISTS idx_rituals_active  ON public.rituals(profile_id) WHERE is_active = true;

-- ─── 4. RECORD_ACTIVITY FUNCTION ─────────────────────────────
CREATE OR REPLACE FUNCTION public.record_activity(
  p_profile_id UUID,
  p_action     TEXT DEFAULT 'login'
) RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_today      DATE         := CURRENT_DATE;
  v_streak     RECORD;
  v_new_streak INTEGER;
  v_multiplier NUMERIC(3,2);
BEGIN
  INSERT INTO daily_activity (profile_id, activity_date, actions)
  VALUES (p_profile_id, v_today, jsonb_build_array(p_action))
  ON CONFLICT (profile_id, activity_date)
  DO UPDATE SET actions = daily_activity.actions || jsonb_build_array(p_action);

  INSERT INTO streaks (profile_id)
  VALUES (p_profile_id)
  ON CONFLICT (profile_id) DO NOTHING;

  SELECT * INTO v_streak FROM streaks WHERE profile_id = p_profile_id FOR UPDATE;

  IF v_streak.last_activity_date = v_today THEN
    RETURN jsonb_build_object(
      'current_streak',   v_streak.current_streak,
      'longest_streak',   v_streak.longest_streak,
      'multiplier',       v_streak.xp_multiplier,
      'already_recorded', true
    );
  ELSIF v_streak.last_activity_date = v_today - 1 THEN
    v_new_streak := v_streak.current_streak + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  v_multiplier := CASE
    WHEN v_new_streak >= 30 THEN 2.00
    WHEN v_new_streak >= 14 THEN 1.75
    WHEN v_new_streak >= 7  THEN 1.50
    WHEN v_new_streak >= 3  THEN 1.25
    ELSE 1.00
  END;

  UPDATE streaks SET
    current_streak     = v_new_streak,
    longest_streak     = GREATEST(v_streak.longest_streak, v_new_streak),
    last_activity_date = v_today,
    xp_multiplier      = v_multiplier,
    total_active_days  = v_streak.total_active_days + 1,
    updated_at         = now()
  WHERE profile_id = p_profile_id;

  RETURN jsonb_build_object(
    'current_streak',   v_new_streak,
    'longest_streak',   GREATEST(v_streak.longest_streak, v_new_streak),
    'multiplier',       v_multiplier,
    'streak_increased', true
  );
END;
$$;

-- ─── 5. LEADERBOARD VIEW — inclure prospect ──────────────────
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  p.id AS profile_id,
  CASE WHEN COALESCE(p.leaderboard_anonymous, false)
    THEN COALESCE(p.anonymous_alias, 'Anonyme')
    ELSE p.full_name
  END AS full_name,
  CASE WHEN COALESCE(p.leaderboard_anonymous, false)
    THEN NULL
    ELSE p.avatar_url
  END AS avatar_url,
  COALESCE(SUM(xt.xp_amount), 0)::INTEGER AS total_xp,
  COUNT(DISTINCT ub.badge_id)::INTEGER     AS badge_count,
  RANK() OVER (
    ORDER BY COALESCE(SUM(xt.xp_amount), 0) DESC
  )::INTEGER AS rank
FROM public.profiles p
LEFT JOIN public.xp_transactions xt ON xt.profile_id = p.id
LEFT JOIN public.user_badges     ub ON ub.profile_id  = p.id
WHERE p.role IN ('client', 'prospect')
GROUP BY
  p.id,
  p.full_name,
  p.avatar_url,
  p.leaderboard_anonymous,
  p.anonymous_alias;
