-- ============================================================
-- Knowledge Base — Pages imbriquees type Notion
-- ============================================================

-- Ajouter les colonnes manquantes pour le systeme de pages
ALTER TABLE knowledge_base_entries ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES knowledge_base_entries(id) ON DELETE SET NULL;
ALTER TABLE knowledge_base_entries ADD COLUMN IF NOT EXISTS icon text;
ALTER TABLE knowledge_base_entries ADD COLUMN IF NOT EXISTS cover_image_url text;
ALTER TABLE knowledge_base_entries ADD COLUMN IF NOT EXISTS is_template boolean DEFAULT false;
ALTER TABLE knowledge_base_entries ADD COLUMN IF NOT EXISTS sort_order int DEFAULT 0;
ALTER TABLE knowledge_base_entries ADD COLUMN IF NOT EXISTS is_published boolean DEFAULT true;
ALTER TABLE knowledge_base_entries ADD COLUMN IF NOT EXISTS slug text;

-- Index pour les requetes hierarchiques
CREATE INDEX IF NOT EXISTS idx_kb_entries_parent ON knowledge_base_entries(parent_id);
CREATE INDEX IF NOT EXISTS idx_kb_entries_slug ON knowledge_base_entries(slug);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_kb_entries_fts ON knowledge_base_entries
  USING gin(to_tsvector('french', coalesce(title, '') || ' ' || coalesce(content, '')));
