-- Migration 034: Call enhancements
-- Rescheduling tracking + note templates + satisfaction rating

-- Reschedule tracking
ALTER TABLE call_calendar
  ADD COLUMN IF NOT EXISTS reschedule_reason text,
  ADD COLUMN IF NOT EXISTS original_date date,
  ADD COLUMN IF NOT EXISTS original_time time,
  ADD COLUMN IF NOT EXISTS satisfaction_rating integer CHECK (satisfaction_rating BETWEEN 1 AND 5);

-- Note templates table
CREATE TABLE IF NOT EXISTS call_note_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  structure jsonb NOT NULL DEFAULT '[]', -- array of { section, placeholder }
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE call_note_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can manage note templates" ON call_note_templates
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );

-- Insert default templates
INSERT INTO call_note_templates (title, structure) VALUES
  ('Appel de decouverte', '[
    {"section": "Contexte du prospect", "placeholder": "Situation actuelle, problemes identifies..."},
    {"section": "Objectifs exprimes", "placeholder": "Ce que le prospect veut atteindre..."},
    {"section": "Solutions proposees", "placeholder": "Offres presentees, reactions..."},
    {"section": "Objections", "placeholder": "Freins exprimes, hesitations..."},
    {"section": "Prochaines etapes", "placeholder": "Actions a mener, date de relance..."}
  ]'),
  ('Appel de suivi coaching', '[
    {"section": "Progres depuis le dernier appel", "placeholder": "Actions realisees, resultats..."},
    {"section": "Blocages actuels", "placeholder": "Difficultes, obstacles..."},
    {"section": "Points cles discutes", "placeholder": "Conseils donnes, strategies..."},
    {"section": "Objectifs pour la prochaine session", "placeholder": "Actions a mener..."},
    {"section": "Moral et motivation", "placeholder": "Etat mental, niveau d energie..."}
  ]'),
  ('Appel de closing', '[
    {"section": "Recap de l offre", "placeholder": "Details du package propose..."},
    {"section": "Decision du prospect", "placeholder": "Accepte, refuse, hesite..."},
    {"section": "Conditions negociees", "placeholder": "Prix, duree, conditions speciales..."},
    {"section": "Prochaines etapes", "placeholder": "Signature, paiement, onboarding..."},
    {"section": "Notes internes", "placeholder": "Impressions, potentiel du client..."}
  ]');

-- Index for faster metrics queries
CREATE INDEX IF NOT EXISTS idx_call_calendar_status_date
  ON call_calendar (status, date DESC);
