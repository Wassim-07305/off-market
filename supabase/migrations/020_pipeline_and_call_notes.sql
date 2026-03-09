-- ═══════════════════════════════════════════════════════════════
-- 020 — CRM Pipeline (Contacts) + Post-Call Notes
-- ═══════════════════════════════════════════════════════════════

-- ─── CRM CONTACTS (Pipeline) ─────────────────────────────────
CREATE TABLE public.crm_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  source TEXT, -- 'instagram', 'linkedin', 'referral', 'website', 'other'
  stage TEXT NOT NULL DEFAULT 'prospect'
    CHECK (stage IN ('prospect', 'qualifie', 'proposition', 'closing', 'client', 'perdu')),
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  estimated_value NUMERIC(12,2) DEFAULT 0,
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  last_contact_at TIMESTAMPTZ,
  converted_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TRIGGER set_crm_contacts_updated_at
  BEFORE UPDATE ON crm_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── CALL NOTES (Post-call debrief) ──────────────────────────
CREATE TABLE public.call_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES public.call_calendar(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  summary TEXT,
  client_mood TEXT CHECK (client_mood IN ('tres_positif', 'positif', 'neutre', 'negatif', 'tres_negatif')),
  outcome TEXT CHECK (outcome IN ('interested', 'follow_up', 'not_interested', 'closed', 'no_show')),
  next_steps TEXT,
  action_items JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(call_id)
);

CREATE TRIGGER set_call_notes_updated_at
  BEFORE UPDATE ON call_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.crm_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_notes ENABLE ROW LEVEL SECURITY;

-- CRM contacts: staff can manage all
CREATE POLICY "Admin manages all contacts" ON public.crm_contacts
  FOR ALL USING (get_my_role() = 'admin') WITH CHECK (get_my_role() = 'admin');
CREATE POLICY "Coach manages all contacts" ON public.crm_contacts
  FOR ALL USING (get_my_role() = 'coach') WITH CHECK (get_my_role() = 'coach');
CREATE POLICY "Sales can view and manage own contacts" ON public.crm_contacts
  FOR ALL USING (get_my_role() IN ('setter', 'closer') AND (assigned_to = auth.uid() OR created_by = auth.uid()))
  WITH CHECK (get_my_role() IN ('setter', 'closer'));

-- Call notes: author can manage, staff can view all
CREATE POLICY "Author manages own call notes" ON public.call_notes
  FOR ALL USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
CREATE POLICY "Staff can view all call notes" ON public.call_notes
  FOR SELECT USING (get_my_role() IN ('admin', 'coach'));
CREATE POLICY "Staff can manage all call notes" ON public.call_notes
  FOR ALL USING (get_my_role() IN ('admin', 'coach')) WITH CHECK (get_my_role() IN ('admin', 'coach'));

-- ─── INDEXES ─────────────────────────────────────────────────
CREATE INDEX idx_crm_contacts_stage ON public.crm_contacts(stage);
CREATE INDEX idx_crm_contacts_assigned ON public.crm_contacts(assigned_to);
CREATE INDEX idx_crm_contacts_created_by ON public.crm_contacts(created_by);
CREATE INDEX idx_crm_contacts_sort ON public.crm_contacts(stage, sort_order);
CREATE INDEX idx_call_notes_call_id ON public.call_notes(call_id);
CREATE INDEX idx_call_notes_author ON public.call_notes(author_id);
