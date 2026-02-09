-- ============================================
-- RPC: Seed demo profiles (SECURITY DEFINER)
-- ============================================
-- Creates 5 fake auth.users entries. The handle_new_user() trigger
-- auto-creates profiles + user_roles. We then update names and roles.

CREATE OR REPLACE FUNCTION public.create_demo_profiles(admin_id UUID)
RETURNS JSONB AS $$
DECLARE
  _ids UUID[] := ARRAY[
    gen_random_uuid(),
    gen_random_uuid(),
    gen_random_uuid(),
    gen_random_uuid(),
    gen_random_uuid()
  ];
  _names TEXT[] := ARRAY[
    'Karim Benzema',
    'Sarah Martin',
    'Lucas Dupont',
    'Emma Lefèvre',
    'Thomas Moreau'
  ];
  _emails TEXT[] := ARRAY[
    'karim.benzema@demo.local',
    'sarah.martin@demo.local',
    'lucas.dupont@demo.local',
    'emma.lefevre@demo.local',
    'thomas.moreau@demo.local'
  ];
  _roles app_role[] := ARRAY[
    'closer',
    'setter',
    'setter',
    'coach',
    'monteur'
  ];
  i INT;
BEGIN
  FOR i IN 1..5 LOOP
    -- Insert minimal auth.users entry (trigger creates profile + user_role)
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    ) VALUES (
      _ids[i],
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      _emails[i],
      crypt('demo-password-never-used', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      jsonb_build_object('full_name', _names[i]),
      now(),
      now(),
      '',
      ''
    );

    -- Update the profile name (trigger sets it from raw_user_meta_data)
    UPDATE public.profiles
    SET full_name = _names[i]
    WHERE id = _ids[i];

    -- Update the role
    UPDATE public.user_roles
    SET role = _roles[i]
    WHERE user_id = _ids[i];
  END LOOP;

  -- Set coach_id for Emma Lefèvre → admin
  UPDATE public.profiles
  SET coach_id = admin_id
  WHERE id = _ids[4];

  RETURN jsonb_build_object(
    'profile_ids', to_jsonb(_ids),
    'karim_id', _ids[1],
    'sarah_id', _ids[2],
    'lucas_id', _ids[3],
    'emma_id', _ids[4],
    'thomas_id', _ids[5]
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RPC: Delete demo profiles (SECURITY DEFINER)
-- ============================================
-- Deletes auth.users entries → CASCADE removes profiles, user_roles,
-- and all FK-linked rows.

CREATE OR REPLACE FUNCTION public.delete_demo_profiles(profile_ids UUID[])
RETURNS VOID AS $$
BEGIN
  DELETE FROM auth.users WHERE id = ANY(profile_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
