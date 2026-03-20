-- ═══════════════════════════════════════════════════════════════
-- 102 — Definitive fix for handle_new_user trigger
-- The trigger crashes because profiles.role CHECK constraint
-- doesn't include all invitation roles.
-- ═══════════════════════════════════════════════════════════════

-- STEP 1: Add ENUM values (must be top-level, NOT inside DO/EXCEPTION)
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'setter';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'closer';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'client';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'sales';

-- STEP 2: Drop ALL check constraints on profiles.role
DO $$
DECLARE
  _con TEXT;
BEGIN
  FOR _con IN
    SELECT cc.conname
    FROM pg_constraint cc
    JOIN pg_attribute a ON a.attnum = ANY(cc.conkey) AND a.attrelid = cc.conrelid
    WHERE cc.conrelid = 'public.profiles'::regclass
      AND cc.contype = 'c'
      AND a.attname = 'role'
  LOOP
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', _con);
  END LOOP;
END $$;

-- STEP 3: Add the correct CHECK with ALL roles
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'coach', 'team', 'student', 'prospect', 'setter', 'closer', 'client', 'sales'));

-- STEP 4: Recreate handle_new_user() — TEXT variable, no ENUM cast
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  invite_record RECORD;
  assigned_role TEXT;
BEGIN
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

NOTIFY pgrst, 'reload schema';
