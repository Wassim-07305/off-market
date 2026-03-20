-- ═══════════════════════════════════════════════════════════════
-- 099 — Enable realtime on profiles table
-- Required for the AuthProvider to listen to role changes via
-- postgres_changes subscription
-- ═══════════════════════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
