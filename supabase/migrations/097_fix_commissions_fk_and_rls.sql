-- ═══════════════════════════════════════════════════════════════
-- 097 — Fix commissions FK + RLS
-- contractor_id FK points to auth.users instead of profiles
-- → PostgREST can't resolve profiles!commissions_contractor_id_fkey
-- Same fix pattern as 095 (resources.uploaded_by)
-- ═══════════════════════════════════════════════════════════════

-- Drop any existing FK on contractor_id
DO $$
DECLARE
  _con TEXT;
BEGIN
  FOR _con IN
    SELECT tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.table_name = 'commissions'
      AND tc.table_schema = 'public'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name = 'contractor_id'
  LOOP
    EXECUTE format('ALTER TABLE public.commissions DROP CONSTRAINT %I', _con);
  END LOOP;
END $$;

-- Add FK to profiles(id) so PostgREST can resolve the join
ALTER TABLE public.commissions
  ADD CONSTRAINT commissions_contractor_id_fkey
  FOREIGN KEY (contractor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Setter/closer can INSERT commissions (auto-commission from pipeline)
DO $$ BEGIN
  CREATE POLICY "Sales can insert commissions" ON public.commissions
    FOR INSERT WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid()
          AND role IN ('setter', 'closer', 'coach', 'admin')
      )
    );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
