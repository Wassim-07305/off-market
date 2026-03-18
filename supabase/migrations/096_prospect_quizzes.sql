-- Add prospect role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'prospect';

-- Quizzes (lead magnets)
CREATE TABLE IF NOT EXISTS quizzes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  slug text NOT NULL UNIQUE,
  questions jsonb NOT NULL DEFAULT '[]',
  results jsonb NOT NULL DEFAULT '[]',
  cta_text text DEFAULT 'Cree ton compte pour decouvrir ton plan d''action',
  cta_url text DEFAULT '/register',
  is_published boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id uuid NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  answers jsonb NOT NULL DEFAULT '{}',
  score integer NOT NULL DEFAULT 0,
  max_score integer NOT NULL DEFAULT 0,
  result_index integer,
  email text,
  profile_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all" ON quizzes FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "public_read_published" ON quizzes FOR SELECT USING (is_published = true);

ALTER TABLE quiz_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone_insert" ON quiz_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_read" ON quiz_submissions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "own_read" ON quiz_submissions FOR SELECT USING (profile_id = auth.uid());

-- Default role for open signup = prospect
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  invite_record RECORD;
  assigned_role user_role;
BEGIN
  SELECT * INTO invite_record FROM user_invites WHERE email = NEW.email AND status = 'pending' LIMIT 1;
  IF invite_record IS NOT NULL THEN
    assigned_role := invite_record.role::user_role;
    UPDATE user_invites SET status = 'accepted', accepted_at = now() WHERE id = invite_record.id;
  ELSE
    assigned_role := 'prospect';
  END IF;
  INSERT INTO profiles (id, email, full_name, role, onboarding_completed)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), assigned_role, false)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

NOTIFY pgrst, 'reload schema';
