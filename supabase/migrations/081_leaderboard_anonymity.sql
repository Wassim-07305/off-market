-- Migration: Add leaderboard anonymity columns to profiles
-- Allows users to hide their real name on the leaderboard

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS leaderboard_anonymous BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS anonymous_alias TEXT;

-- Index for efficient leaderboard queries filtering anonymous users
CREATE INDEX IF NOT EXISTS idx_profiles_leaderboard_anonymous
  ON profiles (leaderboard_anonymous)
  WHERE leaderboard_anonymous = true;
