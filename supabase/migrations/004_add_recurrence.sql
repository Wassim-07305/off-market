-- Add recurrence field to financial entries
ALTER TABLE financial_entries
ADD COLUMN IF NOT EXISTS recurrence TEXT CHECK (recurrence IN ('mensuel', 'trimestriel', 'annuel'));
