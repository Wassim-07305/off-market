-- ═══════════════════════════════════════
-- OFF MARKET — UPSELL AUTOMATION & CHALLENGE VERIFICATION
-- ═══════════════════════════════════════

-- ─── UPSELL RULES ──────────────────────
CREATE TABLE public.upsell_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('revenue_threshold', 'milestone_completion', 'time_based')),
  trigger_config JSONB NOT NULL DEFAULT '{}',
  offer_title TEXT NOT NULL,
  offer_description TEXT,
  offer_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── UPSELL TRIGGERS ──────────────────
CREATE TABLE public.upsell_triggers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES public.upsell_rules(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  triggered_at TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'notified', 'converted', 'dismissed')),
  notified_at TIMESTAMPTZ,
  converted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── CHALLENGE ENTRIES (verified submissions) ────
CREATE TABLE public.challenge_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  metric_value NUMERIC NOT NULL DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  verification_source TEXT,
  proof_url TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now(),
  reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── CLIENT BUSINESS INFO (for contract generation) ────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS siret TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS company_address TEXT,
  ADD COLUMN IF NOT EXISTS legal_form TEXT;

-- ─── INDEXES ─────────────────────────
CREATE INDEX idx_upsell_rules_active ON public.upsell_rules(is_active) WHERE is_active = true;
CREATE INDEX idx_upsell_triggers_client ON public.upsell_triggers(client_id);
CREATE INDEX idx_upsell_triggers_status ON public.upsell_triggers(status);
CREATE INDEX idx_challenge_entries_user ON public.challenge_entries(user_id);
CREATE INDEX idx_challenge_entries_challenge ON public.challenge_entries(challenge_id);

-- ═══════════════════════════════════════
-- RLS POLICIES
-- ═══════════════════════════════════════

ALTER TABLE public.upsell_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.upsell_triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_entries ENABLE ROW LEVEL SECURITY;

-- ─── UPSELL RULES: admin full CRUD, coaches read ─────
CREATE POLICY "admin_full_upsell_rules" ON public.upsell_rules
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "coaches_read_upsell_rules" ON public.upsell_rules
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('coach', 'setter', 'closer'))
  );

-- ─── UPSELL TRIGGERS: admin full, coaches read, clients read own ─────
CREATE POLICY "admin_full_upsell_triggers" ON public.upsell_triggers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "coaches_read_upsell_triggers" ON public.upsell_triggers
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role IN ('coach', 'setter', 'closer'))
  );

CREATE POLICY "clients_read_own_upsell_triggers" ON public.upsell_triggers
  FOR SELECT USING (client_id = auth.uid());

-- ─── CHALLENGE ENTRIES: admin full CRUD, users manage own ─────
CREATE POLICY "admin_full_challenge_entries" ON public.challenge_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "users_read_challenge_entries" ON public.challenge_entries
  FOR SELECT USING (true);

CREATE POLICY "users_insert_own_entries" ON public.challenge_entries
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_update_own_entries" ON public.challenge_entries
  FOR UPDATE USING (user_id = auth.uid());
