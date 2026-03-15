-- ═══════════════════════════════════════════════════════════════
-- 055 — Lead Magnet: qualification scoring + capture metadata
-- ═══════════════════════════════════════════════════════════════

-- Add lead magnet specific columns to crm_contacts
ALTER TABLE public.crm_contacts
  ADD COLUMN IF NOT EXISTS qualification_score INTEGER DEFAULT 0
    CHECK (qualification_score >= 0 AND qualification_score <= 100),
  ADD COLUMN IF NOT EXISTS revenue_range TEXT,
  ADD COLUMN IF NOT EXISTS goals TEXT,
  ADD COLUMN IF NOT EXISTS captured_at TIMESTAMPTZ;

-- Index for filtering lead magnet captures
CREATE INDEX IF NOT EXISTS idx_crm_contacts_captured_at
  ON public.crm_contacts(captured_at)
  WHERE captured_at IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_crm_contacts_qualification_score
  ON public.crm_contacts(qualification_score)
  WHERE qualification_score > 0;

CREATE INDEX IF NOT EXISTS idx_crm_contacts_source
  ON public.crm_contacts(source)
  WHERE source IS NOT NULL;
