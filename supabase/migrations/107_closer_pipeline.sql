-- ═══════════════════════════════════════════════════════════════
-- 107 — Closer Pipeline: add closer_stage and closer_id to crm_contacts
-- Separates setter pipeline (stage) from closer pipeline (closer_stage)
-- ═══════════════════════════════════════════════════════════════

-- Add closer-specific columns
ALTER TABLE public.crm_contacts
  ADD COLUMN IF NOT EXISTS closer_stage TEXT
    CHECK (closer_stage IN ('a_appeler', 'en_negociation', 'close', 'perdu')),
  ADD COLUMN IF NOT EXISTS closer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Index for closer pipeline queries
CREATE INDEX IF NOT EXISTS idx_crm_contacts_closer_id ON public.crm_contacts(closer_id) WHERE closer_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_contacts_closer_stage ON public.crm_contacts(closer_stage) WHERE closer_stage IS NOT NULL;

-- Track when closer returns a lead to setter
ALTER TABLE public.crm_contacts
  ADD COLUMN IF NOT EXISTS returned_by_closer BOOLEAN DEFAULT false;

-- RLS: closers can view and manage contacts assigned to them
DROP POLICY IF EXISTS "Closer manages assigned contacts" ON public.crm_contacts;
CREATE POLICY "Closer manages assigned contacts" ON public.crm_contacts
  FOR ALL
  USING (get_my_role() = 'closer' AND closer_id = auth.uid())
  WITH CHECK (get_my_role() = 'closer' AND closer_id = auth.uid());
