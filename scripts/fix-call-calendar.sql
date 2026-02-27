-- ═══════════════════════════════════════════════════════════════
-- FIX: Create call_calendar table + GRANT permissions
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ═══════════════════════════════════════════════════════════════

-- 1. Create the table
CREATE TABLE IF NOT EXISTS public.call_calendar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
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

-- 2. Updated at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_call_calendar_updated_at'
  ) THEN
    CREATE TRIGGER set_call_calendar_updated_at
      BEFORE UPDATE ON public.call_calendar
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_call_calendar_date ON public.call_calendar(date);
CREATE INDEX IF NOT EXISTS idx_call_calendar_assigned_to ON public.call_calendar(assigned_to);
CREATE INDEX IF NOT EXISTS idx_call_calendar_client_id ON public.call_calendar(client_id);

-- 4. GRANT permissions to PostgREST roles
GRANT ALL ON public.call_calendar TO authenticated;
GRANT ALL ON public.call_calendar TO service_role;
GRANT SELECT ON public.call_calendar TO anon;

-- 5. Enable RLS
ALTER TABLE public.call_calendar ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies (drop first in case partial creation)
DROP POLICY IF EXISTS "admin_all_calls" ON public.call_calendar;
DROP POLICY IF EXISTS "coach_own_calls" ON public.call_calendar;
DROP POLICY IF EXISTS "sales_own_calls" ON public.call_calendar;
DROP POLICY IF EXISTS "client_own_calls" ON public.call_calendar;

CREATE POLICY "admin_all_calls" ON public.call_calendar
  FOR ALL USING (get_my_role() = 'admin');

CREATE POLICY "coach_own_calls" ON public.call_calendar
  FOR ALL USING (
    get_my_role() = 'coach' AND (
      assigned_to = auth.uid()
      OR client_id IN (SELECT id FROM profiles WHERE coach_id = auth.uid())
    )
  );

CREATE POLICY "sales_own_calls" ON public.call_calendar
  FOR ALL USING (
    get_my_role() IN ('setter', 'closer') AND assigned_to = auth.uid()
  );

CREATE POLICY "client_own_calls" ON public.call_calendar
  FOR SELECT USING (
    get_my_role() = 'client' AND client_id = auth.uid()
  );

-- 7. Enable realtime
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.call_calendar;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END;
$$;

-- 8. Notify PostgREST to reload schema cache
NOTIFY pgrst, 'reload schema';
