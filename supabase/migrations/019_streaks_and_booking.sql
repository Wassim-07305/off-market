-- ═══════════════════════════════════════════════════════════════
-- 019 — Streaks + Call Booking (Availability Slots)
-- ═══════════════════════════════════════════════════════════════

-- ─── STREAKS ─────────────────────────────────────────────────
-- Tracks daily activity and consecutive-day streaks per user
CREATE TABLE public.streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  xp_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.00,
  total_active_days INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id)
);

-- Daily activity log (one row per user per day)
CREATE TABLE public.daily_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  actions JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id, activity_date)
);

-- Function: record daily activity and update streak
CREATE OR REPLACE FUNCTION record_activity(
  p_profile_id UUID,
  p_action TEXT DEFAULT 'login'
) RETURNS JSONB
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_streak RECORD;
  v_new_streak INTEGER;
  v_multiplier NUMERIC(3,2);
  v_result JSONB;
BEGIN
  -- Insert daily activity (idempotent)
  INSERT INTO daily_activity (profile_id, activity_date, actions)
  VALUES (p_profile_id, v_today, jsonb_build_array(p_action))
  ON CONFLICT (profile_id, activity_date)
  DO UPDATE SET actions = daily_activity.actions || jsonb_build_array(p_action);

  -- Get or create streak record
  INSERT INTO streaks (profile_id, current_streak, longest_streak, last_activity_date, total_active_days)
  VALUES (p_profile_id, 0, 0, NULL, 0)
  ON CONFLICT (profile_id) DO NOTHING;

  SELECT * INTO v_streak FROM streaks WHERE profile_id = p_profile_id FOR UPDATE;

  -- Calculate new streak
  IF v_streak.last_activity_date = v_today THEN
    -- Already recorded today, no change
    v_result := jsonb_build_object(
      'current_streak', v_streak.current_streak,
      'longest_streak', v_streak.longest_streak,
      'multiplier', v_streak.xp_multiplier,
      'already_recorded', true
    );
    RETURN v_result;
  ELSIF v_streak.last_activity_date = v_today - 1 THEN
    -- Consecutive day
    v_new_streak := v_streak.current_streak + 1;
  ELSE
    -- Streak broken (or first activity)
    v_new_streak := 1;
  END IF;

  -- Calculate multiplier based on streak length
  -- 1-2 days: 1.0x, 3-6 days: 1.25x, 7-13 days: 1.5x, 14-29 days: 1.75x, 30+: 2.0x
  v_multiplier := CASE
    WHEN v_new_streak >= 30 THEN 2.00
    WHEN v_new_streak >= 14 THEN 1.75
    WHEN v_new_streak >= 7 THEN 1.50
    WHEN v_new_streak >= 3 THEN 1.25
    ELSE 1.00
  END;

  -- Update streak record
  UPDATE streaks SET
    current_streak = v_new_streak,
    longest_streak = GREATEST(v_streak.longest_streak, v_new_streak),
    last_activity_date = v_today,
    xp_multiplier = v_multiplier,
    total_active_days = v_streak.total_active_days + 1,
    updated_at = now()
  WHERE profile_id = p_profile_id;

  v_result := jsonb_build_object(
    'current_streak', v_new_streak,
    'longest_streak', GREATEST(v_streak.longest_streak, v_new_streak),
    'multiplier', v_multiplier,
    'streak_increased', true
  );
  RETURN v_result;
END;
$$;

-- Update award_xp to apply streak multiplier
CREATE OR REPLACE FUNCTION award_xp(
  p_profile_id UUID,
  p_action TEXT,
  p_metadata JSONB DEFAULT '{}'
) RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_xp INTEGER;
  v_multiplier NUMERIC(3,2);
  v_final_xp INTEGER;
BEGIN
  SELECT xp_amount INTO v_xp FROM xp_config WHERE action = p_action AND is_active = true;
  IF v_xp IS NULL THEN RETURN 0; END IF;

  -- Get streak multiplier (default 1.0 if no streak record)
  SELECT COALESCE(xp_multiplier, 1.00) INTO v_multiplier
  FROM streaks WHERE profile_id = p_profile_id;
  IF v_multiplier IS NULL THEN v_multiplier := 1.00; END IF;

  v_final_xp := CEIL(v_xp * v_multiplier);

  INSERT INTO xp_transactions (profile_id, action, xp_amount, metadata)
  VALUES (p_profile_id, p_action, v_final_xp,
    p_metadata || jsonb_build_object('base_xp', v_xp, 'multiplier', v_multiplier));

  -- Also record this as activity
  PERFORM record_activity(p_profile_id, p_action);

  RETURN v_final_xp;
END;
$$;


-- ─── AVAILABILITY SLOTS ──────────────────────────────────────
-- Coach/admin defines recurring availability windows
CREATE TABLE public.availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  CHECK (start_time < end_time)
);

-- Specific date overrides (blocked days, one-off availability)
CREATE TABLE public.availability_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  override_date DATE NOT NULL,
  is_blocked BOOLEAN DEFAULT true, -- true = day off, false = extra availability
  start_time TIME, -- only if is_blocked = false
  end_time TIME,   -- only if is_blocked = false
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(coach_id, override_date)
);

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_overrides ENABLE ROW LEVEL SECURITY;

-- Streaks: own data
CREATE POLICY "Users view own streak" ON public.streaks
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Staff view all streaks" ON public.streaks
  FOR SELECT USING (get_my_role() IN ('admin', 'coach'));
CREATE POLICY "System can manage streaks" ON public.streaks
  FOR ALL USING (true) WITH CHECK (true);

-- Daily activity: own data
CREATE POLICY "Users view own activity" ON public.daily_activity
  FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Staff view all activity" ON public.daily_activity
  FOR SELECT USING (get_my_role() IN ('admin', 'coach'));
CREATE POLICY "System can manage activity" ON public.daily_activity
  FOR ALL USING (true) WITH CHECK (true);

-- Availability slots: everyone reads, coach/admin manage own
CREATE POLICY "All can view slots" ON public.availability_slots
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Coach manages own slots" ON public.availability_slots
  FOR ALL USING (coach_id = auth.uid()) WITH CHECK (coach_id = auth.uid());
CREATE POLICY "Admin manages all slots" ON public.availability_slots
  FOR ALL USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');

-- Availability overrides: everyone reads, coach/admin manage own
CREATE POLICY "All can view overrides" ON public.availability_overrides
  FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Coach manages own overrides" ON public.availability_overrides
  FOR ALL USING (coach_id = auth.uid()) WITH CHECK (coach_id = auth.uid());
CREATE POLICY "Admin manages all overrides" ON public.availability_overrides
  FOR ALL USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX idx_streaks_profile ON public.streaks(profile_id);
CREATE INDEX idx_daily_activity_profile_date ON public.daily_activity(profile_id, activity_date DESC);
CREATE INDEX idx_availability_slots_coach ON public.availability_slots(coach_id);
CREATE INDEX idx_availability_slots_day ON public.availability_slots(day_of_week);
CREATE INDEX idx_availability_overrides_coach_date ON public.availability_overrides(coach_id, override_date);

-- ─── ADD booking CALL TYPE ───────────────────────────────────
-- The call_calendar.call_type already includes 'booking' in check constraint
-- Client policy: allow clients to INSERT bookings
CREATE POLICY "client_can_book_calls" ON public.call_calendar
  FOR INSERT WITH CHECK (
    get_my_role() = 'client' AND client_id = auth.uid() AND call_type = 'booking'
  );
