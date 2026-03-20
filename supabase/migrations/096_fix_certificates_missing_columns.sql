-- ═══════════════════════════════════════════════════════════════
-- 096 — Add missing columns to certificates table
-- The table was created by an early migration without snapshot
-- columns. Later migrations used CREATE TABLE IF NOT EXISTS
-- which skips if the table already exists.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS course_title   TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS student_name   TEXT;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS total_lessons  INT DEFAULT 0;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS total_modules  INT DEFAULT 0;
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS quiz_average   NUMERIC(5,2);
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS issued_at      TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS created_at     TIMESTAMPTZ DEFAULT now();
