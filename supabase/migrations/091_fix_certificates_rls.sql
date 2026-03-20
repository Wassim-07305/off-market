-- ═══════════════════════════════════════════════════════════════
-- 091 — Fix certificates RLS policies
-- Cause : get_my_role() may not have existed when 090 ran,
--         leaving the SELECT policy missing → INSERT+RETURNING = 400
-- Fix   : recreate policies without depending on get_my_role()
-- Idempotent: safe to re-run
-- ═══════════════════════════════════════════════════════════════

-- Ensure get_my_role() exists first (idempotent)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- Drop all existing policies on certificates
DROP POLICY IF EXISTS certificates_select ON public.certificates;
DROP POLICY IF EXISTS certificates_insert ON public.certificates;
DROP POLICY IF EXISTS certificates_update ON public.certificates;
DROP POLICY IF EXISTS certificates_delete ON public.certificates;

-- Recreate without relying on get_my_role() in the hot path
-- Students can read their own certificates
-- Coaches/admin can read all (via profiles subquery, avoids get_my_role())
CREATE POLICY certificates_select ON public.certificates
  FOR SELECT USING (
    student_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'coach')
    )
  );

-- Students can insert their own certificate (course completion)
CREATE POLICY certificates_insert ON public.certificates
  FOR INSERT WITH CHECK (student_id = auth.uid());

-- Also fix feed_posts constraint in case it wasn't applied
ALTER TABLE public.feed_posts DROP CONSTRAINT IF EXISTS feed_posts_post_type_check;
ALTER TABLE public.feed_posts ADD CONSTRAINT feed_posts_post_type_check
  CHECK (post_type IN ('victory', 'question', 'experience', 'general', 'resource', 'off_topic'));
