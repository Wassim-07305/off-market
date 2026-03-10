-- 011: Ajout du champ onboarding_completed + table onboarding_steps

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;

-- Table pour stocker les réponses d'onboarding
CREATE TABLE IF NOT EXISTS onboarding_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_onboarding_responses_user ON onboarding_responses(user_id);

-- RLS
ALTER TABLE onboarding_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own onboarding responses"
  ON onboarding_responses
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins voient tout
CREATE POLICY "Admins can view all onboarding responses"
  ON onboarding_responses
  FOR SELECT
  USING (get_my_role() = 'admin');
