-- ═══════════════════════════════════════════════════════════════
-- 089 — Certificates table + complete_course XP config
-- Idempotent: safe to re-run
-- ═══════════════════════════════════════════════════════════════

-- ─── 1. CERTIFICATES ─────────────────────────────────────────
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

-- Drop and recreate policies to ensure they're correct
DROP POLICY IF EXISTS certificates_select ON public.certificates;
DROP POLICY IF EXISTS certificates_insert ON public.certificates;
DROP POLICY IF EXISTS certificates_update ON public.certificates;

-- Students see their own; coaches/admin see all
CREATE POLICY certificates_select ON public.certificates
  FOR SELECT USING (
    student_id = auth.uid()
    OR get_my_role() IN ('admin', 'coach')
  );

-- Students can insert their own (course completion flow)
CREATE POLICY certificates_insert ON public.certificates
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- ─── 2. CERTIFICATE NOTIFICATION TRIGGER ────────────────────
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
  -- Non-fatal: don't block certificate creation if notifications fail
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_certificate_issued ON public.certificates;
CREATE TRIGGER on_certificate_issued
  AFTER INSERT ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION public.notify_certificate_issued();

-- ─── 3. XP CONFIG — add complete_course action ───────────────
-- Ensure xp_config table exists (from migration 009)
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

-- Seed base XP actions (idempotent)
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

-- ─── 4. ENSURE XP TABLES EXIST ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.xp_transactions (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action     TEXT        NOT NULL,
  xp_amount  INTEGER     NOT NULL,
  metadata   JSONB       DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own xp"    ON public.xp_transactions;
DROP POLICY IF EXISTS "Staff can view all xp"    ON public.xp_transactions;
DROP POLICY IF EXISTS "System can insert xp"     ON public.xp_transactions;

CREATE POLICY "Users can view own xp" ON public.xp_transactions
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Staff can view all xp" ON public.xp_transactions
  FOR SELECT USING (get_my_role() IN ('admin', 'coach'));
CREATE POLICY "System can insert xp" ON public.xp_transactions
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_xp_transactions_profile
  ON public.xp_transactions(profile_id, created_at DESC);

-- ─── 5. LEVEL CONFIG ─────────────────────────────────────────
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

-- Seed levels (idempotent)
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

-- ─── 6. AWARD_XP FUNCTION (create/replace) ───────────────────
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

  -- Apply streak multiplier if streaks table exists
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

  -- Record activity (ignore errors if table not ready)
  BEGIN
    PERFORM record_activity(p_profile_id, p_action);
  EXCEPTION WHEN OTHERS THEN NULL;
  END;

  RETURN v_final_xp;
END;
$$;
