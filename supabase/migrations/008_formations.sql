-- ============================================================================
-- Migration 008: Formations System
-- ============================================================================
-- Adds formations (courses) with modules, items (video/document), and
-- student progress tracking via item completions.
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 1: Create tables
-- ============================================================================

CREATE TABLE formations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE formation_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  formation_id UUID NOT NULL REFERENCES formations(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE module_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES formation_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('video', 'document')) DEFAULT 'video',
  url TEXT,
  duration INTEGER, -- in seconds, for videos
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE item_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES module_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(item_id, user_id)
);

-- ============================================================================
-- PART 2: Enable RLS
-- ============================================================================

ALTER TABLE formations ENABLE ROW LEVEL SECURITY;
ALTER TABLE formation_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_completions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PART 3: RLS Policies
-- ============================================================================

-- formations: admin full CRUD, all authenticated users can read published
CREATE POLICY formations_admin ON formations
  FOR ALL USING (has_role('admin'));

CREATE POLICY formations_read_published ON formations
  FOR SELECT USING (is_published = TRUE);

-- formation_modules: admin full CRUD, read if formation is published
CREATE POLICY modules_admin ON formation_modules
  FOR ALL USING (has_role('admin'));

CREATE POLICY modules_read_published ON formation_modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM formations f
      WHERE f.id = formation_id AND f.is_published = TRUE
    )
  );

-- module_items: admin full CRUD, read if formation is published
CREATE POLICY items_admin ON module_items
  FOR ALL USING (has_role('admin'));

CREATE POLICY items_read_published ON module_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM formation_modules fm
      JOIN formations f ON f.id = fm.formation_id
      WHERE fm.id = module_id AND f.is_published = TRUE
    )
  );

-- item_completions: admin can read all, users manage own completions
CREATE POLICY completions_admin ON item_completions
  FOR SELECT USING (has_role('admin'));

CREATE POLICY completions_own ON item_completions
  FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- PART 4: Indexes
-- ============================================================================

CREATE INDEX idx_formations_published ON formations(is_published, sort_order);
CREATE INDEX idx_formation_modules_formation ON formation_modules(formation_id, sort_order);
CREATE INDEX idx_module_items_module ON module_items(module_id, sort_order);
CREATE INDEX idx_item_completions_item ON item_completions(item_id);
CREATE INDEX idx_item_completions_user ON item_completions(user_id);

-- ============================================================================
-- PART 5: Auto-update timestamps
-- ============================================================================

CREATE TRIGGER update_formations_updated_at
  BEFORE UPDATE ON formations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_formation_modules_updated_at
  BEFORE UPDATE ON formation_modules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_module_items_updated_at
  BEFORE UPDATE ON module_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- PART 6: RPC Functions
-- ============================================================================

-- Get formation progress for a specific user
CREATE OR REPLACE FUNCTION get_formation_progress(
  p_formation_id UUID,
  p_user_id UUID DEFAULT auth.uid()
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  result JSONB;
  total_items INTEGER;
  completed_items INTEGER;
BEGIN
  -- Count total items in formation
  SELECT COUNT(*) INTO total_items
  FROM module_items mi
  JOIN formation_modules fm ON fm.id = mi.module_id
  WHERE fm.formation_id = p_formation_id;

  -- Count completed items for user
  SELECT COUNT(*) INTO completed_items
  FROM item_completions ic
  JOIN module_items mi ON mi.id = ic.item_id
  JOIN formation_modules fm ON fm.id = mi.module_id
  WHERE fm.formation_id = p_formation_id AND ic.user_id = p_user_id;

  result := jsonb_build_object(
    'formation_id', p_formation_id,
    'user_id', p_user_id,
    'total_items', total_items,
    'completed_items', completed_items,
    'percentage', CASE WHEN total_items > 0 THEN ROUND((completed_items::NUMERIC / total_items) * 100) ELSE 0 END
  );

  RETURN result;
END;
$$;

-- Get overview for a single student
CREATE OR REPLACE FUNCTION get_student_overview(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'user_id', p.id,
    'full_name', p.full_name,
    'email', p.email,
    'avatar_url', p.avatar_url,
    'last_seen_at', p.last_seen_at,
    'created_at', p.created_at,
    'formations', COALESCE((
      SELECT jsonb_agg(fp)
      FROM (
        SELECT
          f.id AS formation_id,
          f.title,
          (get_formation_progress(f.id, p.id)) AS progress
        FROM formations f
        WHERE f.is_published = TRUE
        ORDER BY f.sort_order
      ) fp
    ), '[]'::JSONB),
    'messages_count', (
      SELECT COUNT(*) FROM messages m WHERE m.sender_id = p.id
    ),
    'last_message_at', (
      SELECT MAX(m.created_at) FROM messages m WHERE m.sender_id = p.id
    )
  ) INTO result
  FROM profiles p
  WHERE p.id = p_user_id;

  RETURN result;
END;
$$;

-- Get overview of all students (for admin dashboard)
CREATE OR REPLACE FUNCTION get_students_overview()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(student ORDER BY student.full_name), '[]'::JSONB) INTO result
  FROM (
    SELECT
      p.id AS user_id,
      p.full_name,
      p.email,
      p.avatar_url,
      p.last_seen_at,
      p.created_at,
      -- Overall formation progress
      COALESCE((
        SELECT jsonb_agg(jsonb_build_object(
          'formation_id', f.id,
          'title', f.title,
          'progress', get_formation_progress(f.id, p.id)
        ))
        FROM formations f
        WHERE f.is_published = TRUE
      ), '[]'::JSONB) AS formations,
      -- Total messages sent
      (SELECT COUNT(*) FROM messages m WHERE m.sender_id = p.id) AS messages_count,
      -- Last message timestamp
      (SELECT MAX(m.created_at) FROM messages m WHERE m.sender_id = p.id) AS last_message_at,
      -- Total completions
      (SELECT COUNT(*) FROM item_completions ic WHERE ic.user_id = p.id) AS total_completions
    FROM profiles p
    JOIN user_roles ur ON ur.user_id = p.id
    WHERE ur.role = 'eleve'
  ) student;

  RETURN result;
END;
$$;

COMMIT;
