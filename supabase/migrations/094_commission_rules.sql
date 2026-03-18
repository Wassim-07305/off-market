-- Add setter_id to closer_calls (which setter brought the lead)
ALTER TABLE closer_calls ADD COLUMN IF NOT EXISTS setter_id uuid REFERENCES profiles(id);

-- Commission rules per setter (configurable rates and splits)
CREATE TABLE IF NOT EXISTS commission_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setter_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rate numeric(5,2) NOT NULL DEFAULT 5.00,
  split_first numeric(5,2) NOT NULL DEFAULT 70.00,
  split_second numeric(5,2) NOT NULL DEFAULT 30.00,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (setter_id)
);

ALTER TABLE commission_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_all" ON commission_rules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "setter_view_own" ON commission_rules
  FOR SELECT USING (auth.uid() = setter_id);

-- Track split type and link to closer call
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS split_type text DEFAULT 'full';
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS closer_call_id uuid REFERENCES closer_calls(id) ON DELETE SET NULL;

NOTIFY pgrst, 'reload schema';
