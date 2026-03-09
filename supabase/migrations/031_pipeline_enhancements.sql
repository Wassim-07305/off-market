-- ═══════════════════════════════════════════════════════════════
-- 031 — Pipeline CRM Enhancements: Lead scoring + Interactions
-- ═══════════════════════════════════════════════════════════════

-- ─── Add columns to crm_contacts ────────────────────────────
ALTER TABLE public.crm_contacts
  ADD COLUMN IF NOT EXISTS lead_score INTEGER DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  ADD COLUMN IF NOT EXISTS last_interaction_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS interaction_count INTEGER DEFAULT 0;

-- ─── Contact Interactions ───────────────────────────────────
CREATE TABLE public.contact_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES public.crm_contacts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('call', 'email', 'meeting', 'note', 'message')),
  content TEXT,
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── RLS ────────────────────────────────────────────────────
ALTER TABLE public.contact_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin manages all interactions" ON public.contact_interactions
  FOR ALL USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');

CREATE POLICY "Coach manages all interactions" ON public.contact_interactions
  FOR ALL USING (get_my_role() = 'coach') WITH CHECK (get_my_role() = 'coach');

CREATE POLICY "Sales manages own interactions" ON public.contact_interactions
  FOR ALL USING (get_my_role() IN ('setter', 'closer'))
  WITH CHECK (get_my_role() IN ('setter', 'closer'));

-- ─── Indexes ────────────────────────────────────────────────
CREATE INDEX idx_contact_interactions_contact_created
  ON public.contact_interactions(contact_id, created_at DESC);

CREATE INDEX idx_crm_contacts_lead_score
  ON public.crm_contacts(lead_score);
