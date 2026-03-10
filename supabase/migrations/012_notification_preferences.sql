-- 012: Ajouter les préférences de notification au profil
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS notification_preferences jsonb
DEFAULT '{"new_messages": true, "new_leads": true, "call_reminders": true, "formation_progress": false}'::jsonb;
