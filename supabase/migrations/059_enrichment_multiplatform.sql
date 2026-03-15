-- 059: Add multiplatform enrichment columns to crm_contacts
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS tiktok_url TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE crm_contacts ADD COLUMN IF NOT EXISTS youtube_url TEXT;
