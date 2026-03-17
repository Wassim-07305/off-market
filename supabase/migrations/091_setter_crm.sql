-- Colonnes personnalisables du pipeline
CREATE TABLE IF NOT EXISTS pipeline_columns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  color text NOT NULL DEFAULT 'blue',
  position integer NOT NULL DEFAULT 0,
  is_terminal boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Leads/prospects du setter
CREATE TABLE IF NOT EXISTS setter_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setter_id uuid NOT NULL REFERENCES profiles(id),
  client_id uuid REFERENCES profiles(id),
  column_id uuid REFERENCES pipeline_columns(id) ON DELETE SET NULL,
  name text,
  phone text,
  email text,
  instagram_handle text,
  linkedin_handle text,
  objectif text,
  douleur text,
  ca_contracte numeric DEFAULT 0,
  ca_collecte numeric DEFAULT 0,
  duree_collecte integer,
  status text DEFAULT 'en_cours',
  date_premier_contact date,
  date_relance date,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Activités du setter (bilan)
CREATE TABLE IF NOT EXISTS setter_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id),
  client_id uuid REFERENCES profiles(id),
  date date NOT NULL DEFAULT CURRENT_DATE,
  dms_sent integer DEFAULT 0,
  followups_sent integer DEFAULT 0,
  links_sent integer DEFAULT 0,
  calls_booked integer DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE pipeline_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE setter_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE setter_activities ENABLE ROW LEVEL SECURITY;

-- Admin voit tout
CREATE POLICY "admin_all" ON pipeline_columns FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY "admin_all" ON setter_leads FOR ALL USING (get_my_role() = 'admin');
CREATE POLICY "admin_all" ON setter_activities FOR ALL USING (get_my_role() = 'admin');

-- Setter voit ses données
CREATE POLICY "setter_own" ON setter_leads FOR ALL USING (setter_id = auth.uid());
CREATE POLICY "setter_own" ON setter_activities FOR ALL USING (user_id = auth.uid());
CREATE POLICY "setter_columns" ON pipeline_columns FOR SELECT USING (true);
CREATE POLICY "setter_manage_columns" ON pipeline_columns FOR ALL USING (
  get_my_role() IN ('admin', 'setter', 'closer')
);

-- Coach voit les données de ses clients
CREATE POLICY "coach_view" ON setter_leads FOR SELECT USING (get_my_role() = 'coach');
CREATE POLICY "coach_view" ON setter_activities FOR SELECT USING (get_my_role() = 'coach');

-- Indexes
CREATE INDEX IF NOT EXISTS idx_setter_leads_setter ON setter_leads(setter_id);
CREATE INDEX IF NOT EXISTS idx_setter_leads_column ON setter_leads(column_id);
CREATE INDEX IF NOT EXISTS idx_setter_leads_client ON setter_leads(client_id);
CREATE INDEX IF NOT EXISTS idx_setter_activities_user ON setter_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_columns_client ON pipeline_columns(client_id);
