-- ============================================================
-- 070: Onboarding Offers — personalized offer-based onboarding
-- ============================================================

-- ─── onboarding_offers table ─────────────────────────────────
CREATE TABLE IF NOT EXISTS onboarding_offers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  modules     TEXT[] NOT NULL DEFAULT '{}',
  welcome_message TEXT,
  recommended_actions JSONB DEFAULT '[]'::jsonb,
  sort_order  INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Seed default offers ─────────────────────────────────────
INSERT INTO onboarding_offers (name, slug, description, modules, welcome_message, recommended_actions, sort_order)
VALUES
  (
    'Starter',
    'starter',
    'Idéal pour démarrer ton activité de coaching',
    '{crm,messaging,pipeline}',
    'Bienvenue ! Tu as choisi l''offre Starter. Commence par configurer ton CRM et envoyer ton premier message.',
    '[
      {"key": "add_client", "label": "Ajouter ton premier client", "href": "/clients", "icon": "UserPlus"},
      {"key": "setup_pipeline", "label": "Configurer ton pipeline", "href": "/pipeline", "icon": "Kanban"},
      {"key": "send_message", "label": "Envoyer ton premier message", "href": "/messaging", "icon": "MessageCircle"}
    ]'::jsonb,
    1
  ),
  (
    'Growth',
    'growth',
    'Pour scaler ton business et suivre tes performances',
    '{crm,messaging,pipeline,formations,coaching,analytics}',
    'Bienvenue ! Tu as choisi l''offre Growth. Tu as accès à tout ce qu''il faut pour scaler.',
    '[
      {"key": "add_client", "label": "Ajouter ton premier client", "href": "/clients", "icon": "UserPlus"},
      {"key": "setup_pipeline", "label": "Configurer ton pipeline", "href": "/pipeline", "icon": "Kanban"},
      {"key": "send_message", "label": "Envoyer ton premier message", "href": "/messaging", "icon": "MessageCircle"},
      {"key": "create_formation", "label": "Créer ta première formation", "href": "/school", "icon": "GraduationCap"},
      {"key": "plan_coaching", "label": "Planifier une session coaching", "href": "/coaching", "icon": "CalendarCheck"},
      {"key": "view_analytics", "label": "Consulter tes analytics", "href": "/analytics", "icon": "BarChart3"}
    ]'::jsonb,
    2
  ),
  (
    'Premium',
    'premium',
    'L''expérience complète pour les top performers',
    '{crm,messaging,pipeline,formations,coaching,analytics,gamification,community,ai_assistant,contracts}',
    'Bienvenue dans l''expérience Premium ! Tu as accès à l''intégralité de la plateforme.',
    '[
      {"key": "add_client", "label": "Ajouter ton premier client", "href": "/clients", "icon": "UserPlus"},
      {"key": "setup_pipeline", "label": "Configurer ton pipeline", "href": "/pipeline", "icon": "Kanban"},
      {"key": "send_message", "label": "Envoyer ton premier message", "href": "/messaging", "icon": "MessageCircle"},
      {"key": "create_formation", "label": "Créer ta première formation", "href": "/school", "icon": "GraduationCap"},
      {"key": "plan_coaching", "label": "Planifier une session coaching", "href": "/coaching", "icon": "CalendarCheck"},
      {"key": "view_analytics", "label": "Consulter tes analytics", "href": "/analytics", "icon": "BarChart3"},
      {"key": "activate_gamification", "label": "Activer la gamification", "href": "/gamification", "icon": "Trophy"},
      {"key": "join_community", "label": "Rejoindre la communauté", "href": "/community", "icon": "Users"},
      {"key": "setup_ai", "label": "Configurer l''assistant IA", "href": "/ai-assistant", "icon": "Bot"},
      {"key": "create_contract", "label": "Créer un contrat", "href": "/contracts", "icon": "FileSignature"}
    ]'::jsonb,
    3
  );

-- ─── Add offer reference to profiles ─────────────────────────
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_offer_id UUID REFERENCES onboarding_offers(id);

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE onboarding_offers ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read active offers
CREATE POLICY "onboarding_offers_read"
  ON onboarding_offers FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can insert/update/delete offers
CREATE POLICY "onboarding_offers_admin_insert"
  ON onboarding_offers FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "onboarding_offers_admin_update"
  ON onboarding_offers FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

CREATE POLICY "onboarding_offers_admin_delete"
  ON onboarding_offers FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

-- ─── Index ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_onboarding_offers_slug ON onboarding_offers(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding_offer ON profiles(onboarding_offer_id);
