-- 069: Chatbot onboarding — store conversational answers on profiles

-- JSONB column to store all chatbot onboarding answers
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_answers jsonb DEFAULT '{}';

-- Timestamp when the user completed the chatbot onboarding
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;
