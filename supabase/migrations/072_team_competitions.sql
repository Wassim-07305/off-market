-- ============================================================
-- 072 — Team Competitions (gamification)
-- ============================================================

-- ─── TEAMS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS teams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  avatar_emoji TEXT DEFAULT '🔥',
  color       TEXT DEFAULT '#DC2626',
  captain_id  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_by  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── TEAM MEMBERS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS team_members (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id   UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- ─── COMPETITIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS competitions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  description       TEXT,
  type              TEXT NOT NULL DEFAULT 'team_vs_team' CHECK (type IN ('team_vs_team', 'free_for_all')),
  metric            TEXT NOT NULL DEFAULT 'xp' CHECK (metric IN ('xp', 'calls', 'clients', 'revenue')),
  start_date        TIMESTAMPTZ NOT NULL,
  end_date          TIMESTAMPTZ NOT NULL,
  status            TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'active', 'completed')),
  prize_description TEXT,
  created_by        UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── COMPETITION PARTICIPANTS ───────────────────────────────
CREATE TABLE IF NOT EXISTS competition_participants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id  UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
  team_id         UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id         UUID REFERENCES profiles(id) ON DELETE CASCADE,
  score           NUMERIC NOT NULL DEFAULT 0,
  rank            INT,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (team_id IS NOT NULL OR user_id IS NOT NULL)
);

-- ─── INDEXES ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_team_members_team    ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user    ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_competitions_status  ON competitions(status);
CREATE INDEX IF NOT EXISTS idx_comp_participants_comp ON competition_participants(competition_id);
CREATE INDEX IF NOT EXISTS idx_comp_participants_team ON competition_participants(team_id);
CREATE INDEX IF NOT EXISTS idx_comp_participants_user ON competition_participants(user_id);

-- ─── AUTO-UPDATE updated_at ─────────────────────────────────
CREATE OR REPLACE FUNCTION update_teams_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_teams_updated_at();

CREATE TRIGGER trg_comp_participants_updated_at
  BEFORE UPDATE ON competition_participants
  FOR EACH ROW EXECUTE FUNCTION update_teams_updated_at();

-- ─── AUTO-UPDATE COMPETITION STATUS ─────────────────────────
CREATE OR REPLACE FUNCTION update_competition_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status != 'completed' THEN
    IF now() >= NEW.start_date AND now() < NEW.end_date THEN
      NEW.status = 'active';
    ELSIF now() >= NEW.end_date THEN
      NEW.status = 'completed';
    ELSE
      NEW.status = 'upcoming';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_competition_status_update
  BEFORE INSERT OR UPDATE ON competitions
  FOR EACH ROW EXECUTE FUNCTION update_competition_status();

-- ─── RLS ────────────────────────────────────────────────────
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE competition_participants ENABLE ROW LEVEL SECURITY;

-- Teams: everyone can read, authenticated can create
CREATE POLICY "teams_select" ON teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "teams_insert" ON teams FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "teams_update" ON teams FOR UPDATE TO authenticated USING (
  auth.uid() = captain_id
  OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "teams_delete" ON teams FOR DELETE TO authenticated USING (
  auth.uid() = captain_id
  OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Team members: everyone can read, captains + self can manage
CREATE POLICY "team_members_select" ON team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "team_members_insert" ON team_members FOR INSERT TO authenticated WITH CHECK (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM teams WHERE id = team_id AND captain_id = auth.uid())
);
CREATE POLICY "team_members_delete" ON team_members FOR DELETE TO authenticated USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM teams WHERE id = team_id AND captain_id = auth.uid())
  OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Competitions: everyone can read, admin can create/update
CREATE POLICY "competitions_select" ON competitions FOR SELECT TO authenticated USING (true);
CREATE POLICY "competitions_insert" ON competitions FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY "competitions_update" ON competitions FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Competition participants: everyone can read, admin can manage
CREATE POLICY "comp_participants_select" ON competition_participants FOR SELECT TO authenticated USING (true);
CREATE POLICY "comp_participants_insert" ON competition_participants FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  OR auth.uid() = user_id
);
CREATE POLICY "comp_participants_update" ON competition_participants FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
