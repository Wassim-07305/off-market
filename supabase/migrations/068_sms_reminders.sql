-- SMS Reminders table for Twilio integration
CREATE TABLE IF NOT EXISTS sms_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
  related_type TEXT
    CHECK (related_type IN ('call', 'coaching', 'payment')),
  related_id UUID,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for cron processing: find pending reminders due to be sent
CREATE INDEX idx_sms_reminders_status_scheduled
  ON sms_reminders (status, scheduled_at)
  WHERE status = 'pending';

-- Index for user lookups
CREATE INDEX idx_sms_reminders_user_id ON sms_reminders (user_id);

-- Index for related entity lookups
CREATE INDEX idx_sms_reminders_related
  ON sms_reminders (related_type, related_id)
  WHERE related_id IS NOT NULL;

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_sms_reminders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sms_reminders_updated_at
  BEFORE UPDATE ON sms_reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_sms_reminders_updated_at();

-- RLS policies
ALTER TABLE sms_reminders ENABLE ROW LEVEL SECURITY;

-- Users can view their own reminders
CREATE POLICY sms_reminders_select_own ON sms_reminders
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users can insert their own reminders
CREATE POLICY sms_reminders_insert_own ON sms_reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reminders (e.g. cancel)
CREATE POLICY sms_reminders_update_own ON sms_reminders
  FOR UPDATE USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admin can delete any reminder
CREATE POLICY sms_reminders_delete_admin ON sms_reminders
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
    )
  );
