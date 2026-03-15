-- Add intro video URL to profiles for CSM personalized onboarding
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS intro_video_url TEXT;

-- Comment
COMMENT ON COLUMN profiles.intro_video_url IS 'URL de la video d''introduction personnalisee du CSM';
