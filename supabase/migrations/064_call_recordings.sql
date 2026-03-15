-- Call recordings storage
CREATE TABLE IF NOT EXISTS call_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL,
  recorded_by UUID REFERENCES auth.users(id),
  storage_path TEXT NOT NULL,
  duration_seconds INTEGER,
  file_size_bytes BIGINT,
  mime_type TEXT DEFAULT 'video/webm',
  transcript_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE call_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recordings_select" ON call_recordings FOR SELECT
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role IN ('admin','coach')));

CREATE POLICY "recordings_insert" ON call_recordings FOR INSERT
  WITH CHECK (auth.uid() = recorded_by);

-- Storage bucket (needs to be created via Supabase dashboard or API)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('call-recordings', 'call-recordings', false);
