-- Sprint 13: Shared resource library

-- Storage bucket for resource files
INSERT INTO storage.buckets (id, name, public)
VALUES ('resources', 'resources', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view resources"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'resources');

CREATE POLICY "Staff can upload resources"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resources'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );

CREATE POLICY "Staff can delete resources"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'resources'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text NOT NULL, -- mime type
  file_size bigint NOT NULL DEFAULT 0,
  uploaded_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visibility text NOT NULL DEFAULT 'all' CHECK (visibility IN ('all', 'staff', 'clients')),
  is_pinned boolean NOT NULL DEFAULT false,
  download_count int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE resources ENABLE ROW LEVEL SECURITY;

-- Staff can do everything
CREATE POLICY "Staff full access on resources"
  ON resources FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'coach')
    )
  );

-- Clients can view resources visible to them
CREATE POLICY "Clients can view resources"
  ON resources FOR SELECT
  USING (
    visibility IN ('all', 'clients')
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'client'
    )
  );

-- Sales can view all-visible resources
CREATE POLICY "Sales can view resources"
  ON resources FOR SELECT
  USING (
    visibility = 'all'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('setter', 'closer')
    )
  );

-- Updated_at trigger
CREATE TRIGGER set_resources_updated_at
  BEFORE UPDATE ON resources
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);

-- RPC to increment download count atomically
CREATE OR REPLACE FUNCTION increment_download_count(resource_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE resources
  SET download_count = download_count + 1
  WHERE id = resource_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
