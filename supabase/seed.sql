-- ═══════════════════════════════════════
-- OFF MARKET — SEED DATA
-- ═══════════════════════════════════════
-- This creates fake users and populates all tables with demo data.
-- Run this AFTER the migrations.

-- Create fake auth users (password: "password123" for all)
-- We use Supabase's auth.users directly with bcrypt hashed password
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, is_super_admin
) VALUES
  -- Coach Sophie Martin
  ('a1111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'sophie@offmarket.fr', crypt('password123', gen_salt('bf')),
   now(), '{"full_name": "Sophie Martin"}'::jsonb, now() - interval '60 days', now(), '', '', false),
  -- Team member Lucas Dubois
  ('a2222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'lucas@offmarket.fr', crypt('password123', gen_salt('bf')),
   now(), '{"full_name": "Lucas Dubois"}'::jsonb, now() - interval '45 days', now(), '', '', false),
  -- Student Marie Leroy
  ('a3333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'marie@test.fr', crypt('password123', gen_salt('bf')),
   now(), '{"full_name": "Marie Leroy"}'::jsonb, now() - interval '30 days', now(), '', '', false),
  -- Student Thomas Bernard
  ('a4444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'thomas@test.fr', crypt('password123', gen_salt('bf')),
   now(), '{"full_name": "Thomas Bernard"}'::jsonb, now() - interval '25 days', now(), '', '', false),
  -- Student Emma Petit
  ('a5555555-5555-5555-5555-555555555555', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'emma@test.fr', crypt('password123', gen_salt('bf')),
   now(), '{"full_name": "Emma Petit"}'::jsonb, now() - interval '20 days', now(), '', '', false),
  -- Student Hugo Moreau
  ('a6666666-6666-6666-6666-666666666666', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'hugo@test.fr', crypt('password123', gen_salt('bf')),
   now(), '{"full_name": "Hugo Moreau"}'::jsonb, now() - interval '15 days', now(), '', '', false),
  -- Student Chloe Roux
  ('a7777777-7777-7777-7777-777777777777', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'chloe@test.fr', crypt('password123', gen_salt('bf')),
   now(), '{"full_name": "Chloe Roux"}'::jsonb, now() - interval '10 days', now(), '', '', false)
ON CONFLICT (id) DO NOTHING;

-- Create identities for each user (required by Supabase Auth)
INSERT INTO auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
VALUES
  ('a1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', '{"sub":"a1111111-1111-1111-1111-111111111111","email":"sophie@offmarket.fr"}'::jsonb, 'email', now(), now(), now()),
  ('a2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222', '{"sub":"a2222222-2222-2222-2222-222222222222","email":"lucas@offmarket.fr"}'::jsonb, 'email', now(), now(), now()),
  ('a3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', '{"sub":"a3333333-3333-3333-3333-333333333333","email":"marie@test.fr"}'::jsonb, 'email', now(), now(), now()),
  ('a4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', '{"sub":"a4444444-4444-4444-4444-444444444444","email":"thomas@test.fr"}'::jsonb, 'email', now(), now(), now()),
  ('a5555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', 'a5555555-5555-5555-5555-555555555555', '{"sub":"a5555555-5555-5555-5555-555555555555","email":"emma@test.fr"}'::jsonb, 'email', now(), now(), now()),
  ('a6666666-6666-6666-6666-666666666666', 'a6666666-6666-6666-6666-666666666666', 'a6666666-6666-6666-6666-666666666666', '{"sub":"a6666666-6666-6666-6666-666666666666","email":"hugo@test.fr"}'::jsonb, 'email', now(), now(), now()),
  ('a7777777-7777-7777-7777-777777777777', 'a7777777-7777-7777-7777-777777777777', 'a7777777-7777-7777-7777-777777777777', '{"sub":"a7777777-7777-7777-7777-777777777777","email":"chloe@test.fr"}'::jsonb, 'email', now(), now(), now())
ON CONFLICT (id) DO NOTHING;

-- The trigger auto-creates profiles, but we need to update roles
-- Wait for trigger then update
UPDATE public.profiles SET role = 'coach', bio = 'Coach business & mindset', phone = '+33 6 12 34 56 78' WHERE id = 'a1111111-1111-1111-1111-111111111111';
UPDATE public.profiles SET role = 'team', bio = 'Community manager', phone = '+33 6 98 76 54 32' WHERE id = 'a2222222-2222-2222-2222-222222222222';
UPDATE public.profiles SET role = 'student', bio = 'Entrepreneuse en e-commerce' WHERE id = 'a3333333-3333-3333-3333-333333333333';
UPDATE public.profiles SET role = 'student', bio = 'Freelance en marketing digital' WHERE id = 'a4444444-4444-4444-4444-444444444444';
UPDATE public.profiles SET role = 'student', bio = 'Lancement de sa marque de bijoux' WHERE id = 'a5555555-5555-5555-5555-555555555555';
UPDATE public.profiles SET role = 'student', bio = 'Coach sportif en reconversion' WHERE id = 'a6666666-6666-6666-6666-666666666666';
UPDATE public.profiles SET role = 'student', bio = 'Freelance copywriting' WHERE id = 'a7777777-7777-7777-7777-777777777777';

-- Update student_details (auto-created by trigger for student role)
UPDATE public.student_details SET tag = 'vip', revenue = 4500, lifetime_value = 12000, health_score = 92, acquisition_source = 'Instagram', program = 'Elite Business', goals = 'Atteindre 10K/mois', last_engagement_at = now() - interval '1 day' WHERE profile_id = 'a3333333-3333-3333-3333-333333333333';
UPDATE public.student_details SET tag = 'standard', revenue = 2200, lifetime_value = 5500, health_score = 75, acquisition_source = 'YouTube', program = 'Business Starter', goals = 'Lancer son agence', last_engagement_at = now() - interval '2 days' WHERE profile_id = 'a4444444-4444-4444-4444-444444444444';
UPDATE public.student_details SET tag = 'new', revenue = 997, lifetime_value = 997, health_score = 85, acquisition_source = 'TikTok', program = 'Business Starter', goals = 'Creer sa boutique en ligne', last_engagement_at = now() - interval '3 hours' WHERE profile_id = 'a5555555-5555-5555-5555-555555555555';
UPDATE public.student_details SET tag = 'at_risk', revenue = 1500, lifetime_value = 3000, health_score = 35, acquisition_source = 'Referral', program = 'Elite Business', goals = 'Reconversion professionnelle', last_engagement_at = now() - interval '12 days' WHERE profile_id = 'a6666666-6666-6666-6666-666666666666';
UPDATE public.student_details SET tag = 'standard', revenue = 2997, lifetime_value = 6000, health_score = 68, acquisition_source = 'Instagram', program = 'Business Starter', goals = 'Developper son personal branding', last_engagement_at = now() - interval '4 days' WHERE profile_id = 'a7777777-7777-7777-7777-777777777777';

-- ═══════════════════════════════════════
-- CHANNELS & MESSAGES
-- ═══════════════════════════════════════

INSERT INTO public.channels (id, name, description, type, created_by, is_default, last_message_at) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'general', 'Discussion generale pour tout le monde', 'public', 'a1111111-1111-1111-1111-111111111111', true, now() - interval '5 minutes'),
  ('c2222222-2222-2222-2222-222222222222', 'annonces', 'Annonces importantes du programme', 'public', 'a1111111-1111-1111-1111-111111111111', false, now() - interval '2 hours'),
  ('c3333333-3333-3333-3333-333333333333', 'victoires', 'Partagez vos wins ici !', 'public', 'a1111111-1111-1111-1111-111111111111', false, now() - interval '1 hour'),
  ('c4444444-4444-4444-4444-444444444444', 'team-interne', 'Discussion interne equipe', 'private', 'a1111111-1111-1111-1111-111111111111', false, now() - interval '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- Add members to channels (get the first admin user's ID dynamically)
DO $$
DECLARE
  admin_id UUID;
BEGIN
  -- Get the real admin user (the one who signed up)
  SELECT id INTO admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;

  -- Add everyone to general
  IF admin_id IS NOT NULL THEN
    INSERT INTO public.channel_members (channel_id, profile_id) VALUES
      ('c1111111-1111-1111-1111-111111111111', admin_id)
    ON CONFLICT (channel_id, profile_id) DO NOTHING;
  END IF;

  INSERT INTO public.channel_members (channel_id, profile_id) VALUES
    ('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111'),
    ('c1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222'),
    ('c1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333'),
    ('c1111111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444'),
    ('c1111111-1111-1111-1111-111111111111', 'a5555555-5555-5555-5555-555555555555'),
    -- annonces
    ('c2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111'),
    ('c2222222-2222-2222-2222-222222222222', 'a2222222-2222-2222-2222-222222222222'),
    ('c2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333'),
    ('c2222222-2222-2222-2222-222222222222', 'a4444444-4444-4444-4444-444444444444'),
    -- victoires
    ('c3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111'),
    ('c3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333'),
    ('c3333333-3333-3333-3333-333333333333', 'a5555555-5555-5555-5555-555555555555'),
    -- team-interne (private)
    ('c4444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111'),
    ('c4444444-4444-4444-4444-444444444444', 'a2222222-2222-2222-2222-222222222222')
  ON CONFLICT (channel_id, profile_id) DO NOTHING;

  -- Also add admin to annonces, victoires, team-interne
  IF admin_id IS NOT NULL THEN
    INSERT INTO public.channel_members (channel_id, profile_id) VALUES
      ('c2222222-2222-2222-2222-222222222222', admin_id),
      ('c3333333-3333-3333-3333-333333333333', admin_id),
      ('c4444444-4444-4444-4444-444444444444', admin_id)
    ON CONFLICT (channel_id, profile_id) DO NOTHING;
  END IF;
END $$;

-- Messages in #general
INSERT INTO public.messages (channel_id, sender_id, content, created_at) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Bienvenue sur Off Market ! Cet espace est fait pour echanger, poser vos questions et partager vos avancees.', now() - interval '7 days'),
  ('c1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 'Merci Sophie ! Trop contente de rejoindre le programme', now() - interval '7 days' + interval '10 minutes'),
  ('c1111111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444', 'Hello tout le monde ! Hate de commencer', now() - interval '6 days'),
  ('c1111111-1111-1111-1111-111111111111', 'a5555555-5555-5555-5555-555555555555', 'Salut la team ! Je viens de finir le module 1, c est ouf', now() - interval '5 days'),
  ('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'N oubliez pas le live de demain a 14h ! On va parler strategie acquisition', now() - interval '2 days'),
  ('c1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 'Je serai la ! J ai plein de questions sur le funnel', now() - interval '2 days' + interval '30 minutes'),
  ('c1111111-1111-1111-1111-111111111111', 'a2222222-2222-2222-2222-222222222222', 'Rappel : le live commence dans 1h !', now() - interval '1 day'),
  ('c1111111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444', 'Le live etait incroyable, merci pour les tips Sophie', now() - interval '12 hours'),
  ('c1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'Avec plaisir Thomas ! Continue comme ca', now() - interval '11 hours'),
  ('c1111111-1111-1111-1111-111111111111', 'a5555555-5555-5555-5555-555555555555', 'Question rapide : quelqu un a deja teste les Facebook Ads pour du e-commerce ?', now() - interval '5 minutes');

-- Messages in #annonces
INSERT INTO public.messages (channel_id, sender_id, content, created_at) VALUES
  ('c2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'NOUVEAU MODULE DISPONIBLE : "Scale ton business a 10K/mois" est en ligne ! Foncez le decouvrir dans la section Formation.', now() - interval '3 days'),
  ('c2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'Live Q&A ce vendredi a 18h. Preparez vos questions !', now() - interval '2 hours');

-- Messages in #victoires
INSERT INTO public.messages (channel_id, sender_id, content, created_at) VALUES
  ('c3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'Premier mois a 5K de CA ! Merci le programme, ca change la vie', now() - interval '4 days'),
  ('c3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'ENORME Marie ! Continue sur cette lancee', now() - interval '4 days' + interval '15 minutes'),
  ('c3333333-3333-3333-3333-333333333333', 'a5555555-5555-5555-5555-555555555555', 'J ai eu ma premiere vente en ligne !!!', now() - interval '1 hour');

-- Messages in #team-interne
INSERT INTO public.messages (channel_id, sender_id, content, created_at) VALUES
  ('c4444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 'Hugo n a pas ete actif depuis 12 jours, il faudrait le relancer', now() - interval '1 day'),
  ('c4444444-4444-4444-4444-444444444444', 'a2222222-2222-2222-2222-222222222222', 'Je m en occupe, je lui envoie un message perso', now() - interval '30 minutes');

-- ═══════════════════════════════════════
-- COURSES, MODULES, LESSONS
-- ═══════════════════════════════════════

INSERT INTO public.courses (id, title, description, status, sort_order, is_mandatory, estimated_duration, created_by) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'Les Fondamentaux du Business en Ligne', 'Tout ce que tu dois savoir pour lancer ton business en ligne de zero. Mindset, strategie, outils.', 'published', 1, true, 480, 'a1111111-1111-1111-1111-111111111111'),
  ('d2222222-2222-2222-2222-222222222222', 'Scale ton Business a 10K/mois', 'Passe au niveau superieur avec des strategies avancees d acquisition et de conversion.', 'published', 2, false, 360, 'a1111111-1111-1111-1111-111111111111'),
  ('d3333333-3333-3333-3333-333333333333', 'Personal Branding & Reseaux Sociaux', 'Construis une marque personnelle forte et attire tes clients ideaux.', 'published', 3, false, 300, 'a1111111-1111-1111-1111-111111111111'),
  ('d4444444-4444-4444-4444-444444444444', 'Masterclass Vente & Closing', 'Apprends a vendre sans etre pushy. Techniques de closing ethique.', 'draft', 4, false, 240, 'a1111111-1111-1111-1111-111111111111')
ON CONFLICT (id) DO NOTHING;

-- Modules for Course 1
INSERT INTO public.modules (id, course_id, title, description, sort_order) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Module 1 : Le Mindset Entrepreneur', 'Adopte le bon etat d esprit pour reussir', 1),
  ('b2222222-2222-2222-2222-222222222222', 'd1111111-1111-1111-1111-111111111111', 'Module 2 : Trouver ta Niche', 'Identifie ton marche ideal et ta proposition de valeur unique', 2),
  ('b3333333-3333-3333-3333-333333333333', 'd1111111-1111-1111-1111-111111111111', 'Module 3 : Creer ton Offre', 'Structure une offre irresistible', 3)
ON CONFLICT (id) DO NOTHING;

-- Modules for Course 2
INSERT INTO public.modules (id, course_id, title, description, sort_order) VALUES
  ('b4444444-4444-4444-4444-444444444444', 'd2222222-2222-2222-2222-222222222222', 'Module 1 : Funnel de Vente', 'Construis un funnel qui convertit', 1),
  ('b5555555-5555-5555-5555-555555555555', 'd2222222-2222-2222-2222-222222222222', 'Module 2 : Publicite Payante', 'Meta Ads, Google Ads : les bases', 2)
ON CONFLICT (id) DO NOTHING;

-- Modules for Course 3
INSERT INTO public.modules (id, course_id, title, description, sort_order) VALUES
  ('b6666666-6666-6666-6666-666666666666', 'd3333333-3333-3333-3333-333333333333', 'Module 1 : Ton Identite de Marque', 'Definis qui tu es et ce que tu representes', 1),
  ('b7777777-7777-7777-7777-777777777777', 'd3333333-3333-3333-3333-333333333333', 'Module 2 : Strategie de Contenu', 'Planifie et cree du contenu qui engage', 2)
ON CONFLICT (id) DO NOTHING;

-- Lessons for Module 1 (Course 1)
INSERT INTO public.lessons (id, module_id, title, content_type, content, sort_order, estimated_duration) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'Introduction : Pourquoi le Mindset compte', 'video', '{"video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "description": "Dans cette video, on va voir pourquoi 80% de ta reussite depend de ton mindset."}'::jsonb, 1, 15),
  ('e2222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 'Les 5 croyances limitantes a eliminer', 'text', '{"body": "<h2>Les 5 croyances qui te bloquent</h2><p>1. Je ne suis pas assez qualifie(e)</p><p>2. Le marche est sature</p><p>3. Il faut beaucoup d argent pour commencer</p><p>4. Je n ai pas le temps</p><p>5. Les gens ne payeront jamais pour ca</p><p>Chacune de ces croyances est un mensonge que tu te racontes. Dans les prochaines lecons, on va les deconstruire une par une.</p>"}'::jsonb, 2, 10),
  ('e3333333-3333-3333-3333-333333333333', 'b1111111-1111-1111-1111-111111111111', 'Quiz : Ton niveau de mindset', 'quiz', '{"questions": [{"question": "Quand tu fais face a un echec, tu...", "options": ["Abandonnes", "Analyses et recommences", "Te plains", "Ignores"], "correct": 1}, {"question": "Le succes est...", "options": ["De la chance", "Du travail + de la strategie", "Reserve aux riches", "Impossible pour moi"], "correct": 1}]}'::jsonb, 3, 5)
ON CONFLICT (id) DO NOTHING;

-- Lessons for Module 2 (Course 1)
INSERT INTO public.lessons (id, module_id, title, content_type, content, sort_order, estimated_duration) VALUES
  ('e4444444-4444-4444-4444-444444444444', 'b2222222-2222-2222-2222-222222222222', 'Comment choisir ta niche rentable', 'video', '{"video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "description": "La methode en 3 etapes pour trouver ta niche ideale."}'::jsonb, 1, 20),
  ('e5555555-5555-5555-5555-555555555555', 'b2222222-2222-2222-2222-222222222222', 'Exercice : Definis ton client ideal', 'assignment', '{"instructions": "Remplis la fiche persona de ton client ideal. Reponds aux questions suivantes : Age, Probleme principal, Objectif, Budget, Ou il traine en ligne.", "submission_type": "text"}'::jsonb, 2, 30)
ON CONFLICT (id) DO NOTHING;

-- Lessons for Module 3 (Course 1)
INSERT INTO public.lessons (id, module_id, title, content_type, content, sort_order, estimated_duration) VALUES
  ('e6666666-6666-6666-6666-666666666666', 'b3333333-3333-3333-3333-333333333333', 'L anatomie d une offre irresistible', 'video', '{"video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ", "description": "Decompose les elements qui font qu une offre se vend toute seule."}'::jsonb, 1, 25),
  ('e7777777-7777-7777-7777-777777777777', 'b3333333-3333-3333-3333-333333333333', 'Template : Structure ton offre', 'text', '{"body": "<h2>Template Offre Irresistible</h2><p><strong>Nom de ton offre :</strong> [...]</p><p><strong>Promesse principale :</strong> [...]</p><p><strong>Pour qui :</strong> [...]</p><p><strong>Resultat concret :</strong> [...]</p><p><strong>Delai :</strong> [...]</p><p><strong>Prix :</strong> [...]</p><p><strong>Bonus :</strong> [...]</p><p><strong>Garantie :</strong> [...]</p>"}'::jsonb, 2, 15)
ON CONFLICT (id) DO NOTHING;

-- Lesson progress for students
INSERT INTO public.lesson_progress (lesson_id, student_id, status, progress_percent, completed_at) VALUES
  -- Marie (VIP) - completed all of module 1
  ('e1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 'completed', 100, now() - interval '20 days'),
  ('e2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333', 'completed', 100, now() - interval '18 days'),
  ('e3333333-3333-3333-3333-333333333333', 'a3333333-3333-3333-3333-333333333333', 'completed', 100, now() - interval '17 days'),
  ('e4444444-4444-4444-4444-444444444444', 'a3333333-3333-3333-3333-333333333333', 'completed', 100, now() - interval '15 days'),
  ('e5555555-5555-5555-5555-555555555555', 'a3333333-3333-3333-3333-333333333333', 'in_progress', 50, null),
  -- Thomas - module 1 done, started module 2
  ('e1111111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444', 'completed', 100, now() - interval '15 days'),
  ('e2222222-2222-2222-2222-222222222222', 'a4444444-4444-4444-4444-444444444444', 'completed', 100, now() - interval '14 days'),
  ('e3333333-3333-3333-3333-333333333333', 'a4444444-4444-4444-4444-444444444444', 'completed', 100, now() - interval '13 days'),
  ('e4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'in_progress', 60, null),
  -- Emma - just started
  ('e1111111-1111-1111-1111-111111111111', 'a5555555-5555-5555-5555-555555555555', 'completed', 100, now() - interval '5 days'),
  ('e2222222-2222-2222-2222-222222222222', 'a5555555-5555-5555-5555-555555555555', 'in_progress', 30, null),
  -- Hugo (at risk) - only started first lesson
  ('e1111111-1111-1111-1111-111111111111', 'a6666666-6666-6666-6666-666666666666', 'in_progress', 40, null)
ON CONFLICT (lesson_id, student_id) DO NOTHING;

-- ═══════════════════════════════════════
-- FORMS
-- ═══════════════════════════════════════

INSERT INTO public.forms (id, title, description, status, created_by, thank_you_message, target_audience) VALUES
  ('f1111111-1111-1111-1111-111111111111', 'Feedback Programme - Mois 1', 'Dis-nous comment se passe ton premier mois !', 'active', 'a1111111-1111-1111-1111-111111111111', 'Merci pour ton retour, ca nous aide enormement !', 'all'),
  ('f2222222-2222-2222-2222-222222222222', 'Questionnaire Onboarding', 'Aide-nous a mieux te connaitre pour personnaliser ton experience.', 'active', 'a1111111-1111-1111-1111-111111111111', 'Bienvenue dans le programme !', 'new'),
  ('f3333333-3333-3333-3333-333333333333', 'Sondage : Prochain Module', 'Quel sujet vous interesse le plus pour le prochain module ?', 'closed', 'a1111111-1111-1111-1111-111111111111', 'Merci pour ton vote !', 'all')
ON CONFLICT (id) DO NOTHING;

-- Form fields for Feedback form
INSERT INTO public.form_fields (form_id, field_type, label, description, is_required, sort_order, options) VALUES
  ('f1111111-1111-1111-1111-111111111111', 'rating', 'Note globale du programme', 'De 1 a 5, comment notes-tu le programme ?', true, 1, '{"min": 1, "max": 5}'::jsonb),
  ('f1111111-1111-1111-1111-111111111111', 'nps', 'Recommanderais-tu ce programme ?', 'De 0 a 10', true, 2, '{}'::jsonb),
  ('f1111111-1111-1111-1111-111111111111', 'single_select', 'Module prefere', 'Quel module as-tu prefere ?', false, 3, '["Mindset", "Trouver ta niche", "Creer ton offre"]'::jsonb),
  ('f1111111-1111-1111-1111-111111111111', 'long_text', 'Commentaires', 'Dis-nous tout !', false, 4, '[]'::jsonb);

-- Form fields for Onboarding form
INSERT INTO public.form_fields (form_id, field_type, label, description, is_required, sort_order) VALUES
  ('f2222222-2222-2222-2222-222222222222', 'short_text', 'Quel est ton business ?', 'Decris en une phrase', true, 1),
  ('f2222222-2222-2222-2222-222222222222', 'number', 'CA mensuel actuel', 'En euros', false, 2),
  ('f2222222-2222-2222-2222-222222222222', 'short_text', 'Ton objectif a 6 mois', null, true, 3),
  ('f2222222-2222-2222-2222-222222222222', 'single_select', 'Comment nous as-tu connu ?', null, true, 4);

UPDATE public.form_fields SET options = '["Instagram", "YouTube", "TikTok", "Bouche a oreille", "Google", "Autre"]'::jsonb WHERE form_id = 'f2222222-2222-2222-2222-222222222222' AND field_type = 'single_select';

-- Form submissions
INSERT INTO public.form_submissions (form_id, respondent_id, answers, submitted_at) VALUES
  ('f1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', '{"Note globale du programme": 5, "Recommanderais-tu ce programme ?": 9, "Module prefere": "Creer ton offre", "Commentaires": "Programme incroyable, Sophie est au top. J ai deja vu des resultats concrets."}'::jsonb, now() - interval '5 days'),
  ('f1111111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444', '{"Note globale du programme": 4, "Recommanderais-tu ce programme ?": 7, "Module prefere": "Trouver ta niche", "Commentaires": "Tres bien structure, j aimerais plus de live Q&A."}'::jsonb, now() - interval '3 days'),
  ('f1111111-1111-1111-1111-111111111111', 'a5555555-5555-5555-5555-555555555555', '{"Note globale du programme": 5, "Recommanderais-tu ce programme ?": 10, "Module prefere": "Mindset", "Commentaires": "Le module mindset m a change la vie !"}'::jsonb, now() - interval '1 day'),
  ('f2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333', '{"Quel est ton business ?": "E-commerce bijoux artisanaux", "CA mensuel actuel": 2000, "Ton objectif a 6 mois": "Atteindre 10K/mois", "Comment nous as-tu connu ?": "Instagram"}'::jsonb, now() - interval '28 days'),
  ('f2222222-2222-2222-2222-222222222222', 'a4444444-4444-4444-4444-444444444444', '{"Quel est ton business ?": "Agence marketing digital", "CA mensuel actuel": 500, "Ton objectif a 6 mois": "5K/mois et 3 clients", "Comment nous as-tu connu ?": "YouTube"}'::jsonb, now() - interval '20 days');

-- ═══════════════════════════════════════
-- STUDENT ACTIVITIES
-- ═══════════════════════════════════════

INSERT INTO public.student_activities (student_id, activity_type, metadata, created_at) VALUES
  ('a3333333-3333-3333-3333-333333333333', 'login', '{}'::jsonb, now() - interval '1 day'),
  ('a3333333-3333-3333-3333-333333333333', 'lesson_completed', '{"lesson": "Les 5 croyances limitantes"}'::jsonb, now() - interval '18 days'),
  ('a3333333-3333-3333-3333-333333333333', 'module_completed', '{"module": "Le Mindset Entrepreneur"}'::jsonb, now() - interval '17 days'),
  ('a3333333-3333-3333-3333-333333333333', 'form_submitted', '{"form": "Feedback Programme"}'::jsonb, now() - interval '5 days'),
  ('a3333333-3333-3333-3333-333333333333', 'milestone_reached', '{"milestone": "Premier 5K de CA"}'::jsonb, now() - interval '4 days'),
  ('a3333333-3333-3333-3333-333333333333', 'message_sent', '{"channel": "victoires"}'::jsonb, now() - interval '4 days'),
  ('a4444444-4444-4444-4444-444444444444', 'login', '{}'::jsonb, now() - interval '2 days'),
  ('a4444444-4444-4444-4444-444444444444', 'lesson_completed', '{"lesson": "Quiz mindset"}'::jsonb, now() - interval '13 days'),
  ('a4444444-4444-4444-4444-444444444444', 'form_submitted', '{"form": "Feedback Programme"}'::jsonb, now() - interval '3 days'),
  ('a5555555-5555-5555-5555-555555555555', 'login', '{}'::jsonb, now() - interval '3 hours'),
  ('a5555555-5555-5555-5555-555555555555', 'lesson_completed', '{"lesson": "Introduction Mindset"}'::jsonb, now() - interval '5 days'),
  ('a5555555-5555-5555-5555-555555555555', 'payment_received', '{"amount": 997}'::jsonb, now() - interval '20 days'),
  ('a6666666-6666-6666-6666-666666666666', 'login', '{}'::jsonb, now() - interval '12 days'),
  ('a7777777-7777-7777-7777-777777777777', 'login', '{}'::jsonb, now() - interval '4 days'),
  ('a7777777-7777-7777-7777-777777777777', 'message_sent', '{"channel": "general"}'::jsonb, now() - interval '4 days');

-- ═══════════════════════════════════════
-- STUDENT NOTES & TASKS
-- ═══════════════════════════════════════

INSERT INTO public.student_notes (student_id, author_id, content, is_pinned) VALUES
  ('a3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'Marie est tres motivee et avance vite. Potentiel pour devenir ambassadrice du programme.', true),
  ('a3333333-3333-3333-3333-333333333333', 'a2222222-2222-2222-2222-222222222222', 'A partage sa victoire de 5K dans le groupe, super engagement.', false),
  ('a6666666-6666-6666-6666-666666666666', 'a1111111-1111-1111-1111-111111111111', 'Hugo n est plus actif depuis 12 jours. Envoyer un message de relance.', true),
  ('a6666666-6666-6666-6666-666666666666', 'a2222222-2222-2222-2222-222222222222', 'Appel de relance prevu mardi prochain.', false),
  ('a4444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 'Thomas avance bien mais a besoin de plus d accompagnement sur la partie technique du funnel.', false);

INSERT INTO public.student_tasks (student_id, assigned_by, title, description, due_date, status, priority) VALUES
  ('a3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'Finaliser exercice persona', 'Terminer la fiche client ideal du module 2', now() + interval '3 days', 'in_progress', 'medium'),
  ('a3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'Preparer pitch offre', 'Utiliser le template du module 3 pour creer son offre', now() + interval '7 days', 'todo', 'high'),
  ('a6666666-6666-6666-6666-666666666666', 'a1111111-1111-1111-1111-111111111111', 'Reprendre le module 1', 'Terminer les lecons restantes du module Mindset', now() + interval '2 days', 'todo', 'urgent'),
  ('a6666666-6666-6666-6666-666666666666', 'a2222222-2222-2222-2222-222222222222', 'Appel de suivi', 'Planifier un appel de 30min pour faire le point', now() + interval '1 day', 'todo', 'high'),
  ('a4444444-4444-4444-4444-444444444444', 'a1111111-1111-1111-1111-111111111111', 'Soumettre feedback mois 2', 'Remplir le formulaire de feedback', now() + interval '5 days', 'todo', 'low');

-- ═══════════════════════════════════════
-- NOTIFICATIONS
-- ═══════════════════════════════════════

-- Get the real admin user ID for notifications
DO $$
DECLARE
  admin_id UUID;
BEGIN
  SELECT id INTO admin_id FROM public.profiles WHERE role = 'admin' LIMIT 1;
  IF admin_id IS NULL THEN RETURN; END IF;

  INSERT INTO public.notifications (recipient_id, type, title, body, data, is_read, created_at) VALUES
    (admin_id, 'new_message', 'Nouveau message dans #general', 'Emma : Question rapide sur les Facebook Ads...', '{"channel_id": "c1111111-1111-1111-1111-111111111111"}'::jsonb, false, now() - interval '5 minutes'),
    (admin_id, 'form_response', 'Nouvelle reponse au feedback', 'Emma a rempli le formulaire "Feedback Programme"', '{"form_id": "f1111111-1111-1111-1111-111111111111"}'::jsonb, false, now() - interval '1 day'),
    (admin_id, 'student_inactive', 'Eleve inactif : Hugo Moreau', 'Hugo n a pas ete actif depuis 12 jours', '{"student_id": "a6666666-6666-6666-6666-666666666666"}'::jsonb, false, now() - interval '1 day'),
    (admin_id, 'module_complete', 'Module termine par Marie', 'Marie a termine "Le Mindset Entrepreneur"', '{"student_id": "a3333333-3333-3333-3333-333333333333"}'::jsonb, true, now() - interval '17 days'),
    (admin_id, 'new_enrollment', 'Nouvelle inscription', 'Chloe Roux a rejoint le programme', '{"student_id": "a7777777-7777-7777-7777-777777777777"}'::jsonb, true, now() - interval '10 days'),
    (admin_id, 'ai_insight', 'Insight IA : Engagement en hausse', 'L engagement global a augmente de 23% cette semaine', '{}'::jsonb, false, now() - interval '2 hours');
END $$;

-- ═══════════════════════════════════════
-- AI INSIGHTS
-- ═══════════════════════════════════════

INSERT INTO public.ai_insights (type, title, description, priority) VALUES
  ('engagement_drop', 'Hugo Moreau a risque', 'Hugo n a pas ete actif depuis 12 jours. Son health score est passe de 65 a 35. Action recommandee : appel de relance.', 'high'),
  ('revenue_insight', 'Revenus en croissance', 'Le revenu moyen par eleve a augmente de 18% ce mois-ci. Les eleves du programme Elite performent 2x mieux.', 'medium'),
  ('content_suggestion', 'Nouveau contenu suggere', 'Basé sur les questions dans #general, un module sur les Facebook Ads serait pertinent. 3 eleves ont pose des questions sur ce sujet.', 'medium'),
  ('student_risk', 'Attention : 1 eleve a risque', 'Hugo Moreau montre des signes de decrochage. Derniere connexion il y a 12 jours.', 'high'),
  ('weekly_summary', 'Resume de la semaine', '5 eleves actifs, 3 lecons completees, 1 nouveau formulaire soumis, 2 nouvelles victoires partagees.', 'low');

-- ═══════════════════════════════════════
-- LESSON COMMENTS
-- ═══════════════════════════════════════

INSERT INTO public.lesson_comments (lesson_id, author_id, content, created_at) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'a3333333-3333-3333-3333-333333333333', 'Super intro ! Ca remet les idees en place', now() - interval '20 days'),
  ('e1111111-1111-1111-1111-111111111111', 'a4444444-4444-4444-4444-444444444444', 'Tellement vrai sur les croyances limitantes', now() - interval '15 days'),
  ('e1111111-1111-1111-1111-111111111111', 'a5555555-5555-5555-5555-555555555555', 'Je me suis reconnue dans chaque point, merci Sophie', now() - interval '5 days'),
  ('e2222222-2222-2222-2222-222222222222', 'a3333333-3333-3333-3333-333333333333', 'Le point sur "le marche est sature" m a ouvert les yeux', now() - interval '18 days'),
  ('e4444444-4444-4444-4444-444444444444', 'a4444444-4444-4444-4444-444444444444', 'La methode en 3 etapes est geniale, simple et efficace', now() - interval '10 days');
