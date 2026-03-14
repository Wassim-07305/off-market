-- 051: Journal enhancements — media, sharing, guided prompts

-- ─── Add columns to journal_entries ──────────────────────────────
ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS media_urls text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS shared_with_coach boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS prompt_id uuid;

CREATE INDEX IF NOT EXISTS idx_journal_entries_shared
  ON journal_entries(author_id, shared_with_coach)
  WHERE shared_with_coach = true;

-- ─── journal_prompts: guided daily prompts ───────────────────────
CREATE TABLE IF NOT EXISTS journal_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  text text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  is_active boolean NOT NULL DEFAULT true,
  order_index int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE journal_prompts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can read active prompts"
  ON journal_prompts
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_active = true);

CREATE POLICY "Admins manage prompts"
  ON journal_prompts
  FOR ALL
  USING (get_my_role() = 'admin');

-- ─── Seed 10 French coaching prompts ─────────────────────────────
INSERT INTO journal_prompts (text, category, order_index) VALUES
  ('Quelle est ta plus grande victoire cette semaine ?', 'wins', 1),
  ('Qu''est-ce qui t''a bloque aujourd''hui et comment le depasser ?', 'reflection', 2),
  ('Cite 3 choses pour lesquelles tu es reconnaissant aujourd''hui.', 'gratitude', 3),
  ('Quel objectif veux-tu atteindre demain ? Ecris une action concrete.', 'goals', 4),
  ('Comment te sens-tu par rapport a ton business en ce moment ?', 'mindset', 5),
  ('Quelle habitude veux-tu renforcer cette semaine ?', 'habits', 6),
  ('Qu''as-tu appris de nouveau aujourd''hui ?', 'learning', 7),
  ('Si tu pouvais revenir en arriere, que changerais-tu dans ta semaine ?', 'reflection', 8),
  ('Quel est le client ou prospect qui t''a le plus marque recemment ?', 'business', 9),
  ('Decris ton etat d''esprit en un mot et explique pourquoi.', 'mindset', 10);

-- ─── RLS: coaches see shared entries for their assigned clients ──
-- Update existing policies if needed — add coach visibility for shared entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'journal_entries'
    AND policyname = 'Coaches see shared entries of assigned clients'
  ) THEN
    EXECUTE '
      CREATE POLICY "Coaches see shared entries of assigned clients"
        ON journal_entries
        FOR SELECT
        USING (
          shared_with_coach = true
          AND EXISTS (
            SELECT 1 FROM coach_assignments ca
            WHERE ca.client_id = journal_entries.author_id
            AND ca.coach_id = auth.uid()
            AND ca.status = ''active''
          )
        )
    ';
  END IF;
END $$;
