-- ═══════════════════════════════════════════════════════════════════════════
-- 078 — Contract Renewal & LMS Audio Support
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Contract Renewal Fields ─────────────────────────────────────────────
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT false;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS renewal_period_months INT DEFAULT 12;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS renewal_notice_days INT DEFAULT 30;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS renewed_from_id UUID REFERENCES contracts(id);
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS renewal_status TEXT;
-- renewal_status: pending_renewal, renewed, expired, cancelled

-- ─── Contract Renewal Logs ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS contract_renewal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- reminder_sent, auto_renewed, cancelled, expired
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_renewal_logs_contract ON contract_renewal_logs(contract_id);
CREATE INDEX IF NOT EXISTS idx_contracts_auto_renew ON contracts(auto_renew) WHERE auto_renew = true;
CREATE INDEX IF NOT EXISTS idx_contracts_renewal_status ON contracts(renewal_status);

-- RLS for contract_renewal_logs
ALTER TABLE contract_renewal_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage renewal logs" ON contract_renewal_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );

CREATE POLICY "Clients can view own renewal logs" ON contract_renewal_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM contracts
      WHERE contracts.id = contract_renewal_logs.contract_id
      AND contracts.client_id = auth.uid()
    )
  );

-- ─── LMS Audio Support ──────────────────────────────────────────────────
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS audio_url TEXT;
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS audio_duration INT; -- seconds
-- content_type already exists with: video, text, pdf, quiz, assignment
-- We add 'audio' as a valid option (no enum constraint, just TEXT)
