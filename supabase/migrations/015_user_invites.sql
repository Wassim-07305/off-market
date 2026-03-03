-- ============================================
-- Migration 015: Systeme d'invitations
-- ============================================

-- Table des invitations
CREATE TABLE public.user_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','coach','setter','closer','client')),
  invite_code TEXT NOT NULL UNIQUE DEFAULT gen_random_uuid()::text,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','expired')),
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT now() + INTERVAL '7 days',
  accepted_at TIMESTAMPTZ
);

-- Index pour la recherche par code
CREATE INDEX idx_user_invites_code ON public.user_invites(invite_code);
CREATE INDEX idx_user_invites_email ON public.user_invites(email);
CREATE INDEX idx_user_invites_status ON public.user_invites(status);

-- RLS : seuls les admins gerent les invitations
ALTER TABLE public.user_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage invites"
  ON public.user_invites FOR ALL
  USING (get_my_role() = 'admin');

-- RPC pour valider un code d'invitation (accessible sans auth)
CREATE OR REPLACE FUNCTION public.validate_invite_code(code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invite RECORD;
BEGIN
  SELECT * INTO invite FROM public.user_invites
  WHERE invite_code = code AND status = 'pending' AND expires_at > now();

  IF NOT FOUND THEN
    RETURN json_build_object('valid', false);
  END IF;

  RETURN json_build_object(
    'valid', true,
    'email', invite.email,
    'full_name', invite.full_name,
    'role', invite.role
  );
END;
$$;

-- Mettre a jour handle_new_user pour verifier les invitations
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  invite_record RECORD;
  user_name TEXT;
  target_role TEXT;
BEGIN
  -- Chercher une invitation pending pour cet email
  SELECT * INTO invite_record FROM public.user_invites
  WHERE email = NEW.email AND status = 'pending'
  ORDER BY created_at DESC
  LIMIT 1;

  IF FOUND THEN
    -- Utiliser les infos de l'invitation
    user_name := invite_record.full_name;
    target_role := invite_record.role;

    -- Marquer l'invitation comme acceptee
    UPDATE public.user_invites
    SET status = 'accepted', accepted_at = now()
    WHERE id = invite_record.id;
  ELSE
    -- Inscription libre: role client par defaut
    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
    target_role := 'client';
  END IF;

  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, onboarding_completed, onboarding_step)
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    NEW.raw_user_meta_data->>'avatar_url',
    target_role::public.user_role,
    false,
    0
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
