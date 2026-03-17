-- ============================================================
-- 090: Booking System — Pages publiques de reservation
-- ============================================================

-- Pages de booking (configurables par l'admin)
CREATE TABLE IF NOT EXISTS booking_pages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL DEFAULT 'Prendre rendez-vous',
  description text,
  is_active boolean DEFAULT true,
  brand_color text DEFAULT '#AF0000',
  slot_duration integer DEFAULT 30,
  buffer_minutes integer DEFAULT 10,
  min_notice_hours integer DEFAULT 24,
  max_days_ahead integer DEFAULT 30,
  qualification_fields jsonb DEFAULT '[]'::jsonb,
  timezone text DEFAULT 'Europe/Paris',
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Disponibilites hebdomadaires
CREATE TABLE IF NOT EXISTS booking_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_page_id uuid REFERENCES booking_pages(id) ON DELETE CASCADE,
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time text NOT NULL,
  end_time text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Exceptions (jours bloques)
CREATE TABLE IF NOT EXISTS booking_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_page_id uuid REFERENCES booking_pages(id) ON DELETE CASCADE,
  exception_date date NOT NULL,
  type text NOT NULL DEFAULT 'blocked',
  reason text,
  created_at timestamptz DEFAULT now()
);

-- Reservations
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_page_id uuid REFERENCES booking_pages(id),
  prospect_name text NOT NULL,
  prospect_email text,
  prospect_phone text,
  date date NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  status text DEFAULT 'confirmed',
  qualification_answers jsonb DEFAULT '{}'::jsonb,
  google_event_id text,
  meet_link text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tracking vues pages
CREATE TABLE IF NOT EXISTS booking_page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_page_id uuid REFERENCES booking_pages(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- ─── RLS ────────────────────────────────────────────────────
ALTER TABLE booking_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_page_views ENABLE ROW LEVEL SECURITY;

-- Public read pour les pages actives (page publique de reservation)
CREATE POLICY "Public read active pages" ON booking_pages FOR SELECT USING (is_active = true);
CREATE POLICY "Admin manage pages" ON booking_pages FOR ALL USING (get_my_role() = 'admin');

CREATE POLICY "Public read availability" ON booking_availability FOR SELECT USING (true);
CREATE POLICY "Admin manage availability" ON booking_availability FOR ALL USING (get_my_role() = 'admin');

CREATE POLICY "Public read exceptions" ON booking_exceptions FOR SELECT USING (true);
CREATE POLICY "Admin manage exceptions" ON booking_exceptions FOR ALL USING (get_my_role() = 'admin');

CREATE POLICY "Public insert bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth read bookings" ON bookings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Admin manage bookings" ON bookings FOR ALL USING (get_my_role() = 'admin');

CREATE POLICY "Public insert views" ON booking_page_views FOR INSERT WITH CHECK (true);
CREATE POLICY "Auth read views" ON booking_page_views FOR SELECT USING (auth.uid() IS NOT NULL);

-- ─── Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_booking_pages_slug ON booking_pages(slug);
CREATE INDEX IF NOT EXISTS idx_booking_availability_page ON booking_availability(booking_page_id);
CREATE INDEX IF NOT EXISTS idx_booking_exceptions_page ON booking_exceptions(booking_page_id);
CREATE INDEX IF NOT EXISTS idx_bookings_page ON bookings(booking_page_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_booking_page_views_page ON booking_page_views(booking_page_id);
CREATE INDEX IF NOT EXISTS idx_booking_page_views_created ON booking_page_views(created_at);
