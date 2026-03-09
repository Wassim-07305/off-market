-- ============================================
-- Migration 023: Certificats de completion
-- ============================================

CREATE TABLE IF NOT EXISTS public.certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE,
  issued_at TIMESTAMPTZ DEFAULT now(),
  -- Snapshot at time of issue
  course_title TEXT NOT NULL,
  student_name TEXT NOT NULL,
  total_lessons INT NOT NULL DEFAULT 0,
  total_modules INT NOT NULL DEFAULT 0,
  quiz_average NUMERIC(5,2),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, course_id)
);

CREATE INDEX idx_certificates_student ON public.certificates(student_id);
CREATE INDEX idx_certificates_course ON public.certificates(course_id);

-- RLS
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Students see own certificates
CREATE POLICY certificates_select ON public.certificates
  FOR SELECT USING (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );

-- Only system/admin can insert
CREATE POLICY certificates_insert ON public.certificates
  FOR INSERT WITH CHECK (
    student_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Notification trigger on certificate issued
CREATE OR REPLACE FUNCTION notify_certificate_issued()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (recipient_id, type, title, body, data)
  VALUES (
    NEW.student_id,
    'badge',
    'Certificat obtenu !',
    'Felicitations ! Vous avez obtenu le certificat pour "' || NEW.course_title || '"',
    jsonb_build_object('certificate_id', NEW.id, 'course_id', NEW.course_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_certificate_issued ON public.certificates;
CREATE TRIGGER on_certificate_issued
  AFTER INSERT ON public.certificates
  FOR EACH ROW EXECUTE FUNCTION notify_certificate_issued();
