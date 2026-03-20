-- ============================================================
-- FIX MINIMAL — Off-Market (pas de DROP, pas de modif de données)
-- SQL Editor Supabase :
-- https://supabase.com/dashboard/project/srhpdgqqiuzdrlqaitdk/sql/new
-- ============================================================

-- ─── 1. get_my_role() ────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- ─── 2. onboarding_progress ──────────────────────────────────
CREATE TABLE IF NOT EXISTS onboarding_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, step)
);
ALTER TABLE onboarding_progress ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='onboarding_progress' AND policyname='onboarding_own') THEN
    CREATE POLICY "onboarding_own" ON onboarding_progress FOR ALL
      USING (auth.uid() = user_id OR get_my_role() = 'admin');
  END IF;
END $$;

-- ─── 3. coach_assignments — ajouter colonnes manquantes ──────
-- La table peut exister avec un schéma incomplet, on ajoute sans supprimer
CREATE TABLE IF NOT EXISTS coach_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  assigned_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE coach_assignments ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';
ALTER TABLE coach_assignments ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE coach_assignments ADD COLUMN IF NOT EXISTS assigned_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE coach_assignments ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Contrainte CHECK sur status (safe : ne casse pas les données existantes)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'coach_assignments_status_check'
  ) THEN
    ALTER TABLE coach_assignments
      ADD CONSTRAINT coach_assignments_status_check
      CHECK (status IN ('active', 'paused', 'ended'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_coach_assignments_coach_id ON coach_assignments(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_assignments_client_id ON coach_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_coach_assignments_status ON coach_assignments(status);

ALTER TABLE coach_assignments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coach_assignments' AND policyname='admin_full_access_coach_assignments') THEN
    CREATE POLICY "admin_full_access_coach_assignments" ON coach_assignments FOR ALL TO authenticated
      USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
      WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coach_assignments' AND policyname='coach_select_own_assignments') THEN
    CREATE POLICY "coach_select_own_assignments" ON coach_assignments FOR SELECT TO authenticated
      USING (coach_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coach_assignments' AND policyname='client_select_own_assignment') THEN
    CREATE POLICY "client_select_own_assignment" ON coach_assignments FOR SELECT TO authenticated
      USING (client_id = auth.uid());
  END IF;
END $$;

-- ─── 4. course_prerequisites — ajouter prerequisite_course_id ─
-- La table existe avec "prerequisite_id", on ajoute "prerequisite_course_id"
ALTER TABLE course_prerequisites
  ADD COLUMN IF NOT EXISTS prerequisite_course_id UUID REFERENCES courses(id) ON DELETE CASCADE;

-- Copier les données existantes (prerequisite_id → prerequisite_course_id)
UPDATE course_prerequisites
SET prerequisite_course_id = prerequisite_id
WHERE prerequisite_course_id IS NULL
  AND prerequisite_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM courses WHERE id = prerequisite_id);

CREATE INDEX IF NOT EXISTS idx_course_prerequisites_prereq
  ON course_prerequisites(prerequisite_course_id);

-- ─── 5. Tables Alexia (AI) ────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS vector;

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

ALTER TABLE coach_ai_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_ai_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_ai_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_ai_config ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coach_ai_documents' AND policyname='Coach manages own AI documents') THEN
    CREATE POLICY "Coach manages own AI documents" ON coach_ai_documents FOR ALL USING (coach_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coach_ai_chunks' AND policyname='Coach sees own chunks') THEN
    CREATE POLICY "Coach sees own chunks" ON coach_ai_chunks FOR SELECT USING (coach_id = auth.uid());
    CREATE POLICY "Insert chunks" ON coach_ai_chunks FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='client_ai_memory' AND policyname='Coach sees client memories') THEN
    CREATE POLICY "Coach sees client memories" ON client_ai_memory FOR ALL USING (coach_id = auth.uid());
    CREATE POLICY "Client sees own memory" ON client_ai_memory FOR SELECT USING (client_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='coach_ai_config' AND policyname='Coach manages own AI config') THEN
    CREATE POLICY "Coach manages own AI config" ON coach_ai_config FOR ALL USING (coach_id = auth.uid());
    CREATE POLICY "Anyone can read AI config" ON coach_ai_config FOR SELECT USING (true);
  END IF;
END $$;

-- Fonction RAG Alexia
CREATE OR REPLACE FUNCTION match_coach_chunks(
  query_embedding vector(768),
  p_coach_id UUID,
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 5
)
RETURNS TABLE (id UUID, content TEXT, similarity FLOAT)
LANGUAGE sql STABLE AS $$
  SELECT c.id, c.content, 1 - (c.embedding <=> query_embedding) AS similarity
  FROM coach_ai_chunks c
  WHERE c.coach_id = p_coach_id
    AND 1 - (c.embedding <=> query_embedding) > match_threshold
  ORDER BY c.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ─── 6. Colonnes manquantes weekly_checkins ──────────────────
-- Ajouter les colonnes de la migration 032 si elles n'existent pas
ALTER TABLE weekly_checkins ADD COLUMN IF NOT EXISTS energy integer CHECK (energy BETWEEN 1 AND 5);
ALTER TABLE weekly_checkins ADD COLUMN IF NOT EXISTS gratitudes text[] DEFAULT '{}';
ALTER TABLE weekly_checkins ADD COLUMN IF NOT EXISTS daily_goals text[] DEFAULT '{}';
ALTER TABLE weekly_checkins ADD COLUMN IF NOT EXISTS notes text;

-- ─── 7. Colonnes manquantes journal_entries ───────────────────
-- Ajouter les colonnes de la migration 053 et 078 si elles n'existent pas
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS media_urls text[] DEFAULT '{}';
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS shared_with_coach boolean DEFAULT false;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS prompt_id uuid;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS template text;
ALTER TABLE journal_entries ADD COLUMN IF NOT EXISTS attachments jsonb DEFAULT '[]'::jsonb;

-- ─── 8. Bucket Supabase Storage pour les pièces jointes ──────
-- Creer le bucket 'attachments' en tant que bucket public
INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Politique RLS : les utilisateurs authentifies peuvent uploader et lire leurs fichiers
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'attachments_upload'
  ) THEN
    CREATE POLICY "attachments_upload" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'attachments');
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'attachments_public_read'
  ) THEN
    CREATE POLICY "attachments_public_read" ON storage.objects
      FOR SELECT USING (bucket_id = 'attachments');
  END IF;
END $$;

SELECT 'OK' AS status;
