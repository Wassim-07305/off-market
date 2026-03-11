-- ============================================================
-- 016: School / Formation Enhancements
-- Ajoute des colonnes manquantes aux lecons et ameliore le storage
-- ============================================================

-- Ajouter une description aux lecons
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS description TEXT;

-- Ajouter les attachments (fichiers joints) en JSONB
-- Format: [{name: string, url: string, type: string}]
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]';

-- Ajouter video_url et content_html directement sur les lecons
-- (plus simple que de passer par le JSONB content pour l'editeur)
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS video_url TEXT;
ALTER TABLE public.lessons ADD COLUMN IF NOT EXISTS content_html TEXT;

-- Ajouter une description aux modules (utile pour l'editeur)
ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS description TEXT;
