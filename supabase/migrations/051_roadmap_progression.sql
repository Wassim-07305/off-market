-- ═══════════════════════════════════════════════════════════════
-- 050 — Roadmap & Client Progression
-- ═══════════════════════════════════════════════════════════════

-- ─── client_roadmaps ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  generated_from TEXT NOT NULL DEFAULT 'manual'
    CHECK (generated_from IN ('kickoff_call', 'manual', 'ai_suggestion')),
  source_call_id UUID REFERENCES call_calendar(id) ON DELETE SET NULL,
  milestones_snapshot JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_roadmaps_client ON client_roadmaps(client_id);
CREATE INDEX idx_client_roadmaps_active ON client_roadmaps(client_id, is_active) WHERE is_active = true;

-- ─── roadmap_milestones ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS roadmap_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES client_roadmaps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  validation_criteria TEXT[] NOT NULL DEFAULT '{}',
  order_index INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped')),
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_roadmap_milestones_roadmap ON roadmap_milestones(roadmap_id);
CREATE INDEX idx_roadmap_milestones_order ON roadmap_milestones(roadmap_id, order_index);

-- ─── client_flags ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  flag TEXT NOT NULL DEFAULT 'green'
    CHECK (flag IN ('green', 'orange', 'red')),
  reason TEXT,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  notified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_flags_flag ON client_flags(flag);

-- ─── client_flag_history ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_flag_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  previous_flag TEXT,
  new_flag TEXT NOT NULL,
  reason TEXT,
  changed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_client_flag_history_client ON client_flag_history(client_id);
CREATE INDEX idx_client_flag_history_date ON client_flag_history(created_at DESC);

-- ─── updated_at triggers ─────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_client_roadmaps_updated ON client_roadmaps;
CREATE TRIGGER trg_client_roadmaps_updated
  BEFORE UPDATE ON client_roadmaps
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_roadmap_milestones_updated ON roadmap_milestones;
CREATE TRIGGER trg_roadmap_milestones_updated
  BEFORE UPDATE ON roadmap_milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_client_flags_updated ON client_flags;
CREATE TRIGGER trg_client_flags_updated
  BEFORE UPDATE ON client_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── Flag change → history + notification trigger ────────────
CREATE OR REPLACE FUNCTION fn_client_flag_changed()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into history
  INSERT INTO client_flag_history (client_id, previous_flag, new_flag, reason, changed_by)
  VALUES (NEW.client_id, OLD.flag, NEW.flag, NEW.reason, NEW.changed_by);

  -- If flag is red, create a notification for admins
  IF NEW.flag = 'red' THEN
    INSERT INTO notifications (user_id, title, body, type, link, created_at)
    SELECT
      p.id,
      'Drapeau rouge',
      'Le client ' || (SELECT full_name FROM profiles WHERE id = NEW.client_id) || ' est passe en drapeau rouge : ' || COALESCE(NEW.reason, 'Aucune raison specifiee'),
      'alert',
      '/admin/clients',
      now()
    FROM profiles p
    WHERE p.role = 'admin';

    UPDATE client_flags SET notified = true WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_client_flag_changed ON client_flags;
CREATE TRIGGER trg_client_flag_changed
  AFTER UPDATE OF flag ON client_flags
  FOR EACH ROW
  WHEN (OLD.flag IS DISTINCT FROM NEW.flag)
  EXECUTE FUNCTION fn_client_flag_changed();

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE client_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_flag_history ENABLE ROW LEVEL SECURITY;

-- Staff (admin/coach) can do everything
CREATE POLICY "staff_roadmaps_all" ON client_roadmaps
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );

CREATE POLICY "staff_milestones_all" ON roadmap_milestones
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );

CREATE POLICY "staff_flags_all" ON client_flags
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );

CREATE POLICY "staff_flag_history_all" ON client_flag_history
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );

-- Clients can read their own roadmap & milestones
CREATE POLICY "client_roadmaps_read" ON client_roadmaps
  FOR SELECT USING (client_id = auth.uid());

CREATE POLICY "client_milestones_read" ON roadmap_milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM client_roadmaps
      WHERE client_roadmaps.id = roadmap_milestones.roadmap_id
        AND client_roadmaps.client_id = auth.uid()
    )
  );

-- Clients can read their own flag
CREATE POLICY "client_flags_read" ON client_flags
  FOR SELECT USING (client_id = auth.uid());

-- Clients can read their own flag history
CREATE POLICY "client_flag_history_read" ON client_flag_history
  FOR SELECT USING (client_id = auth.uid());
