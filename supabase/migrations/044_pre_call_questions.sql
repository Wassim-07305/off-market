-- Pre-call mandatory questions enhancement (044)
-- The base table pre_call_answers was created in 038_pre_call_and_session_notes.sql
-- This migration adds missing indexes and ensures the RLS policies cover
-- the use-case where coaches/staff can also see responses for calls assigned to them.

-- Allow coaches to see pre-call answers for calls they are assigned to
CREATE POLICY IF NOT EXISTS "Coaches can view answers for their calls"
  ON pre_call_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM call_calendar
      WHERE call_calendar.id = pre_call_answers.call_id
      AND call_calendar.assigned_to = auth.uid()
    )
  );

-- Allow clients to view their own pre-call answers (needed for "already answered" check)
-- The existing ALL policy covers insert/update/delete but let's ensure select works independently
CREATE POLICY IF NOT EXISTS "Clients can read own pre-call answers"
  ON pre_call_answers FOR SELECT
  USING (auth.uid() = user_id);

-- Composite index for fast lookup by call + user
CREATE INDEX IF NOT EXISTS idx_pre_call_answers_call_user
  ON pre_call_answers(call_id, user_id);
