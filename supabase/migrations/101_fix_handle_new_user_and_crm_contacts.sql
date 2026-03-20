-- ═══════════════════════════════════════════════════════════════
-- 101 — Fix handle_new_user trigger + crm_contacts column alias
-- Fully defensive — every statement independent
-- ═══════════════════════════════════════════════════════════════

-- ─── STEP 1: Check if profiles.role uses ENUM or TEXT ──────────
-- If it's ENUM, add missing values. If TEXT, fix the CHECK.
-- First, add all missing ENUM values (safe — IF NOT EXISTS)
DO $$ BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'setter'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'closer'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'client'; EXCEPTION WHEN others THEN NULL; END $$;
DO $$ BEGIN ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'sales';  EXCEPTION WHEN others THEN NULL; END $$;

-- ─── STEP 2: If role column is TEXT with CHECK, update CHECK ───
DO $$ BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
EXCEPTION WHEN others THEN NULL;
END $$;

-- Only add CHECK if role is TEXT (not ENUM — ENUM enforces values itself)
DO $$
DECLARE
  col_type TEXT;
BEGIN
  SELECT data_type INTO col_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'profiles'
    AND column_name = 'role';

  IF col_type = 'text' OR col_type = 'character varying' THEN
    EXECUTE 'ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
      CHECK (role IN (''admin'', ''coach'', ''team'', ''student'', ''prospect'', ''setter'', ''closer'', ''client'', ''sales''))';
  END IF;
END $$;

-- ─── STEP 3: Recreate handle_new_user() with TEXT variable ─────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  invite_record RECORD;
  assigned_role TEXT;
BEGIN
  -- Check for pending invitation
  SELECT * INTO invite_record
  FROM user_invites
  WHERE email = NEW.email AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;

  IF invite_record IS NOT NULL THEN
    assigned_role := invite_record.role;
    UPDATE user_invites SET status = 'accepted', accepted_at = now()
    WHERE id = invite_record.id;
  ELSE
    assigned_role := 'prospect';
  END IF;

  INSERT INTO profiles (id, email, full_name, role, onboarding_completed)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    assigned_role,
    CASE WHEN assigned_role IN ('client', 'prospect') THEN false ELSE true END
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name;

  RETURN NEW;
END;
$$;

-- ─── STEP 4: Add pipeline_stage generated column to crm_contacts
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'crm_contacts'
      AND column_name = 'pipeline_stage'
  ) THEN
    ALTER TABLE public.crm_contacts
      ADD COLUMN pipeline_stage TEXT
      GENERATED ALWAYS AS (stage) STORED;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
