-- ═══════════════════════════════════════════════════════════════
-- 013 — Video Calls (WebRTC rooms + transcripts)
-- ═══════════════════════════════════════════════════════════════

-- Add room columns to call_calendar
ALTER TABLE call_calendar
  ADD COLUMN IF NOT EXISTS room_status TEXT NOT NULL DEFAULT 'idle'
    CHECK (room_status IN ('idle','waiting','active','ended')),
  ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS actual_duration_seconds INTEGER;

-- Transcripts table
CREATE TABLE IF NOT EXISTS call_transcripts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id UUID NOT NULL REFERENCES call_calendar(id) ON DELETE CASCADE,
  content JSONB NOT NULL DEFAULT '[]'::jsonb,
  language TEXT NOT NULL DEFAULT 'fr-FR',
  duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_call_transcripts_call_id ON call_transcripts(call_id);

-- RLS
ALTER TABLE call_transcripts ENABLE ROW LEVEL SECURITY;

-- Admin sees all transcripts
CREATE POLICY "admin_all_transcripts" ON call_transcripts
  FOR ALL USING (get_my_role() = 'admin');

-- Coach sees transcripts for their calls
CREATE POLICY "coach_own_transcripts" ON call_transcripts
  FOR ALL USING (
    get_my_role() = 'coach' AND call_id IN (
      SELECT id FROM call_calendar WHERE assigned_to = auth.uid()
    )
  );

-- Setter/Closer sees transcripts for their calls
CREATE POLICY "sales_own_transcripts" ON call_transcripts
  FOR ALL USING (
    get_my_role() IN ('setter', 'closer') AND call_id IN (
      SELECT id FROM call_calendar WHERE assigned_to = auth.uid()
    )
  );

-- Client sees transcripts for calls where they are the client
CREATE POLICY "client_own_transcripts" ON call_transcripts
  FOR SELECT USING (
    get_my_role() = 'client' AND call_id IN (
      SELECT id FROM call_calendar WHERE client_id = auth.uid()
    )
  );
