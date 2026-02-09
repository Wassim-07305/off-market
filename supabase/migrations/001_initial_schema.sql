-- ============================================
-- CRM StevenBos - Schema Initial
-- ============================================

-- Enum pour les rôles
CREATE TYPE app_role AS ENUM ('admin', 'manager', 'coach', 'setter', 'closer', 'monteur');

-- ============================================
-- TABLE: profiles
-- ============================================
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT DEFAULT '',
  avatar_url TEXT,
  coach_id UUID REFERENCES profiles(id),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: user_roles
-- ============================================
CREATE TABLE user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'setter',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- ============================================
-- TABLE: clients
-- ============================================
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  notes TEXT,
  status TEXT DEFAULT 'actif' CHECK (status IN ('actif', 'inactif', 'archivé')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: client_assignments
-- ============================================
CREATE TABLE client_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(client_id, user_id)
);

-- ============================================
-- TABLE: leads
-- ============================================
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  source TEXT CHECK (source IN ('instagram', 'linkedin', 'tiktok', 'referral', 'ads', 'autre')),
  status TEXT DEFAULT 'à_relancer' CHECK (status IN ('à_relancer', 'booké', 'no_show', 'pas_intéressé', 'en_cours')),
  client_status TEXT DEFAULT 'contacté' CHECK (client_status IN ('contacté', 'qualifié', 'proposé', 'closé', 'perdu')),
  ca_contracté DECIMAL(10,2) DEFAULT 0,
  ca_collecté DECIMAL(10,2) DEFAULT 0,
  commission_setter DECIMAL(10,2) DEFAULT 0,
  commission_closer DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: call_calendar
-- ============================================
CREATE TABLE call_calendar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES profiles(id),
  date DATE NOT NULL,
  time TIME NOT NULL,
  type TEXT DEFAULT 'manuel' CHECK (type IN ('manuel', 'iclosed', 'calendly', 'autre')),
  status TEXT DEFAULT 'planifié' CHECK (status IN ('planifié', 'réalisé', 'no_show', 'annulé', 'reporté')),
  link TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: closer_calls
-- ============================================
CREATE TABLE closer_calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  closer_id UUID REFERENCES profiles(id),
  date DATE NOT NULL,
  status TEXT DEFAULT 'non_closé' CHECK (status IN ('closé', 'non_closé')),
  revenue DECIMAL(10,2) DEFAULT 0,
  nombre_paiements INTEGER DEFAULT 1,
  link TEXT,
  debrief TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: financial_entries
-- ============================================
CREATE TABLE financial_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('ca', 'récurrent', 'charge', 'prestataire')),
  label TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  prestataire TEXT,
  is_paid BOOLEAN DEFAULT false,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: payment_schedules
-- ============================================
CREATE TABLE payment_schedules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  financial_entry_id UUID REFERENCES financial_entries(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  is_paid BOOLEAN DEFAULT false,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: social_content
-- ============================================
CREATE TABLE social_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT DEFAULT 'idée' CHECK (status IN ('à_tourner', 'idée', 'en_cours', 'publié', 'reporté')),
  format TEXT CHECK (format IN ('réel', 'story', 'carrousel', 'post')),
  video_type TEXT CHECK (video_type IN ('réact', 'b-roll', 'vidéo_virale', 'preuve_sociale', 'facecam', 'talking_head', 'vlog')),
  link TEXT,
  is_validated BOOLEAN DEFAULT false,
  text_content TEXT,
  planned_date DATE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: setter_activities
-- ============================================
CREATE TABLE setter_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE,
  messages_sent INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, client_id, date)
);

-- ============================================
-- TABLE: interviews
-- ============================================
CREATE TABLE interviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  member_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'planifié' CHECK (status IN ('planifié', 'réalisé', 'annulé')),
  positive_points TEXT,
  improvement_areas TEXT,
  actions TEXT,
  deadline DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: blockages
-- ============================================
CREATE TABLE blockages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interview_id UUID REFERENCES interviews(id) ON DELETE CASCADE,
  member_id UUID REFERENCES profiles(id),
  category TEXT CHECK (category IN ('technique', 'motivation', 'organisation', 'communication', 'formation', 'autre')),
  problem TEXT NOT NULL,
  why_1 TEXT,
  why_2 TEXT,
  why_3 TEXT,
  why_4 TEXT,
  why_5 TEXT,
  root_cause TEXT,
  decided_action TEXT,
  result TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: instagram_accounts
-- ============================================
CREATE TABLE instagram_accounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  followers INTEGER DEFAULT 0,
  following INTEGER DEFAULT 0,
  media_count INTEGER DEFAULT 0,
  last_synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: instagram_post_stats
-- ============================================
CREATE TABLE instagram_post_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID REFERENCES instagram_accounts(id) ON DELETE CASCADE,
  post_url TEXT,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,2) DEFAULT 0,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: notifications
-- ============================================
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('lead_status', 'new_call', 'call_closed', 'general')),
  title TEXT NOT NULL,
  message TEXT,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLE: rituals
-- ============================================
CREATE TABLE rituals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT CHECK (frequency IN ('quotidien', 'hebdomadaire', 'mensuel')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- FUNCTIONS: RLS Helpers
-- ============================================
CREATE OR REPLACE FUNCTION public.has_role(_role app_role)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = _role
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_assigned_to_client(_client_id UUID)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.client_assignments
    WHERE user_id = auth.uid() AND client_id = _client_id
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_coached_by(_user_id UUID)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = _user_id AND coach_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================
-- TRIGGER: handle_new_user
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'setter');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- TRIGGER: update_updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_social_content_updated_at BEFORE UPDATE ON social_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- TRIGGER: notify_lead_status_change
-- ============================================
CREATE OR REPLACE FUNCTION notify_lead_status_change()
RETURNS trigger AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO notifications (user_id, type, title, message, metadata)
    SELECT NEW.assigned_to, 'lead_status',
      'Lead ' || NEW.name || ' → ' || NEW.status,
      'Le statut du lead a changé de ' || OLD.status || ' à ' || NEW.status,
      jsonb_build_object('lead_id', NEW.id, 'old_status', OLD.status, 'new_status', NEW.status)
    WHERE NEW.assigned_to IS NOT NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_lead_status_change
  AFTER UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION notify_lead_status_change();

-- ============================================
-- TRIGGER: notify_new_call
-- ============================================
CREATE OR REPLACE FUNCTION notify_new_call()
RETURNS trigger AS $$
BEGIN
  INSERT INTO notifications (user_id, type, title, message, metadata)
  SELECT NEW.assigned_to, 'new_call',
    'Nouveau call le ' || NEW.date::text,
    'Un call a été planifié pour le ' || NEW.date::text || ' à ' || NEW.time::text,
    jsonb_build_object('call_id', NEW.id)
  WHERE NEW.assigned_to IS NOT NULL;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_call_created
  AFTER INSERT ON call_calendar
  FOR EACH ROW EXECUTE FUNCTION notify_new_call();

-- ============================================
-- TRIGGER: notify_call_closed
-- ============================================
CREATE OR REPLACE FUNCTION notify_call_closed()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'closé' AND OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO notifications (user_id, type, title, message, metadata)
    SELECT NEW.closer_id, 'call_closed',
      'Call closé — ' || NEW.revenue::text || ' €',
      'Un call a été closé avec un revenu de ' || NEW.revenue::text || ' €',
      jsonb_build_object('closer_call_id', NEW.id, 'revenue', NEW.revenue)
    WHERE NEW.closer_id IS NOT NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_call_closed
  AFTER UPDATE ON closer_calls
  FOR EACH ROW EXECUTE FUNCTION notify_call_closed();

-- ============================================
-- FUNCTION: Dashboard stats RPC
-- ============================================
CREATE OR REPLACE FUNCTION public.get_dashboard_stats()
RETURNS json AS $$
  SELECT json_build_object(
    'ca_total', (SELECT COALESCE(SUM(revenue), 0) FROM closer_calls WHERE status = 'closé'),
    'ca_total_prev_month', (SELECT COALESCE(SUM(revenue), 0) FROM closer_calls WHERE status = 'closé' AND date >= (date_trunc('month', now()) - interval '1 month')::date AND date < date_trunc('month', now())::date),
    'ca_total_this_month', (SELECT COALESCE(SUM(revenue), 0) FROM closer_calls WHERE status = 'closé' AND date >= date_trunc('month', now())::date),
    'nb_calls', (SELECT COUNT(*) FROM call_calendar),
    'nb_calls_this_month', (SELECT COUNT(*) FROM call_calendar WHERE date >= date_trunc('month', now())::date),
    'nb_calls_prev_month', (SELECT COUNT(*) FROM call_calendar WHERE date >= (date_trunc('month', now()) - interval '1 month')::date AND date < date_trunc('month', now())::date),
    'taux_closing', (SELECT CASE WHEN COUNT(*) = 0 THEN 0 ELSE ROUND(COUNT(*) FILTER (WHERE status = 'closé')::numeric / COUNT(*) * 100, 1) END FROM closer_calls),
    'taux_closing_prev_month', (SELECT CASE WHEN COUNT(*) = 0 THEN 0 ELSE ROUND(COUNT(*) FILTER (WHERE status = 'closé')::numeric / COUNT(*) * 100, 1) END FROM closer_calls WHERE date >= (date_trunc('month', now()) - interval '1 month')::date AND date < date_trunc('month', now())::date),
    'messages_sent', (SELECT COALESCE(SUM(messages_sent), 0) FROM setter_activities),
    'messages_sent_this_month', (SELECT COALESCE(SUM(messages_sent), 0) FROM setter_activities WHERE date >= date_trunc('month', now())::date),
    'messages_sent_prev_month', (SELECT COALESCE(SUM(messages_sent), 0) FROM setter_activities WHERE date >= (date_trunc('month', now()) - interval '1 month')::date AND date < date_trunc('month', now())::date)
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ============================================
-- FUNCTION: Global search RPC
-- ============================================
CREATE OR REPLACE FUNCTION public.global_search(search_term TEXT)
RETURNS json AS $$
  SELECT json_build_object(
    'clients', (SELECT COALESCE(json_agg(row_to_json(c)), '[]'::json) FROM (
      SELECT id, name, email, status FROM clients
      WHERE name ILIKE '%' || search_term || '%' OR email ILIKE '%' || search_term || '%'
      LIMIT 5
    ) c),
    'leads', (SELECT COALESCE(json_agg(row_to_json(l)), '[]'::json) FROM (
      SELECT id, name, email, status, client_status FROM leads
      WHERE name ILIKE '%' || search_term || '%' OR email ILIKE '%' || search_term || '%'
      LIMIT 5
    ) l),
    'social_content', (SELECT COALESCE(json_agg(row_to_json(s)), '[]'::json) FROM (
      SELECT id, title, status FROM social_content
      WHERE title ILIKE '%' || search_term || '%'
      LIMIT 5
    ) s)
  );
$$ LANGUAGE sql STABLE SECURITY INVOKER;
