-- ═══════════════════════════════════════
-- F25: Daily Check-ins (Morning & Evening)
-- ═══════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.daily_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  checkin_date DATE NOT NULL DEFAULT CURRENT_DATE,
  checkin_type TEXT NOT NULL CHECK (checkin_type IN ('morning', 'evening')),

  -- Morning fields
  energy INTEGER CHECK (energy BETWEEN 1 AND 5),
  mood INTEGER CHECK (mood BETWEEN 1 AND 5),
  goal_today TEXT,
  priority TEXT,

  -- Evening fields
  wins TEXT,
  learnings TEXT,
  challenges TEXT,
  gratitude TEXT,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),

  -- One morning + one evening per client per day
  UNIQUE(client_id, checkin_date, checkin_type)
);

-- Trigger for updated_at
CREATE TRIGGER update_daily_checkins_updated_at
  BEFORE UPDATE ON public.daily_checkins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE public.daily_checkins ENABLE ROW LEVEL SECURITY;

-- Staff can manage all daily checkins
CREATE POLICY "Staff can manage all daily checkins"
  ON public.daily_checkins FOR ALL
  USING (get_my_role() IN ('admin', 'coach'))
  WITH CHECK (get_my_role() IN ('admin', 'coach'));

-- Clients can view own daily checkins
CREATE POLICY "Clients can view own daily checkins"
  ON public.daily_checkins FOR SELECT
  USING (client_id = auth.uid());

-- Clients can create own daily checkins
CREATE POLICY "Clients can create own daily checkins"
  ON public.daily_checkins FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- Clients can update own daily checkins
CREATE POLICY "Clients can update own daily checkins"
  ON public.daily_checkins FOR UPDATE
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- Indexes
CREATE INDEX idx_daily_checkins_client_id ON public.daily_checkins(client_id);
CREATE INDEX idx_daily_checkins_date ON public.daily_checkins(checkin_date DESC);
CREATE INDEX idx_daily_checkins_client_date ON public.daily_checkins(client_id, checkin_date DESC);
