-- ═══════════════════════════════════════════════════════════════
-- 010 — Call Calendar (iClosed)
-- ═══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS call_calendar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  call_type TEXT NOT NULL DEFAULT 'manuel'
    CHECK (call_type IN ('manuel','iclosed','calendly','booking','autre')),
  status TEXT NOT NULL DEFAULT 'planifie'
    CHECK (status IN ('planifie','realise','no_show','annule','reporte')),
  link TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Updated at trigger
CREATE TRIGGER set_call_calendar_updated_at
  BEFORE UPDATE ON call_calendar
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes
CREATE INDEX idx_call_calendar_date ON call_calendar(date);
CREATE INDEX idx_call_calendar_assigned_to ON call_calendar(assigned_to);
CREATE INDEX idx_call_calendar_client_id ON call_calendar(client_id);

-- RLS
ALTER TABLE call_calendar ENABLE ROW LEVEL SECURITY;

-- Admin can see all calls
CREATE POLICY "admin_all_calls" ON call_calendar
  FOR ALL USING (get_my_role() = 'admin');

-- Coach can see calls assigned to them or their clients
CREATE POLICY "coach_own_calls" ON call_calendar
  FOR ALL USING (
    get_my_role() = 'coach' AND (
      assigned_to = auth.uid()
      OR client_id IN (
        SELECT id FROM profiles WHERE coach_id = auth.uid()
      )
    )
  );

-- Setter/Closer can see their own calls
CREATE POLICY "sales_own_calls" ON call_calendar
  FOR ALL USING (
    get_my_role() IN ('setter', 'closer') AND assigned_to = auth.uid()
  );

-- Client can see calls where they are the client
CREATE POLICY "client_own_calls" ON call_calendar
  FOR SELECT USING (
    get_my_role() = 'client' AND client_id = auth.uid()
  );

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE call_calendar;
