-- Sprint 11: User preferences (notification settings, email digest)

CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Notification toggles
  notify_messages boolean NOT NULL DEFAULT true,
  notify_feed boolean NOT NULL DEFAULT true,
  notify_reports boolean NOT NULL DEFAULT true,
  notify_badges boolean NOT NULL DEFAULT true,
  notify_checkins boolean NOT NULL DEFAULT true,
  notify_goals boolean NOT NULL DEFAULT true,
  notify_calls boolean NOT NULL DEFAULT true,
  notify_forms boolean NOT NULL DEFAULT true,
  notify_certificates boolean NOT NULL DEFAULT true,
  -- Email preferences
  email_digest text NOT NULL DEFAULT 'daily' CHECK (email_digest IN ('none', 'daily', 'weekly')),
  email_marketing boolean NOT NULL DEFAULT true,
  -- Timestamps
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can read/update their own preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Auto-create preferences on first access (function)
CREATE OR REPLACE FUNCTION ensure_user_preferences()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: auto-create preferences when a profile is created
CREATE TRIGGER trg_ensure_user_preferences
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION ensure_user_preferences();

-- Updated_at trigger
CREATE TRIGGER set_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION moddatetime(updated_at);
