-- Update all existing profiles to admin role
-- (profiles created before the default was changed)
UPDATE public.profiles SET role = 'admin' WHERE role = 'student';
