-- Message templates / quick replies
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  shortcut TEXT UNIQUE,
  is_shared BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;

-- Users see their own + shared templates
CREATE POLICY "templates_select" ON message_templates FOR SELECT
  USING (auth.uid() = created_by OR is_shared = true);

CREATE POLICY "templates_insert" ON message_templates FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "templates_update" ON message_templates FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "templates_delete" ON message_templates FOR DELETE
  USING (auth.uid() = created_by);

-- Index for shortcut search
CREATE INDEX IF NOT EXISTS idx_message_templates_shortcut ON message_templates (shortcut);
CREATE INDEX IF NOT EXISTS idx_message_templates_created_by ON message_templates (created_by);
CREATE INDEX IF NOT EXISTS idx_message_templates_category ON message_templates (category);

-- RPC for atomic usage increment
CREATE OR REPLACE FUNCTION increment_template_usage(template_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE message_templates
  SET usage_count = usage_count + 1,
      updated_at = now()
  WHERE id = template_id;
END;
$$;
