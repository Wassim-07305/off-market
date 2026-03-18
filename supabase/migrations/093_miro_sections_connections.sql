-- Miro Sections — labels flottants de section sur le canvas
CREATE TABLE IF NOT EXISTS miro_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES miro_boards(id) ON DELETE CASCADE,
  name text NOT NULL,
  x numeric NOT NULL DEFAULT 0,
  y numeric NOT NULL DEFAULT 0,
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Miro Connections — connecteurs entre cartes
CREATE TABLE IF NOT EXISTS miro_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES miro_boards(id) ON DELETE CASCADE,
  from_card_id uuid NOT NULL REFERENCES miro_cards(id) ON DELETE CASCADE,
  to_card_id uuid NOT NULL REFERENCES miro_cards(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE miro_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE miro_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all" ON miro_sections FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY "admin_all" ON miro_connections FOR ALL USING (get_my_role() = 'admin');
