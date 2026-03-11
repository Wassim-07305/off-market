-- Sprint 15: Contract system enhancements — signature image + expires_at

ALTER TABLE contracts
  ADD COLUMN IF NOT EXISTS signature_image text DEFAULT null,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz DEFAULT null;

-- Index for expiring contracts
CREATE INDEX IF NOT EXISTS idx_contracts_expires_at
  ON contracts(expires_at) WHERE expires_at IS NOT NULL;
