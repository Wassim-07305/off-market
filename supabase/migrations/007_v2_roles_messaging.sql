-- ============================================================================
-- Migration 007: V2 Role Simplification + Messaging System
-- ============================================================================
-- Simplifies roles from 6 (admin,manager,coach,setter,closer,monteur) to 3 (admin,setter,eleve)
-- Adds real-time messaging with channels, members, messages, and read tracking
-- Adds last_seen_at to profiles for presence tracking
-- ============================================================================

BEGIN;

-- ============================================================================
-- PART 0: Cleanup legacy tables (interviews/blockages removed from v1)
-- ============================================================================

DROP POLICY IF EXISTS interviews_admin ON interviews;
DROP POLICY IF EXISTS interviews_coach ON interviews;
DROP POLICY IF EXISTS interviews_member ON interviews;
DROP POLICY IF EXISTS blockages_admin ON blockages;
DROP POLICY IF EXISTS blockages_coach ON blockages;
DROP POLICY IF EXISTS blockages_member ON blockages;

DROP TABLE IF EXISTS blockages CASCADE;
DROP TABLE IF EXISTS interviews CASCADE;

-- ============================================================================
-- PART 1: Role Simplification (6 roles → 3: admin, setter, eleve)
-- ============================================================================

-- 1.1 Migrate existing data to new role values
-- All non-admin/setter roles become admin (existing team members keep full access)
UPDATE user_roles SET role = 'admin'::app_role
WHERE role::text IN ('manager', 'coach', 'closer', 'monteur');

UPDATE client_assignments SET role = 'admin'::app_role
WHERE role::text IN ('manager', 'coach', 'closer', 'monteur');

-- 1.2 Drop functions that use the app_role type (must be dropped before type change)
DROP FUNCTION IF EXISTS has_role(app_role) CASCADE;
DROP FUNCTION IF EXISTS is_coached_by(UUID) CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS create_demo_profiles(UUID) CASCADE;
DROP FUNCTION IF EXISTS delete_demo_profiles(UUID[]) CASCADE;

-- 1.3 Drop RLS policies that reference old role values
-- profiles
DROP POLICY IF EXISTS profiles_update_admin ON profiles;
-- user_roles
DROP POLICY IF EXISTS user_roles_admin ON user_roles;
-- clients
DROP POLICY IF EXISTS clients_admin_manager ON clients;
DROP POLICY IF EXISTS clients_coach ON clients;
-- client_assignments
DROP POLICY IF EXISTS assignments_admin_manager ON client_assignments;
-- leads
DROP POLICY IF EXISTS leads_admin_manager ON leads;
DROP POLICY IF EXISTS leads_coach ON leads;
-- call_calendar
DROP POLICY IF EXISTS calls_admin_manager ON call_calendar;
DROP POLICY IF EXISTS calls_coach ON call_calendar;
-- closer_calls
DROP POLICY IF EXISTS closer_admin_manager ON closer_calls;
DROP POLICY IF EXISTS closer_own ON closer_calls;
-- financial_entries
DROP POLICY IF EXISTS finance_admin_manager ON financial_entries;
-- payment_schedules
DROP POLICY IF EXISTS payments_admin_manager ON payment_schedules;
-- social_content
DROP POLICY IF EXISTS social_admin_manager ON social_content;
DROP POLICY IF EXISTS social_coach ON social_content;
-- setter_activities
DROP POLICY IF EXISTS setter_admin_manager ON setter_activities;
DROP POLICY IF EXISTS setter_coach ON setter_activities;
-- instagram_accounts
DROP POLICY IF EXISTS ig_accounts_admin_manager ON instagram_accounts;
DROP POLICY IF EXISTS ig_accounts_coach ON instagram_accounts;
-- instagram_post_stats
DROP POLICY IF EXISTS ig_stats_admin_manager ON instagram_post_stats;
DROP POLICY IF EXISTS ig_stats_coach ON instagram_post_stats;
-- rituals
DROP POLICY IF EXISTS rituals_admin_manager ON rituals;

-- 1.4 Drop column defaults
ALTER TABLE user_roles ALTER COLUMN role DROP DEFAULT;

-- 1.5 Convert columns to TEXT temporarily
ALTER TABLE user_roles ALTER COLUMN role TYPE TEXT;
ALTER TABLE client_assignments ALTER COLUMN role TYPE TEXT;

-- 1.6 Drop old enum, create new
DROP TYPE app_role;
CREATE TYPE app_role AS ENUM ('admin', 'setter', 'eleve');

-- 1.7 Convert columns back to enum
ALTER TABLE user_roles ALTER COLUMN role TYPE app_role USING role::app_role;
ALTER TABLE client_assignments ALTER COLUMN role TYPE app_role USING role::app_role;

-- 1.8 Set new defaults (new users default to 'eleve')
ALTER TABLE user_roles ALTER COLUMN role SET DEFAULT 'eleve'::app_role;

-- 1.9 Recreate helper functions
CREATE OR REPLACE FUNCTION has_role(_role app_role)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid() AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION is_assigned_to_client(_client_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM client_assignments
    WHERE client_id = _client_id AND user_id = auth.uid()
  );
$$;

-- 1.10 Recreate trigger function (default role = eleve)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
  );

  INSERT INTO user_roles (user_id, role)
  VALUES (NEW.id, 'eleve');

  RETURN NEW;
END;
$$;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 1.11 Recreate RLS policies with new roles
-- profiles (unchanged - already role-agnostic except admin update)
CREATE POLICY profiles_update_admin ON profiles FOR UPDATE USING (has_role('admin'));

-- user_roles
CREATE POLICY user_roles_admin ON user_roles FOR ALL USING (has_role('admin'));

-- clients (admin only for full access)
CREATE POLICY clients_admin ON clients FOR ALL USING (has_role('admin'));

-- client_assignments
CREATE POLICY assignments_admin ON client_assignments FOR ALL USING (has_role('admin'));

-- leads (admin full access, setter own leads)
CREATE POLICY leads_admin ON leads FOR ALL USING (has_role('admin'));

-- call_calendar (admin full access, assigned user own)
CREATE POLICY calls_admin ON call_calendar FOR ALL USING (has_role('admin'));

-- closer_calls (admin only)
CREATE POLICY closer_calls_admin ON closer_calls FOR ALL USING (has_role('admin'));

-- financial_entries
CREATE POLICY finance_admin ON financial_entries FOR ALL USING (has_role('admin'));

-- payment_schedules
CREATE POLICY payments_admin ON payment_schedules FOR ALL USING (has_role('admin'));

-- social_content (admin full access)
CREATE POLICY social_admin ON social_content FOR ALL USING (has_role('admin'));

-- setter_activities (admin full access)
CREATE POLICY setter_admin ON setter_activities FOR ALL USING (has_role('admin'));

-- instagram_accounts
CREATE POLICY ig_accounts_admin ON instagram_accounts FOR ALL USING (has_role('admin'));

-- instagram_post_stats
CREATE POLICY ig_stats_admin ON instagram_post_stats FOR ALL USING (has_role('admin'));

-- rituals
CREATE POLICY rituals_admin ON rituals FOR ALL USING (has_role('admin'));

-- 1.12 Recreate demo data functions (temporary stubs, updated in Phase 7)
CREATE OR REPLACE FUNCTION create_demo_profiles(admin_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_ids JSONB := '{}'::JSONB;
  new_id UUID;
BEGIN
  -- Create 2 setters
  new_id := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, role, aud)
  VALUES (new_id, '00000000-0000-0000-0000-000000000000', 'sarah.martin@demo.com', crypt('demo123456', gen_salt('bf')), NOW(), '{"full_name":"Sarah Martin"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated');
  UPDATE user_roles SET role = 'setter' WHERE user_id = new_id;
  profile_ids := profile_ids || jsonb_build_object('setter1', new_id);

  new_id := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, role, aud)
  VALUES (new_id, '00000000-0000-0000-0000-000000000000', 'lucas.dupont@demo.com', crypt('demo123456', gen_salt('bf')), NOW(), '{"full_name":"Lucas Dupont"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated');
  UPDATE user_roles SET role = 'setter' WHERE user_id = new_id;
  profile_ids := profile_ids || jsonb_build_object('setter2', new_id);

  -- Create 3 eleves
  new_id := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, role, aud)
  VALUES (new_id, '00000000-0000-0000-0000-000000000000', 'karim.benzema@demo.com', crypt('demo123456', gen_salt('bf')), NOW(), '{"full_name":"Karim Benzema"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated');
  profile_ids := profile_ids || jsonb_build_object('eleve1', new_id);

  new_id := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, role, aud)
  VALUES (new_id, '00000000-0000-0000-0000-000000000000', 'emma.lefevre@demo.com', crypt('demo123456', gen_salt('bf')), NOW(), '{"full_name":"Emma Lefèvre"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated');
  profile_ids := profile_ids || jsonb_build_object('eleve2', new_id);

  new_id := gen_random_uuid();
  INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_user_meta_data, created_at, updated_at, role, aud)
  VALUES (new_id, '00000000-0000-0000-0000-000000000000', 'thomas.moreau@demo.com', crypt('demo123456', gen_salt('bf')), NOW(), '{"full_name":"Thomas Moreau"}'::jsonb, NOW(), NOW(), 'authenticated', 'authenticated');
  profile_ids := profile_ids || jsonb_build_object('eleve3', new_id);

  RETURN profile_ids;
END;
$$;

CREATE OR REPLACE FUNCTION delete_demo_profiles(profile_ids UUID[])
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM auth.users WHERE id = ANY(profile_ids);
END;
$$;

-- ============================================================================
-- PART 2: Messaging System
-- ============================================================================

-- 2.1 Create tables
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('direct', 'group')) DEFAULT 'group',
  write_mode TEXT NOT NULL CHECK (write_mode IN ('all', 'admin_only')) DEFAULT 'all',
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE channel_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT,
  file_url TEXT,
  file_name TEXT,
  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE message_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(channel_id, user_id)
);

-- 2.2 Enable RLS
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

-- 2.3 Helper function for channel membership check
CREATE OR REPLACE FUNCTION is_channel_member(p_channel_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM channel_members
    WHERE channel_id = p_channel_id AND user_id = auth.uid()
  );
$$;

-- 2.4 RLS Policies

-- channels: members can read, admin can manage
CREATE POLICY channels_select ON channels
  FOR SELECT USING (is_channel_member(id));

CREATE POLICY channels_admin ON channels
  FOR ALL USING (has_role('admin'));

-- channel_members: see co-members, admin manages
CREATE POLICY channel_members_select ON channel_members
  FOR SELECT USING (is_channel_member(channel_id));

CREATE POLICY channel_members_admin ON channel_members
  FOR ALL USING (has_role('admin'));

-- messages: members can read, members can insert (respecting write_mode), own messages editable
CREATE POLICY messages_select ON messages
  FOR SELECT USING (is_channel_member(channel_id));

CREATE POLICY messages_insert ON messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND is_channel_member(channel_id)
    AND (
      (SELECT write_mode FROM channels WHERE id = channel_id) = 'all'
      OR has_role('admin')
    )
  );

CREATE POLICY messages_update_own ON messages
  FOR UPDATE USING (sender_id = auth.uid());

CREATE POLICY messages_delete ON messages
  FOR DELETE USING (sender_id = auth.uid() OR has_role('admin'));

-- message_reads: own reads only
CREATE POLICY message_reads_own ON message_reads
  FOR ALL USING (user_id = auth.uid());

-- 2.5 Indexes
CREATE INDEX idx_channel_members_channel ON channel_members(channel_id);
CREATE INDEX idx_channel_members_user ON channel_members(user_id);
CREATE INDEX idx_messages_channel_created ON messages(channel_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_message_reads_channel_user ON message_reads(channel_id, user_id);

-- 2.6 Auto-update timestamps
CREATE TRIGGER update_channels_updated_at
  BEFORE UPDATE ON channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 2.7 Trigger: when eleve role is created, auto-create direct channel + add to General
CREATE OR REPLACE FUNCTION handle_eleve_created()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_id UUID;
  new_channel_id UUID;
  general_channel_id UUID;
  eleve_name TEXT;
BEGIN
  IF NEW.role = 'eleve' THEN
    -- Get eleve name
    SELECT full_name INTO eleve_name FROM profiles WHERE id = NEW.user_id;

    -- Find first admin
    SELECT ur.user_id INTO admin_id
    FROM user_roles ur
    WHERE ur.role = 'admin'
    ORDER BY ur.created_at ASC
    LIMIT 1;

    IF admin_id IS NOT NULL THEN
      -- Create direct channel
      INSERT INTO channels (name, type, write_mode, created_by)
      VALUES (COALESCE(eleve_name, 'Direct'), 'direct', 'all', admin_id)
      RETURNING id INTO new_channel_id;

      -- Add both as members
      INSERT INTO channel_members (channel_id, user_id) VALUES
        (new_channel_id, admin_id),
        (new_channel_id, NEW.user_id);
    END IF;

    -- Add to General channel
    SELECT id INTO general_channel_id
    FROM channels
    WHERE name = 'Général' AND type = 'group'
    LIMIT 1;

    IF general_channel_id IS NOT NULL THEN
      INSERT INTO channel_members (channel_id, user_id)
      VALUES (general_channel_id, NEW.user_id)
      ON CONFLICT (channel_id, user_id) DO NOTHING;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_eleve_created
  AFTER INSERT ON user_roles
  FOR EACH ROW EXECUTE FUNCTION handle_eleve_created();

-- 2.8 Trigger: notify channel members on new message
CREATE OR REPLACE FUNCTION handle_message_sent()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_record RECORD;
  sender_name TEXT;
BEGIN
  SELECT full_name INTO sender_name FROM profiles WHERE id = NEW.sender_id;

  FOR member_record IN
    SELECT user_id FROM channel_members
    WHERE channel_id = NEW.channel_id AND user_id != NEW.sender_id
  LOOP
    INSERT INTO notifications (user_id, type, title, message, metadata)
    VALUES (
      member_record.user_id,
      'general',
      'Message de ' || COALESCE(sender_name, 'Utilisateur'),
      LEFT(COALESCE(NEW.content, 'Fichier partagé'), 100),
      jsonb_build_object('channel_id', NEW.channel_id, 'message_id', NEW.id)
    );
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_message_sent
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION handle_message_sent();

-- 2.9 RPC: Get user channels with last message and unread count
CREATE OR REPLACE FUNCTION get_user_channels()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(ch ORDER BY ch.last_activity DESC), '[]'::JSONB) INTO result
  FROM (
    SELECT
      c.id,
      c.name,
      c.type,
      c.write_mode,
      c.created_by,
      c.created_at,
      c.updated_at,
      -- Last message
      (
        SELECT jsonb_build_object(
          'id', m.id,
          'content', m.content,
          'sender_id', m.sender_id,
          'sender_name', p.full_name,
          'created_at', m.created_at
        )
        FROM messages m
        JOIN profiles p ON p.id = m.sender_id
        WHERE m.channel_id = c.id
        ORDER BY m.created_at DESC
        LIMIT 1
      ) AS last_message,
      -- Unread count
      (
        SELECT COUNT(*)
        FROM messages m
        WHERE m.channel_id = c.id
          AND m.created_at > COALESCE(
            (SELECT mr.last_read_at FROM message_reads mr
             WHERE mr.channel_id = c.id AND mr.user_id = auth.uid()),
            '1970-01-01'::TIMESTAMPTZ
          )
          AND m.sender_id != auth.uid()
      ) AS unread_count,
      -- Member count
      (SELECT COUNT(*) FROM channel_members cm WHERE cm.channel_id = c.id) AS member_count,
      -- Other member info (for direct channels)
      CASE WHEN c.type = 'direct' THEN
        (
          SELECT jsonb_build_object(
            'id', p.id,
            'full_name', p.full_name,
            'avatar_url', p.avatar_url
          )
          FROM channel_members cm
          JOIN profiles p ON p.id = cm.user_id
          WHERE cm.channel_id = c.id AND cm.user_id != auth.uid()
          LIMIT 1
        )
      ELSE NULL END AS other_member,
      -- Sort key: last message time or channel creation time
      COALESCE(
        (SELECT m.created_at FROM messages m WHERE m.channel_id = c.id ORDER BY m.created_at DESC LIMIT 1),
        c.created_at
      ) AS last_activity
    FROM channels c
    JOIN channel_members cm ON cm.channel_id = c.id
    WHERE cm.user_id = auth.uid()
  ) ch;

  RETURN result;
END;
$$;

-- 2.10 RPC: Mark channel as read
CREATE OR REPLACE FUNCTION mark_channel_read(p_channel_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO message_reads (channel_id, user_id, last_read_at)
  VALUES (p_channel_id, auth.uid(), NOW())
  ON CONFLICT (channel_id, user_id)
  DO UPDATE SET last_read_at = NOW();
END;
$$;

-- 2.11 Seed the General channel
INSERT INTO channels (name, type, write_mode)
VALUES ('Général', 'group', 'all');

-- ============================================================================
-- PART 3: Profile updates
-- ============================================================================

-- Add last_seen_at for presence tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ;

-- Drop legacy indexes for interviews/blockages
DROP INDEX IF EXISTS idx_interviews_coach;
DROP INDEX IF EXISTS idx_interviews_member;
DROP INDEX IF EXISTS idx_interviews_date;
DROP INDEX IF EXISTS idx_blockages_interview;
DROP INDEX IF EXISTS idx_blockages_member;

COMMIT;
