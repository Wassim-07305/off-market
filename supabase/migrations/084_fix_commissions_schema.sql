-- Fix commissions table: add columns used by frontend hook
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS sale_id UUID;
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS sale_amount NUMERIC(12,2);
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS commission_rate NUMERIC(5,4);
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS commission_amount NUMERIC(12,2);
ALTER TABLE commissions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
