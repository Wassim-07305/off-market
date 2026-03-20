-- ═══════════════════════════════════════════════════════════════
-- 104 — Coach specialties for smart assignment
-- Adds specialties TEXT[] to profiles (for coaches)
-- ═══════════════════════════════════════════════════════════════

-- Add specialties to profiles (for coaches)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_profiles_specialties
  ON public.profiles USING GIN (specialties);

-- Add specialties to user_invites (stored at invitation time)
ALTER TABLE public.user_invites
  ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT '{}';

-- Update handle_new_user to copy specialties from invitation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  invite_record RECORD;
  assigned_role TEXT;
  coach_specialties TEXT[];
BEGIN
  SELECT * INTO invite_record
  FROM user_invites
  WHERE email = NEW.email AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;

  IF invite_record IS NOT NULL THEN
    assigned_role := invite_record.role;
    coach_specialties := COALESCE(invite_record.specialties, '{}');
    UPDATE user_invites SET status = 'accepted', accepted_at = now()
    WHERE id = invite_record.id;
  ELSE
    assigned_role := 'prospect';
    coach_specialties := '{}';
  END IF;

  INSERT INTO profiles (id, email, full_name, role, specialties, onboarding_completed)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    assigned_role,
    coach_specialties,
    CASE WHEN assigned_role IN ('client', 'prospect') THEN false ELSE true END
  )
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    full_name = EXCLUDED.full_name,
    specialties = EXCLUDED.specialties;

  RETURN NEW;
END;
$$;

NOTIFY pgrst, 'reload schema';
