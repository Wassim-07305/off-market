-- Ajouter le champ tax_rate aux factures (taux TVA en pourcentage, defaut 20%)
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_rate numeric DEFAULT 20;

-- Ajouter le type j+21 aux reminders si la colonne reminder_type est un enum
-- (sinon c'est un text et pas besoin de migration)
DO $$
BEGIN
  -- Verifier si reminder_type est un enum
  IF EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'reminder_type'
  ) THEN
    -- Ajouter la valeur j+21 si elle n'existe pas
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum WHERE enumlabel = 'j+21'
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'reminder_type')
    ) THEN
      ALTER TYPE reminder_type ADD VALUE IF NOT EXISTS 'j+21';
    END IF;
  END IF;
END $$;
