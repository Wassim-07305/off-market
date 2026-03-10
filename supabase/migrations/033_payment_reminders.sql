-- Migration 033: Payment reminders system
-- Automatic payment reminder tracking for overdue/upcoming invoices

CREATE TABLE IF NOT EXISTS payment_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  reminder_type text NOT NULL CHECK (reminder_type IN ('j-3', 'j0', 'j+3', 'j+7', 'j+14')),
  scheduled_at timestamptz NOT NULL,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_reminders_invoice ON payment_reminders (invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_scheduled ON payment_reminders (scheduled_at) WHERE sent_at IS NULL;

-- RLS
ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage reminders" ON payment_reminders
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'sales'))
  );

-- Function to auto-create reminders when invoice is sent
CREATE OR REPLACE FUNCTION create_invoice_reminders()
RETURNS trigger AS $$
BEGIN
  -- Only when status changes to 'sent' and due_date exists
  IF NEW.status = 'sent' AND OLD.status != 'sent' AND NEW.due_date IS NOT NULL THEN
    -- j-3: 3 days before due date
    INSERT INTO payment_reminders (invoice_id, reminder_type, scheduled_at)
    VALUES (NEW.id, 'j-3', NEW.due_date::timestamptz - interval '3 days')
    ON CONFLICT DO NOTHING;

    -- j0: on due date
    INSERT INTO payment_reminders (invoice_id, reminder_type, scheduled_at)
    VALUES (NEW.id, 'j0', NEW.due_date::timestamptz)
    ON CONFLICT DO NOTHING;

    -- j+3: 3 days after
    INSERT INTO payment_reminders (invoice_id, reminder_type, scheduled_at)
    VALUES (NEW.id, 'j+3', NEW.due_date::timestamptz + interval '3 days')
    ON CONFLICT DO NOTHING;

    -- j+7: 7 days after
    INSERT INTO payment_reminders (invoice_id, reminder_type, scheduled_at)
    VALUES (NEW.id, 'j+7', NEW.due_date::timestamptz + interval '7 days')
    ON CONFLICT DO NOTHING;

    -- j+14: 14 days after (final reminder)
    INSERT INTO payment_reminders (invoice_id, reminder_type, scheduled_at)
    VALUES (NEW.id, 'j+14', NEW.due_date::timestamptz + interval '14 days')
    ON CONFLICT DO NOTHING;
  END IF;

  -- If invoice is paid, mark all unsent reminders as sent
  IF NEW.status = 'paid' AND OLD.status != 'paid' THEN
    UPDATE payment_reminders
    SET sent_at = now()
    WHERE invoice_id = NEW.id AND sent_at IS NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_create_invoice_reminders
  AFTER UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION create_invoice_reminders();
