-- ─── Contact enrichment columns ─────────────────────────────
-- Stores LinkedIn/Instagram URLs and Apify enrichment results

ALTER TABLE public.crm_contacts
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS enrichment_data JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS enrichment_status TEXT DEFAULT NULL
    CHECK (enrichment_status IN ('pending', 'enriched', 'failed')),
  ADD COLUMN IF NOT EXISTS last_enriched_at TIMESTAMPTZ;

-- Index for quick lookup by enrichment status
CREATE INDEX IF NOT EXISTS idx_crm_contacts_enrichment_status
  ON public.crm_contacts(enrichment_status)
  WHERE enrichment_status IS NOT NULL;
