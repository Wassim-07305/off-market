-- ═══════════════════════════════════════════════════════════════
-- 093 — Fix certificates SELECT policy (definitive)
-- Migration 090 broke it by using get_my_role() — replaced with
-- a direct subquery that always works regardless of DB state.
-- Idempotent: safe to re-run.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS certificates_select ON public.certificates;
DROP POLICY IF EXISTS certificates_insert ON public.certificates;
DROP POLICY IF EXISTS certificates_update ON public.certificates;
DROP POLICY IF EXISTS certificates_delete ON public.certificates;

-- Students can read their own; admin/coach can read all
CREATE POLICY certificates_select ON public.certificates
  FOR SELECT USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'coach')
    )
  );

-- Anyone can insert their own certificate (course completion)
CREATE POLICY certificates_insert ON public.certificates
  FOR INSERT WITH CHECK (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'coach')
    )
  );
