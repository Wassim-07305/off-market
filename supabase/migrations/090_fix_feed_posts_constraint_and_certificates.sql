-- ═══════════════════════════════════════════════════════════════
-- 090 — Fix feed_posts post_type constraint + ensure certificates
-- Idempotent: safe to re-run
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. FEED POSTS — expand post_type constraint ──────────────
-- Drop old constraint (created in 007 with only 4 values)
ALTER TABLE public.feed_posts DROP CONSTRAINT IF EXISTS feed_posts_post_type_check;

-- Recreate with all 6 valid values
ALTER TABLE public.feed_posts ADD CONSTRAINT feed_posts_post_type_check
  CHECK (post_type IN ('victory', 'question', 'experience', 'general', 'resource', 'off_topic'));

-- Ensure win_data and category columns exist (from 042)
ALTER TABLE public.feed_posts ADD COLUMN IF NOT EXISTS win_data  JSONB;
ALTER TABLE public.feed_posts ADD COLUMN IF NOT EXISTS category  TEXT DEFAULT 'general'
  CHECK (category IN ('general', 'wins', 'questions', 'resources', 'off_topic'));

-- ─── 2. CERTIFICATES ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.certificates (
  id                 UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id         UUID         NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id          UUID         NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_number TEXT         NOT NULL UNIQUE,
  issued_at          TIMESTAMPTZ  DEFAULT now(),
  course_title       TEXT         NOT NULL,
  student_name       TEXT         NOT NULL,
  total_lessons      INT          NOT NULL DEFAULT 0,
  total_modules      INT          NOT NULL DEFAULT 0,
  quiz_average       NUMERIC(5,2),
  created_at         TIMESTAMPTZ  DEFAULT now(),
  UNIQUE(student_id, course_id)
);

CREATE INDEX IF NOT EXISTS idx_certificates_student ON public.certificates(student_id);
CREATE INDEX IF NOT EXISTS idx_certificates_course  ON public.certificates(course_id);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS certificates_select ON public.certificates;
DROP POLICY IF EXISTS certificates_insert ON public.certificates;
DROP POLICY IF EXISTS certificates_update ON public.certificates;

CREATE POLICY certificates_select ON public.certificates
  FOR SELECT USING (
    student_id = auth.uid()
    OR get_my_role() IN ('admin', 'coach')
  );

CREATE POLICY certificates_insert ON public.certificates
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- ─── 3. CERTIFICATE NOTIFICATION TRIGGER ────────────────────
CREATE OR REPLACE FUNCTION public.notify_certificate_issued()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (recipient_id, type, title, body, data)
  VALUES (
    NEW.student_id,
    'badge',
    'Certificat obtenu !',
    'Felicitations ! Tu as obtenu le certificat pour "' || NEW.course_title || '"',
    jsonb_build_object('certificate_id', NEW.id, 'course_id', NEW.course_id)
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_certificate_issued ON public.certificates;
CREATE TRIGGER on_certificate_issued
  AFTER INSERT ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.notify_certificate_issued();

-- ─── 4. XP CONFIG ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.xp_config (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  action      TEXT    NOT NULL UNIQUE,
  xp_amount   INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.xp_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All can read xp_config"    ON public.xp_config;
DROP POLICY IF EXISTS "Staff can manage xp_config" ON public.xp_config;

CREATE POLICY "All can read xp_config" ON public.xp_config
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage xp_config" ON public.xp_config
  FOR ALL USING (get_my_role() IN ('admin', 'coach'))
  WITH CHECK (get_my_role() IN ('admin', 'coach'));

INSERT INTO public.xp_config (action, xp_amount, description) VALUES
  ('complete_module',  50,  'Completer une lecon de formation'),
  ('complete_course',  200, 'Obtenir le certificat de fin de formation'),
  ('daily_checkin',    20,  'Faire son check-in quotidien'),
  ('journal_entry',    15,  'Ecrire une entree de journal'),
  ('complete_ritual',  10,  'Completer un rituel'),
  ('login',            5,   'Se connecter a la plateforme')
ON CONFLICT (action) DO UPDATE
  SET xp_amount   = EXCLUDED.xp_amount,
      description = EXCLUDED.description,
      is_active   = true;

-- ─── 5. XP TRANSACTIONS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action     TEXT        NOT NULL,
  xp_amount  INTEGER     NOT NULL,
  metadata   JSONB       DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own xp"  ON public.xp_transactions;
DROP POLICY IF EXISTS "Staff can view all xp"  ON public.xp_transactions;
DROP POLICY IF EXISTS "System can insert xp"   ON public.xp_transactions;

CREATE POLICY "Users can view own xp" ON public.xp_transactions
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Staff can view all xp" ON public.xp_transactions
  FOR SELECT USING (get_my_role() IN ('admin', 'coach'));
CREATE POLICY "System can insert xp" ON public.xp_transactions
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_xp_transactions_profile
  ON public.xp_transactions(profile_id, created_at DESC);

-- ─── 6. LEVEL CONFIG ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.level_config (
  id      UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  level   INTEGER NOT NULL UNIQUE,
  name    TEXT    NOT NULL,
  min_xp  INTEGER NOT NULL,
  icon    TEXT    DEFAULT '⭐',
  color   TEXT    DEFAULT '#71717A'
);

ALTER TABLE public.level_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "All can read level_config"    ON public.level_config;
DROP POLICY IF EXISTS "Staff can manage level_config" ON public.level_config;

CREATE POLICY "All can read level_config" ON public.level_config
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage level_config" ON public.level_config
  FOR ALL USING (get_my_role() IN ('admin', 'coach'))
  WITH CHECK (get_my_role() IN ('admin', 'coach'));

INSERT INTO public.level_config (level, name, min_xp, icon, color) VALUES
  (1,  'Debutant',     0,    '🌱', '#71717A'),
  (2,  'Apprenti',     100,  '📚', '#84CC16'),
  (3,  'Progressant',  300,  '🔥', '#F97316'),
  (4,  'Confirme',     600,  '⚡', '#EAB308'),
  (5,  'Avance',       1000, '🎯', '#3B82F6'),
  (6,  'Expert',       1500, '💎', '#8B5CF6'),
  (7,  'Elite',        2500, '🏆', '#EC4899'),
  (8,  'Maitre',       4000, '👑', '#AF0000'),
  (9,  'Champion',     6000, '🌟', '#DC2626'),
  (10, 'Legende',      10000,'🦅', '#7F1D1D')
ON CONFLICT (level) DO NOTHING;

-- ─── 7. AWARD_XP FUNCTION ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.award_xp(
  p_profile_id UUID,
  p_action     TEXT,
  p_metadata   JSONB DEFAULT '{}'
) RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_xp         INTEGER;
  v_multiplier NUMERIC(3,2) := 1.00;
  v_final_xp   INTEGER;
BEGIN
  SELECT xp_amount INTO v_xp
  FROM xp_config
  WHERE action = p_action AND is_active = true;

  IF v_xp IS NULL THEN RETURN 0; END IF;

  BEGIN
    SELECT COALESCE(xp_multiplier, 1.00) INTO v_multiplier
    FROM streaks WHERE profile_id = p_profile_id;
  EXCEPTION WHEN undefined_table THEN
    v_multiplier := 1.00;
  END;
  IF v_multiplier IS NULL THEN v_multiplier := 1.00; END IF;

  v_final_xp := CEIL(v_xp * v_multiplier);

  INSERT INTO xp_transactions (profile_id, action, xp_amount, metadata)
  VALUES (
    p_profile_id,
    p_action,
    v_final_xp,
    p_metadata || jsonb_build_object('base_xp', v_xp, 'multiplier', v_multiplier)
  );

  BEGIN
    PERFORM record_activity(p_profile_id, p_action);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN v_final_xp;
END;
$$;

-- ─── 8. STREAKS ───────────────────────────────────────────────
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

ALTER TABLE public.streaks ADD COLUMN IF NOT EXISTS profile_id         UUID         REFERENCES public.profiles(id) ON DELETE CASCADE;
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

-- ─── 9. DAILY_ACTIVITY ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_activity (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id    UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_date DATE        NOT NULL DEFAULT CURRENT_DATE,
  actions       JSONB       DEFAULT '[]',
  created_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id, activity_date)
);

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

-- ─── 10. RITUALS ──────────────────────────────────────────────
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

ALTER TABLE public.rituals ADD COLUMN IF NOT EXISTS profile_id        UUID        REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.rituals ADD COLUMN IF NOT EXISTS time_of_day       TEXT;
ALTER TABLE public.rituals ADD COLUMN IF NOT EXISTS streak_count      INTEGER     NOT NULL DEFAULT 0;
ALTER TABLE public.rituals ADD COLUMN IF NOT EXISTS last_completed_at TIMESTAMPTZ;
ALTER TABLE public.rituals ADD COLUMN IF NOT EXISTS is_active         BOOLEAN     NOT NULL DEFAULT true;

ALTER TABLE public.rituals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own rituals" ON public.rituals;
DROP POLICY IF EXISTS "Staff view all rituals"   ON public.rituals;
DROP POLICY IF EXISTS "rituals_admin_manager"    ON public.rituals;
DROP POLICY IF EXISTS "rituals_assigned"         ON public.rituals;
DROP POLICY IF EXISTS "rituals_admin"            ON public.rituals;
DROP POLICY IF EXISTS "rituals_own"              ON public.rituals;

CREATE POLICY "Users manage own rituals" ON public.rituals
  FOR ALL USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Staff view all rituals" ON public.rituals
  FOR SELECT USING (get_my_role() IN ('admin', 'coach'));

CREATE INDEX IF NOT EXISTS idx_rituals_profile ON public.rituals(profile_id);
CREATE INDEX IF NOT EXISTS idx_rituals_active  ON public.rituals(profile_id) WHERE is_active = true;

-- ─── 11. RECORD_ACTIVITY FUNCTION ────────────────────────────
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

-- ─── 12. LEADERBOARD VIEW ─────────────────────────────────────
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
