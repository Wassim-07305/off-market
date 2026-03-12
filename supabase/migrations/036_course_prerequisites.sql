-- ─── Course Prerequisites ─────────────────────────────────────
-- Allows defining prerequisite relationships between courses.
-- A student must complete all prerequisite courses before accessing the target course.

CREATE TABLE IF NOT EXISTS course_prerequisites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  prerequisite_course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(course_id, prerequisite_course_id),
  CHECK(course_id != prerequisite_course_id)
);

-- Indexes
CREATE INDEX idx_course_prerequisites_course ON course_prerequisites(course_id);
CREATE INDEX idx_course_prerequisites_prereq ON course_prerequisites(prerequisite_course_id);

-- RLS
ALTER TABLE course_prerequisites ENABLE ROW LEVEL SECURITY;

-- Everyone can view prerequisites
CREATE POLICY "course_prerequisites_select" ON course_prerequisites
  FOR SELECT USING (true);

-- Only admin/coach can manage prerequisites
CREATE POLICY "course_prerequisites_insert" ON course_prerequisites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach')
    )
  );

CREATE POLICY "course_prerequisites_delete" ON course_prerequisites
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role IN ('admin', 'coach')
    )
  );
