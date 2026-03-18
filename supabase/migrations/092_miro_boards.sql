-- Miro Boards — Canvas interactif pour l'admin
CREATE TABLE IF NOT EXISTS miro_boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Nouveau tableau',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS miro_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id uuid NOT NULL REFERENCES miro_boards(id) ON DELETE CASCADE,
  x numeric NOT NULL DEFAULT 0,
  y numeric NOT NULL DEFAULT 0,
  width numeric DEFAULT 420,
  title text,
  content text,
  card_type text DEFAULT 'default',
  style jsonb DEFAULT '{}',
  sort_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE miro_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE miro_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_all" ON miro_boards FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY "admin_all" ON miro_cards FOR ALL USING (get_my_role() = 'admin');
