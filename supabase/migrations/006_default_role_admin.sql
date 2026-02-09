-- ============================================
-- Change default role from 'setter' to 'admin'
-- ============================================

-- 1. Change the column default
ALTER TABLE user_roles ALTER COLUMN role SET DEFAULT 'admin';

-- 2. Replace the trigger function to assign 'admin' to new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Update all existing setter users to admin
UPDATE user_roles SET role = 'admin' WHERE role = 'setter';
