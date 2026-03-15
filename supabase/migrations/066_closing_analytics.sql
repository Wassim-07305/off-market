-- Add lost_reason and stage_changed_at to crm_contacts for closing analytics
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS lost_reason TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS stage_changed_at TIMESTAMPTZ;

-- Track when stage changes to calculate time-to-close
CREATE OR REPLACE FUNCTION update_stage_changed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.stage IS DISTINCT FROM OLD.stage THEN
    NEW.stage_changed_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if it exists to avoid errors on re-run
DROP TRIGGER IF EXISTS trg_stage_changed ON crm_contacts;

CREATE TRIGGER trg_stage_changed
  BEFORE UPDATE ON crm_contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_stage_changed_at();

-- Index for analytics queries
CREATE INDEX IF NOT EXISTS idx_crm_contacts_source_stage
  ON crm_contacts (source, stage);

CREATE INDEX IF NOT EXISTS idx_crm_contacts_stage_changed_at
  ON crm_contacts (stage_changed_at)
  WHERE stage_changed_at IS NOT NULL;
