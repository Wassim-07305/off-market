-- ============================================================
-- 055 — Calendar Events (custom events for shared calendar)
-- ============================================================

CREATE TABLE IF NOT EXISTS calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  start_at timestamptz NOT NULL,
  end_at timestamptz,
  event_type text NOT NULL DEFAULT 'event',
  color text NOT NULL DEFAULT '#8B5CF6',
  attendees uuid[] DEFAULT '{}',
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index for date-range queries
CREATE INDEX idx_calendar_events_start ON calendar_events (start_at);
CREATE INDEX idx_calendar_events_created_by ON calendar_events (created_by);

-- RLS
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can read calendar events
CREATE POLICY "calendar_events_select" ON calendar_events
  FOR SELECT TO authenticated USING (true);

-- Admin & coach can insert
CREATE POLICY "calendar_events_insert" ON calendar_events
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('admin', 'coach')
    )
  );

-- Creator, admin can update
CREATE POLICY "calendar_events_update" ON calendar_events
  FOR UPDATE TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- Creator, admin can delete
CREATE POLICY "calendar_events_delete" ON calendar_events
  FOR DELETE TO authenticated
  USING (
    created_by = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
