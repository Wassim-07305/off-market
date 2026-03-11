-- Change default role from 'student' to 'admin' for new signups
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'admin';
