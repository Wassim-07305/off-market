-- Multi-currency support
-- Add currency columns to financial tables + currency_rates reference table

-- 1. Add currency column to financial_entries
ALTER TABLE financial_entries
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';

-- 2. Add currency column to payment_schedules
ALTER TABLE payment_schedules
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';

-- 3. Add default_currency to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS default_currency TEXT DEFAULT 'EUR';

-- 4. Currency rates table
CREATE TABLE IF NOT EXISTS currency_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base TEXT NOT NULL,
  target TEXT NOT NULL,
  rate NUMERIC NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (base, target)
);

-- 5. Insert default rates
INSERT INTO currency_rates (base, target, rate)
VALUES
  ('EUR', 'USD', 1.08),
  ('EUR', 'GBP', 0.86),
  ('EUR', 'CHF', 0.94),
  ('USD', 'EUR', 0.9259),
  ('GBP', 'EUR', 1.1628),
  ('CHF', 'EUR', 1.0638)
ON CONFLICT (base, target) DO UPDATE SET rate = EXCLUDED.rate, updated_at = now();

-- 6. RLS policies
ALTER TABLE currency_rates ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read rates
CREATE POLICY "Authenticated users can read currency rates"
  ON currency_rates FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert/update/delete rates
CREATE POLICY "Admins can manage currency rates"
  ON currency_rates FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  );
