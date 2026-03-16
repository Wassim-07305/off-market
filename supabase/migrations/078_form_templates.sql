-- ============================================
-- 078: Form Templates + NPS Critical Alerts
-- ============================================

-- Form templates table
CREATE TABLE IF NOT EXISTS form_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('onboarding', 'feedback', 'evaluation', 'intake', 'survey')),
  thumbnail_emoji TEXT DEFAULT '📋',
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_system BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE form_templates ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read templates
CREATE POLICY "form_templates_select" ON form_templates
  FOR SELECT TO authenticated USING (true);

-- Admin can insert/update/delete
CREATE POLICY "form_templates_insert" ON form_templates
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR is_system = false
  );

CREATE POLICY "form_templates_update" ON form_templates
  FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR created_by = auth.uid()
  );

CREATE POLICY "form_templates_delete" ON form_templates
  FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    OR (created_by = auth.uid() AND is_system = false)
  );

-- Index
CREATE INDEX idx_form_templates_category ON form_templates(category);

-- ============================================
-- Seed 6 default templates
-- ============================================

INSERT INTO form_templates (name, description, category, thumbnail_emoji, fields, is_system) VALUES

-- 1. Questionnaire d'onboarding
(
  'Questionnaire d''onboarding',
  'Recueillez les informations essentielles de vos nouveaux clients pour personnaliser leur accompagnement.',
  'onboarding',
  '🚀',
  '[
    {"field_type":"heading","label":"Bienvenue ! Faisons connaissance","description":"","placeholder":"","is_required":false,"options":[],"sort_order":0},
    {"field_type":"short_text","label":"Nom complet","description":"","placeholder":"Votre nom et prenom","is_required":true,"options":[],"sort_order":1},
    {"field_type":"email","label":"Adresse email","description":"","placeholder":"votre@email.com","is_required":true,"options":[],"sort_order":2},
    {"field_type":"long_text","label":"Quels sont vos objectifs principaux ?","description":"Decrivez ce que vous souhaitez atteindre","placeholder":"Ex: atteindre 10k/mois, lancer mon offre...","is_required":true,"options":[],"sort_order":3},
    {"field_type":"dropdown","label":"Niveau d''experience","description":"","placeholder":"","is_required":true,"options":[{"label":"Debutant (< 1 an)","value":"debutant"},{"label":"Intermediaire (1-3 ans)","value":"intermediaire"},{"label":"Avance (3+ ans)","value":"avance"}],"sort_order":4},
    {"field_type":"single_select","label":"Comment nous avez-vous connu ?","description":"","placeholder":"","is_required":true,"options":[{"label":"Instagram","value":"instagram"},{"label":"LinkedIn","value":"linkedin"},{"label":"Recommandation","value":"recommandation"},{"label":"Publicite","value":"publicite"},{"label":"Autre","value":"autre"}],"sort_order":5}
  ]'::jsonb,
  true
),

-- 2. Satisfaction NPS
(
  'Satisfaction NPS',
  'Mesurez la satisfaction de vos clients avec le score NPS et identifiez les axes d''amelioration.',
  'feedback',
  '📊',
  '[
    {"field_type":"heading","label":"Votre avis compte","description":"","placeholder":"","is_required":false,"options":[],"sort_order":0},
    {"field_type":"nps","label":"Sur une echelle de 0 a 10, recommanderiez-vous notre accompagnement ?","description":"0 = Pas du tout probable, 10 = Tres probable","placeholder":"","is_required":true,"options":[],"sort_order":1},
    {"field_type":"long_text","label":"Qu''est-ce qui motive votre note ?","description":"","placeholder":"Dites-nous ce que vous pensez...","is_required":false,"options":[],"sort_order":2},
    {"field_type":"long_text","label":"Que pourrions-nous ameliorer ?","description":"","placeholder":"Vos suggestions sont precieuses","is_required":false,"options":[],"sort_order":3}
  ]'::jsonb,
  true
),

-- 3. Evaluation mi-parcours
(
  'Evaluation mi-parcours',
  'Faites le point a mi-parcours sur la progression, les difficultes et les objectifs de vos clients.',
  'evaluation',
  '📝',
  '[
    {"field_type":"heading","label":"Bilan de mi-parcours","description":"","placeholder":"","is_required":false,"options":[],"sort_order":0},
    {"field_type":"rating","label":"Comment evaluez-vous votre progression globale ?","description":"1 = Tres insatisfait, 5 = Tres satisfait","placeholder":"","is_required":true,"options":[],"sort_order":1},
    {"field_type":"long_text","label":"Quelles difficultes avez-vous rencontrees ?","description":"","placeholder":"Decrivez les obstacles que vous avez rencontres","is_required":true,"options":[],"sort_order":2},
    {"field_type":"long_text","label":"Quels sont vos points forts identifies ?","description":"","placeholder":"Ce qui fonctionne bien pour vous","is_required":false,"options":[],"sort_order":3},
    {"field_type":"long_text","label":"Quels objectifs souhaitez-vous ajuster ?","description":"","placeholder":"Modifications ou nouveaux objectifs","is_required":false,"options":[],"sort_order":4}
  ]'::jsonb,
  true
),

-- 4. Fiche intake client
(
  'Fiche intake client',
  'Formulaire complet pour recueillir toutes les informations necessaires lors de l''inscription d''un nouveau client.',
  'intake',
  '📑',
  '[
    {"field_type":"heading","label":"Fiche d''information client","description":"","placeholder":"","is_required":false,"options":[],"sort_order":0},
    {"field_type":"short_text","label":"Nom complet","description":"","placeholder":"Prenom Nom","is_required":true,"options":[],"sort_order":1},
    {"field_type":"email","label":"Email professionnel","description":"","placeholder":"votre@email.com","is_required":true,"options":[],"sort_order":2},
    {"field_type":"phone","label":"Numero de telephone","description":"","placeholder":"+33 6 XX XX XX XX","is_required":false,"options":[],"sort_order":3},
    {"field_type":"divider","label":"","description":"","placeholder":"","is_required":false,"options":[],"sort_order":4},
    {"field_type":"single_select","label":"Situation professionnelle","description":"","placeholder":"","is_required":true,"options":[{"label":"Salarie","value":"salarie"},{"label":"Freelance","value":"freelance"},{"label":"Entrepreneur","value":"entrepreneur"},{"label":"En reconversion","value":"reconversion"},{"label":"Etudiant","value":"etudiant"}],"sort_order":5},
    {"field_type":"number","label":"Revenu mensuel actuel (EUR)","description":"Approximatif, pour calibrer votre accompagnement","placeholder":"0","is_required":false,"options":[],"sort_order":6},
    {"field_type":"long_text","label":"Objectifs financiers a 6 mois","description":"","placeholder":"Ex: atteindre 5k/mois en freelance","is_required":true,"options":[],"sort_order":7}
  ]'::jsonb,
  true
),

-- 5. Sondage fin de formation
(
  'Sondage fin de formation',
  'Recueillez le retour de vos participants a la fin d''une formation pour ameliorer vos contenus.',
  'survey',
  '🎓',
  '[
    {"field_type":"heading","label":"Retour sur la formation","description":"","placeholder":"","is_required":false,"options":[],"sort_order":0},
    {"field_type":"rating","label":"Satisfaction globale de la formation","description":"1 = Tres insatisfait, 5 = Tres satisfait","placeholder":"","is_required":true,"options":[],"sort_order":1},
    {"field_type":"rating","label":"Qualite du contenu","description":"","placeholder":"","is_required":true,"options":[],"sort_order":2},
    {"field_type":"rating","label":"Qualite du formateur","description":"","placeholder":"","is_required":true,"options":[],"sort_order":3},
    {"field_type":"nps","label":"Recommanderiez-vous cette formation ?","description":"0 = Pas du tout, 10 = Absolument","placeholder":"","is_required":true,"options":[],"sort_order":4},
    {"field_type":"long_text","label":"Commentaires et suggestions","description":"","placeholder":"Partagez vos impressions...","is_required":false,"options":[],"sort_order":5}
  ]'::jsonb,
  true
),

-- 6. Feedback session coaching
(
  'Feedback session coaching',
  'Obtenez un retour immediat apres chaque session de coaching pour ajuster votre approche.',
  'feedback',
  '💬',
  '[
    {"field_type":"heading","label":"Feedback de session","description":"","placeholder":"","is_required":false,"options":[],"sort_order":0},
    {"field_type":"rating","label":"Utilite de la session","description":"1 = Pas utile, 5 = Tres utile","placeholder":"","is_required":true,"options":[],"sort_order":1},
    {"field_type":"long_text","label":"Quels insights avez-vous eus ?","description":"Les prises de conscience ou idees cles","placeholder":"Ce que j''ai appris ou compris...","is_required":false,"options":[],"sort_order":2},
    {"field_type":"long_text","label":"Actions concretes a mettre en place","description":"","placeholder":"Ce que je vais faire suite a cette session...","is_required":true,"options":[],"sort_order":3},
    {"field_type":"single_select","label":"Comment vous sentez-vous ?","description":"","placeholder":"","is_required":true,"options":[{"label":"Motive et confiant","value":"motive"},{"label":"Inspire","value":"inspire"},{"label":"Neutre","value":"neutre"},{"label":"Incertain","value":"incertain"},{"label":"Frustre","value":"frustre"}],"sort_order":4}
  ]'::jsonb,
  true
);
