-- Migration 074: Consentement IA (F46.2)
-- Utilise la table user_consents existante avec consent_type = 'ai_usage'
-- Pas besoin de creer une nouvelle table

-- S'assurer que la table user_consents a les bonnes colonnes
-- (elle existe deja via rgpd-consent-banner)
DO $$
BEGIN
  -- Ajouter un index pour les lookups rapides par type de consentement
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE indexname = 'idx_user_consents_ai_usage'
  ) THEN
    CREATE INDEX idx_user_consents_ai_usage
    ON user_consents (user_id, consent_type)
    WHERE consent_type = 'ai_usage';
  END IF;
END $$;
