-- ═══════════════════════════════════════
-- OFF MARKET — CHECK-INS & COACHING
-- ═══════════════════════════════════════

-- ─── WEEKLY CHECK-INS ─────────────────
CREATE TABLE public.weekly_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  revenue NUMERIC(10,2) DEFAULT 0,
  prospection_count INTEGER DEFAULT 0,
  win TEXT, -- victoire de la semaine
  blocker TEXT, -- blocage principal
  goal_next_week TEXT,
  mood INTEGER CHECK (mood BETWEEN 1 AND 5),
  coach_feedback TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, week_start)
);

-- ─── JOURNAL ENTRIES ──────────────────
CREATE TABLE public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  mood INTEGER CHECK (mood BETWEEN 1 AND 5),
  tags TEXT[] DEFAULT '{}',
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── COACHING GOALS ───────────────────
CREATE TABLE public.coaching_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  set_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC(10,2),
  current_value NUMERIC(10,2) DEFAULT 0,
  unit TEXT, -- 'EUR', 'clients', '%', etc.
  deadline DATE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'abandoned')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── SESSIONS ─────────────────────────
CREATE TABLE public.sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'individual' CHECK (session_type IN ('individual', 'group', 'emergency')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  action_items JSONB DEFAULT '[]', -- [{title, done}]
  replay_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── COACH ALERTS ─────────────────────
CREATE TABLE public.coach_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  coach_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL CHECK (alert_type IN (
    'no_checkin', 'revenue_drop', 'inactive_7d', 'inactive_14d',
    'goal_at_risk', 'low_mood', 'payment_overdue'
  )),
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── UPDATED_AT TRIGGERS ──────────────
CREATE TRIGGER update_weekly_checkins_updated_at BEFORE UPDATE ON public.weekly_checkins
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_journal_entries_updated_at BEFORE UPDATE ON public.journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coaching_goals_updated_at BEFORE UPDATE ON public.coaching_goals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── RLS POLICIES ─────────────────────
ALTER TABLE public.weekly_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_alerts ENABLE ROW LEVEL SECURITY;

-- Weekly Check-ins: staff full, client own
CREATE POLICY "Staff can manage all checkins"
  ON public.weekly_checkins FOR ALL
  USING (get_my_role() IN ('admin', 'coach'))
  WITH CHECK (get_my_role() IN ('admin', 'coach'));

CREATE POLICY "Clients can view own checkins"
  ON public.weekly_checkins FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Clients can create own checkins"
  ON public.weekly_checkins FOR INSERT
  WITH CHECK (client_id = auth.uid());

CREATE POLICY "Clients can update own checkins"
  ON public.weekly_checkins FOR UPDATE
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- Journal: author only (private), staff can see non-private
CREATE POLICY "Authors can manage own journal entries"
  ON public.journal_entries FOR ALL
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

CREATE POLICY "Staff can view non-private journal entries"
  ON public.journal_entries FOR SELECT
  USING (get_my_role() IN ('admin', 'coach') AND is_private = false);

-- Coaching Goals: staff full, client own
CREATE POLICY "Staff can manage all goals"
  ON public.coaching_goals FOR ALL
  USING (get_my_role() IN ('admin', 'coach'))
  WITH CHECK (get_my_role() IN ('admin', 'coach'));

CREATE POLICY "Clients can view own goals"
  ON public.coaching_goals FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Clients can update own goals"
  ON public.coaching_goals FOR UPDATE
  USING (client_id = auth.uid())
  WITH CHECK (client_id = auth.uid());

-- Sessions: staff full, client own
CREATE POLICY "Staff can manage all sessions"
  ON public.sessions FOR ALL
  USING (get_my_role() IN ('admin', 'coach'))
  WITH CHECK (get_my_role() IN ('admin', 'coach'));

CREATE POLICY "Clients can view own sessions"
  ON public.sessions FOR SELECT
  USING (client_id = auth.uid());

-- Coach Alerts: staff only
CREATE POLICY "Staff can manage all alerts"
  ON public.coach_alerts FOR ALL
  USING (get_my_role() IN ('admin', 'coach'))
  WITH CHECK (get_my_role() IN ('admin', 'coach'));

-- ─── INDEXES ──────────────────────────
CREATE INDEX idx_weekly_checkins_client_id ON public.weekly_checkins(client_id);
CREATE INDEX idx_weekly_checkins_week_start ON public.weekly_checkins(week_start DESC);
CREATE INDEX idx_journal_entries_author_id ON public.journal_entries(author_id);
CREATE INDEX idx_journal_entries_created_at ON public.journal_entries(created_at DESC);
CREATE INDEX idx_coaching_goals_client_id ON public.coaching_goals(client_id);
CREATE INDEX idx_coaching_goals_status ON public.coaching_goals(status);
CREATE INDEX idx_sessions_client_id ON public.sessions(client_id);
CREATE INDEX idx_sessions_coach_id ON public.sessions(coach_id);
CREATE INDEX idx_sessions_scheduled_at ON public.sessions(scheduled_at);
CREATE INDEX idx_coach_alerts_client_id ON public.coach_alerts(client_id);
CREATE INDEX idx_coach_alerts_coach_id ON public.coach_alerts(coach_id);
CREATE INDEX idx_coach_alerts_is_resolved ON public.coach_alerts(is_resolved) WHERE is_resolved = false;
