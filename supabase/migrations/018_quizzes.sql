-- ═══════════════════════════════════════
-- OFF MARKET — QUIZ & EXERCISES
-- ═══════════════════════════════════════

-- Quiz data is stored in lessons.content JSONB when content_type = 'quiz'
-- Format: { questions: [...], passing_score: 70, show_correct_answers: true }

-- Table for storing student quiz attempts
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '[]',
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  passed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ DEFAULT now(),
  time_spent INTEGER DEFAULT 0, -- seconds
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Table for exercise/assignment submissions
CREATE TABLE public.exercise_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'reviewed', 'revision_requested')),
  coach_feedback TEXT,
  grade NUMERIC(5,2),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── RLS POLICIES ───────────────────────
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_submissions ENABLE ROW LEVEL SECURITY;

-- Quiz attempts: students own, staff read all
CREATE POLICY "Students can manage own quiz attempts"
  ON public.quiz_attempts FOR ALL
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Staff can view all quiz attempts"
  ON public.quiz_attempts FOR SELECT
  USING (get_my_role() IN ('admin', 'coach'));

-- Exercise submissions: students own, staff manage all
CREATE POLICY "Students can manage own submissions"
  ON public.exercise_submissions FOR ALL
  USING (student_id = auth.uid())
  WITH CHECK (student_id = auth.uid());

CREATE POLICY "Staff can manage all submissions"
  ON public.exercise_submissions FOR ALL
  USING (get_my_role() IN ('admin', 'coach'))
  WITH CHECK (get_my_role() IN ('admin', 'coach'));

-- ─── INDEXES ────────────────────────────
CREATE INDEX idx_quiz_attempts_lesson ON public.quiz_attempts(lesson_id);
CREATE INDEX idx_quiz_attempts_student ON public.quiz_attempts(student_id);
CREATE INDEX idx_quiz_attempts_lesson_student ON public.quiz_attempts(lesson_id, student_id);
CREATE INDEX idx_exercise_submissions_lesson ON public.exercise_submissions(lesson_id);
CREATE INDEX idx_exercise_submissions_student ON public.exercise_submissions(student_id);
CREATE INDEX idx_exercise_submissions_status ON public.exercise_submissions(status);

-- ─── UPDATED_AT TRIGGER ─────────────────
CREATE TRIGGER update_exercise_submissions_updated_at BEFORE UPDATE ON public.exercise_submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
