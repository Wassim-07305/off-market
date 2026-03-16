-- 078: Journal guided prompts (enhanced) + media attachments

-- ─── Enhance journal_prompts table ──────────────────────────────
-- Add day_of_week for daily rotation and sort_order
ALTER TABLE journal_prompts
  ADD COLUMN IF NOT EXISTS day_of_week int,
  ADD COLUMN IF NOT EXISTS sort_order int NOT NULL DEFAULT 0;

-- Update existing order_index to sort_order if needed
UPDATE journal_prompts SET sort_order = order_index WHERE sort_order = 0 AND order_index > 0;

-- ─── Seed 21 prompts (3 per category + daily rotation) ─────────
-- Clear existing prompts to avoid duplicates (seed is idempotent)
DELETE FROM journal_prompts WHERE id IN (
  SELECT id FROM journal_prompts WHERE day_of_week IS NULL AND sort_order <= 100
);

INSERT INTO journal_prompts (text, category, day_of_week, sort_order, is_active) VALUES
  -- Gratitude (3)
  ('Quelles sont les 3 choses pour lesquelles tu es reconnaissant aujourd''hui ?', 'gratitude', NULL, 1, true),
  ('Quel moment de la journee t''a rendu le plus heureux ?', 'gratitude', NULL, 2, true),
  ('Quelle personne a eu un impact positif sur ta journee ?', 'gratitude', NULL, 3, true),
  -- Reflection (3)
  ('Qu''as-tu appris aujourd''hui ?', 'reflection', NULL, 4, true),
  ('Si tu pouvais refaire une chose differemment, laquelle ?', 'reflection', NULL, 5, true),
  ('Quel defi t''a fait grandir recemment ?', 'reflection', NULL, 6, true),
  -- Goal (3)
  ('Quel est ton objectif principal pour demain ?', 'goal', NULL, 7, true),
  ('Es-tu plus proche de ton objectif ce mois-ci ? Pourquoi ?', 'goal', NULL, 8, true),
  ('Quelle habitude veux-tu renforcer cette semaine ?', 'goal', NULL, 9, true),
  -- Mindset (3)
  ('Comment decrirais-tu ton etat d''esprit aujourd''hui ?', 'mindset', NULL, 10, true),
  ('Quelle croyance limitante veux-tu depasser ?', 'mindset', NULL, 11, true),
  ('Qu''est-ce qui te motive le plus en ce moment ?', 'mindset', NULL, 12, true),
  -- Business (3)
  ('Quelle action a eu le plus d''impact sur ton business aujourd''hui ?', 'business', NULL, 13, true),
  ('Quel client as-tu aide le plus cette semaine ?', 'business', NULL, 14, true),
  ('Quel est ton plus grand frein business actuel ?', 'business', NULL, 15, true),
  -- Daily rotation (6 — one per working day + weekend)
  ('Lundi : Quelle est ta priorite numero 1 cette semaine ?', 'goal', 1, 101, true),
  ('Mardi : Qu''est-ce qui t''a surpris hier ?', 'reflection', 2, 102, true),
  ('Mercredi : Mi-semaine — es-tu sur la bonne voie ?', 'mindset', 3, 103, true),
  ('Jeudi : Quel est le meilleur conseil que tu as recu recemment ?', 'reflection', 4, 104, true),
  ('Vendredi : Celebre ta victoire de la semaine !', 'gratitude', 5, 105, true),
  ('Weekend : Qu''est-ce qui te ressource le plus ?', 'mindset', 6, 106, true);

-- ─── Add prompt_id FK if not exists ─────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'journal_entries_prompt_id_fkey'
  ) THEN
    BEGIN
      ALTER TABLE journal_entries
        ADD CONSTRAINT journal_entries_prompt_id_fkey
        FOREIGN KEY (prompt_id) REFERENCES journal_prompts(id) ON DELETE SET NULL;
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

-- ─── Add attachments JSONB column ───────────────────────────────
ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;

-- ─── RLS: all authenticated can read prompts (already exists from 053) ──
-- No changes needed — policy from migration 053 covers this.

-- ─── Create storage bucket for journal attachments ──────────────
-- Note: storage bucket creation is done via Supabase dashboard or API
-- Bucket name: journal-attachments
-- Public: false (use signed URLs or RLS)
