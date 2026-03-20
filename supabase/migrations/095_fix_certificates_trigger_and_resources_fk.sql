-- ═══════════════════════════════════════════════════════════════
-- 095 — Fix certificates 500 + resources 400
-- Root causes:
--   1. Migration 094 recreated notifications_type_check WITHOUT 'badge'
--      → certificate trigger crashes → INSERT rolls back → 500
--   2. resources.uploaded_by FK points to auth.users, not profiles
--      → PostgREST can't resolve profiles!uploaded_by join → 400
-- ═══════════════════════════════════════════════════════════════

-- ─── FIX 1: Notification type CHECK — restore ALL types ────────
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check CHECK (
  type = ANY (ARRAY[
    'new_message', 'mention', 'form_response', 'module_complete',
    'task_assigned', 'task_due', 'student_inactive', 'new_enrollment',
    'ai_insight', 'system', 'feed', 'contract_signed', 'contract_generated',
    'onboarding_complete', 'report', 'checkin', 'goal', 'badge', 'call_reminder'
  ])
);

-- ─── FIX 2: Certificate trigger with EXCEPTION handler ────────
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

-- ─── FIX 3: Resources FK — auth.users → profiles ──────────────
-- Drop any existing FK on uploaded_by (could have various names)
DO $$
DECLARE
  _con TEXT;
BEGIN
  FOR _con IN
    SELECT tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.table_name = 'resources'
      AND tc.table_schema = 'public'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'uploaded_by'
  LOOP
    EXECUTE format('ALTER TABLE public.resources DROP CONSTRAINT %I', _con);
  END LOOP;
END $$;

-- Add FK to profiles(id) so PostgREST can resolve profiles!uploaded_by
ALTER TABLE public.resources
  ADD CONSTRAINT resources_uploaded_by_fkey
  FOREIGN KEY (uploaded_by) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- ─── FIX 4: Resources RLS — prospects can view ────────────────
DROP POLICY IF EXISTS "Prospects can view resources" ON public.resources;
CREATE POLICY "Prospects can view resources"
  ON public.resources FOR SELECT
  USING (
    visibility = 'all'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'prospect'
    )
  );
