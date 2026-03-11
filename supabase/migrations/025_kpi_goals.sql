-- Sprint 12: KPI Goals — track measurable objectives with targets

CREATE TABLE IF NOT EXISTS kpi_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  metric text NOT NULL, -- revenue, clients, retention, calls, completions, checkins
  target_value numeric NOT NULL DEFAULT 0,
  current_value numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT '', -- €, %, count
  period text NOT NULL DEFAULT 'monthly' CHECK (period IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  is_archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE kpi_goals ENABLE ROW LEVEL SECURITY;

-- Admin/coach can manage KPI goals
CREATE POLICY "Staff can manage kpi_goals"
  ON kpi_goals FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );

-- Updated_at trigger
CREATE TRIGGER set_kpi_goals_updated_at
  BEFORE UPDATE ON kpi_goals
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
