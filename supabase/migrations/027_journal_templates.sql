-- Sprint 14: Journal enhancements — template field

ALTER TABLE journal_entries
  ADD COLUMN IF NOT EXISTS template text DEFAULT null;

-- Add index for search
CREATE INDEX IF NOT EXISTS idx_journal_entries_author_created
  ON journal_entries(author_id, created_at DESC);
