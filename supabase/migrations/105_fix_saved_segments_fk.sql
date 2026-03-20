-- Fix saved_segments.created_by FK to profiles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'saved_segments' AND column_name = 'created_by'
  ) THEN
    BEGIN
      ALTER TABLE public.saved_segments
        ADD CONSTRAINT saved_segments_created_by_fkey
        FOREIGN KEY (created_by) REFERENCES public.profiles(id) ON DELETE CASCADE;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END IF;
END $$;

NOTIFY pgrst, 'reload schema';
