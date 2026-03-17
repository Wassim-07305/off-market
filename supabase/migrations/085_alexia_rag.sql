-- AlexIA: RAG-powered AI assistant with coach knowledge base & client memory
-- Requires: pgvector extension

CREATE EXTENSION IF NOT EXISTS vector;

-- ─── Coach AI Documents (metadata) ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coach_ai_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT,
  file_size INTEGER DEFAULT 0,
  file_type TEXT DEFAULT 'text',
  chunk_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'processing' CHECK (status IN ('processing', 'ready', 'error')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coach_ai_documents_coach ON coach_ai_documents(coach_id);

-- ─── Document Chunks with Embeddings ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coach_ai_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES coach_ai_documents(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(768),
  chunk_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_coach_ai_chunks_coach ON coach_ai_chunks(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_ai_chunks_document ON coach_ai_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_coach_ai_chunks_embedding ON coach_ai_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 50);

-- ─── Client AI Memory (cumulative summary per client) ─────────────────────────
CREATE TABLE IF NOT EXISTS client_ai_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  summary TEXT NOT NULL DEFAULT '',
  key_facts JSONB DEFAULT '[]',
  last_topics JSONB DEFAULT '[]',
  conversation_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, coach_id)
);

CREATE INDEX IF NOT EXISTS idx_client_ai_memory_coach ON client_ai_memory(coach_id);
CREATE INDEX IF NOT EXISTS idx_client_ai_memory_client ON client_ai_memory(client_id);

-- ─── Coach AI Config (system prompt, instructions, preferences) ───────────────
CREATE TABLE IF NOT EXISTS coach_ai_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  ai_name TEXT DEFAULT 'AlexIA',
  system_instructions TEXT DEFAULT '',
  tone TEXT DEFAULT 'professionnel',
  greeting_message TEXT DEFAULT 'Bonjour ! Je suis AlexIA, l''assistante de ton coach. Comment puis-je t''aider ?',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── RLS Policies ─────────────────────────────────────────────────────────────

ALTER TABLE coach_ai_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_ai_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_ai_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_ai_config ENABLE ROW LEVEL SECURITY;

-- Documents: coach sees own docs
CREATE POLICY "Coach manages own AI documents" ON coach_ai_documents
  FOR ALL USING (coach_id = auth.uid());

-- Chunks: coach sees own chunks, service role for ingestion
CREATE POLICY "Coach sees own chunks" ON coach_ai_chunks
  FOR SELECT USING (coach_id = auth.uid());
CREATE POLICY "Insert chunks" ON coach_ai_chunks
  FOR INSERT WITH CHECK (true);

-- Memory: coach sees all client memories, client sees own
CREATE POLICY "Coach sees client memories" ON client_ai_memory
  FOR ALL USING (coach_id = auth.uid());
CREATE POLICY "Client sees own memory" ON client_ai_memory
  FOR SELECT USING (client_id = auth.uid());

-- Config: coach manages own config
CREATE POLICY "Coach manages own AI config" ON coach_ai_config
  FOR ALL USING (coach_id = auth.uid());
-- Allow read for anyone (clients need to read coach config for AI name/greeting)
CREATE POLICY "Anyone can read AI config" ON coach_ai_config
  FOR SELECT USING (true);

-- ─── Similarity search function ───────────────────────────────────────────────
CREATE OR REPLACE FUNCTION match_coach_chunks(
  query_embedding vector(768),
  p_coach_id UUID,
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    c.id,
    c.content,
    1 - (c.embedding <=> query_embedding) AS similarity
  FROM coach_ai_chunks c
  WHERE c.coach_id = p_coach_id
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$;
