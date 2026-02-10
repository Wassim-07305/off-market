-- Migration 009: Off-Market v2 simplification
-- - New lead statuses for prospection pipeline
-- - Add coaching/closing call types
-- - Add calls_made/looms_sent to setter_activities
-- - RLS for eleve self-service

-- ============================================
-- 1. LEADS: New prospection pipeline statuses
-- ============================================

-- Drop old constraint if exists
ALTER TABLE leads DROP CONSTRAINT IF EXISTS leads_status_check;

-- Add new constraint with prospection pipeline statuses
ALTER TABLE leads ADD CONSTRAINT leads_status_check
  CHECK (status IN ('premier_message','en_discussion','qualifie','loom_envoye','call_planifie','close','perdu'));

-- Migrate existing data from old statuses
UPDATE leads SET status = 'premier_message' WHERE status = 'à_relancer';
UPDATE leads SET status = 'en_discussion' WHERE status = 'en_cours';
UPDATE leads SET status = 'call_planifie' WHERE status = 'booké';
UPDATE leads SET status = 'perdu' WHERE status IN ('no_show', 'pas_intéressé');
-- Catch-all for any remaining old statuses
UPDATE leads SET status = 'premier_message' WHERE status NOT IN ('premier_message','en_discussion','qualifie','loom_envoye','call_planifie','close','perdu');

-- Drop client_status column if it exists (no longer used)
ALTER TABLE leads DROP COLUMN IF EXISTS client_status;

-- ============================================
-- 2. CALL CALENDAR: Add coaching/closing types
-- ============================================

ALTER TABLE call_calendar DROP CONSTRAINT IF EXISTS call_calendar_type_check;

ALTER TABLE call_calendar ADD CONSTRAINT call_calendar_type_check
  CHECK (type IN ('manuel','iclosed','calendly','coaching','closing','autre'));

-- ============================================
-- 3. SETTER ACTIVITIES: Add calls_made/looms_sent
-- ============================================

ALTER TABLE setter_activities ADD COLUMN IF NOT EXISTS calls_made INTEGER DEFAULT 0;
ALTER TABLE setter_activities ADD COLUMN IF NOT EXISTS looms_sent INTEGER DEFAULT 0;

-- ============================================
-- 4. RLS: Eleve self-service policies
-- ============================================

-- Leads: eleves can manage their own leads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'leads_eleve_own' AND tablename = 'leads'
  ) THEN
    CREATE POLICY leads_eleve_own ON leads FOR ALL
      USING (has_role('eleve') AND assigned_to = auth.uid());
  END IF;
END$$;

-- Call calendar: eleves can manage their own calls
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'calls_eleve_own' AND tablename = 'call_calendar'
  ) THEN
    CREATE POLICY calls_eleve_own ON call_calendar FOR ALL
      USING (has_role('eleve') AND assigned_to = auth.uid());
  END IF;
END$$;

-- Setter activities: eleves can manage their own activities
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'setter_activities_eleve_own' AND tablename = 'setter_activities'
  ) THEN
    CREATE POLICY setter_activities_eleve_own ON setter_activities FOR ALL
      USING (has_role('eleve') AND user_id = auth.uid());
  END IF;
END$$;
