-- Seed messaging data for testing
-- Uses existing profiles dynamically

DO $$
DECLARE
  admin_id UUID;
  user1_id UUID;
  user2_id UUID;
  user3_id UUID;
  ch_general UUID;
  ch_coaching UUID;
  ch_annonces UUID;
  ch_dm1 UUID;
  ch_dm2 UUID;
  msg_id UUID;
BEGIN
  -- Get existing profile IDs (take first 4 profiles)
  SELECT id INTO admin_id FROM profiles WHERE role = 'admin' LIMIT 1;
  SELECT id INTO user1_id FROM profiles WHERE role = 'client' AND id != admin_id ORDER BY created_at LIMIT 1;
  SELECT id INTO user2_id FROM profiles WHERE role = 'client' AND id NOT IN (admin_id, user1_id) ORDER BY created_at LIMIT 1;
  SELECT id INTO user3_id FROM profiles WHERE role = 'client' AND id NOT IN (admin_id, user1_id, user2_id) ORDER BY created_at LIMIT 1;

  -- Fallback: if no admin found, use first profile
  IF admin_id IS NULL THEN
    SELECT id INTO admin_id FROM profiles ORDER BY created_at LIMIT 1;
  END IF;

  -- Skip if not enough users
  IF admin_id IS NULL THEN
    RAISE NOTICE 'No profiles found, skipping seed';
    RETURN;
  END IF;

  -- ========== CHANNELS ==========

  -- #general
  INSERT INTO channels (id, name, description, type, created_by, is_default, last_message_at)
  VALUES (gen_random_uuid(), 'General', 'Discussions generales de l''equipe', 'public', admin_id, true, now() - interval '5 minutes')
  RETURNING id INTO ch_general;

  -- #coaching
  INSERT INTO channels (id, name, description, type, created_by, last_message_at)
  VALUES (gen_random_uuid(), 'Coaching', 'Echanges sur les sessions de coaching', 'public', admin_id, now() - interval '2 hours')
  RETURNING id INTO ch_coaching;

  -- #annonces
  INSERT INTO channels (id, name, description, type, created_by, last_message_at)
  VALUES (gen_random_uuid(), 'Annonces', 'Annonces importantes et mises a jour', 'private', admin_id, now() - interval '1 day')
  RETURNING id INTO ch_annonces;

  -- ========== CHANNEL MEMBERS ==========

  -- Everyone in #general
  INSERT INTO channel_members (channel_id, profile_id, role) VALUES (ch_general, admin_id, 'admin');
  IF user1_id IS NOT NULL THEN
    INSERT INTO channel_members (channel_id, profile_id, role) VALUES (ch_general, user1_id, 'member');
  END IF;
  IF user2_id IS NOT NULL THEN
    INSERT INTO channel_members (channel_id, profile_id, role) VALUES (ch_general, user2_id, 'member');
  END IF;
  IF user3_id IS NOT NULL THEN
    INSERT INTO channel_members (channel_id, profile_id, role) VALUES (ch_general, user3_id, 'member');
  END IF;

  -- Admin + user1 + user2 in #coaching
  INSERT INTO channel_members (channel_id, profile_id, role) VALUES (ch_coaching, admin_id, 'admin');
  IF user1_id IS NOT NULL THEN
    INSERT INTO channel_members (channel_id, profile_id, role) VALUES (ch_coaching, user1_id, 'member');
  END IF;
  IF user2_id IS NOT NULL THEN
    INSERT INTO channel_members (channel_id, profile_id, role) VALUES (ch_coaching, user2_id, 'member');
  END IF;

  -- Admin + user1 in #annonces
  INSERT INTO channel_members (channel_id, profile_id, role) VALUES (ch_annonces, admin_id, 'admin');
  IF user1_id IS NOT NULL THEN
    INSERT INTO channel_members (channel_id, profile_id, role) VALUES (ch_annonces, user1_id, 'member');
  END IF;

  -- ========== DM CHANNELS ==========

  IF user1_id IS NOT NULL THEN
    INSERT INTO channels (id, name, type, created_by, last_message_at)
    VALUES (gen_random_uuid(), 'DM', 'dm', admin_id, now() - interval '30 minutes')
    RETURNING id INTO ch_dm1;

    INSERT INTO channel_members (channel_id, profile_id, role) VALUES (ch_dm1, admin_id, 'member');
    INSERT INTO channel_members (channel_id, profile_id, role) VALUES (ch_dm1, user1_id, 'member');
  END IF;

  IF user2_id IS NOT NULL THEN
    INSERT INTO channels (id, name, type, created_by, last_message_at)
    VALUES (gen_random_uuid(), 'DM', 'dm', admin_id, now() - interval '3 hours')
    RETURNING id INTO ch_dm2;

    INSERT INTO channel_members (channel_id, profile_id, role) VALUES (ch_dm2, admin_id, 'member');
    INSERT INTO channel_members (channel_id, profile_id, role) VALUES (ch_dm2, user2_id, 'member');
  END IF;

  -- ========== MESSAGES: #general ==========

  INSERT INTO messages (channel_id, sender_id, content, created_at) VALUES
    (ch_general, admin_id, 'Bienvenue sur le canal general ! N''hesitez pas a poser vos questions ici.', now() - interval '7 days'),
    (ch_general, admin_id, 'Rappel : la prochaine session de groupe est prevue pour vendredi a 14h.', now() - interval '3 days');

  IF user1_id IS NOT NULL THEN
    INSERT INTO messages (channel_id, sender_id, content, created_at) VALUES
      (ch_general, user1_id, 'Merci pour l''info ! Je serai present.', now() - interval '3 days' + interval '20 minutes'),
      (ch_general, user1_id, 'Est-ce qu''on peut avoir le lien Zoom en avance ?', now() - interval '2 days');
  END IF;

  IF user2_id IS NOT NULL THEN
    INSERT INTO messages (channel_id, sender_id, content, created_at) VALUES
      (ch_general, user2_id, 'Super, j''ai hate ! J''ai quelques questions sur le module 3.', now() - interval '2 days' + interval '1 hour'),
      (ch_general, user2_id, 'Quelqu''un a des retours sur la strategie de prospection LinkedIn ?', now() - interval '1 day');
  END IF;

  INSERT INTO messages (channel_id, sender_id, content, created_at) VALUES
    (ch_general, admin_id, 'Oui bien sur, je vous envoie le lien demain matin. Pour le module 3, on en parlera en session.', now() - interval '1 day' + interval '2 hours'),
    (ch_general, admin_id, 'Bonne nouvelle : on a un nouveau template de proposition commerciale disponible dans les ressources !', now() - interval '5 minutes');

  -- ========== MESSAGES: #coaching ==========

  INSERT INTO messages (channel_id, sender_id, content, created_at) VALUES
    (ch_coaching, admin_id, 'Canal dedie aux echanges sur vos sessions de coaching. Partagez vos progres et questions ici.', now() - interval '5 days');

  IF user1_id IS NOT NULL THEN
    INSERT INTO messages (channel_id, sender_id, content, created_at) VALUES
      (ch_coaching, user1_id, 'J''ai applique les conseils de la derniere session : 3 nouveaux prospects qualifies cette semaine !', now() - interval '4 days'),
      (ch_coaching, user1_id, 'Par contre j''ai du mal avec le closing au telephone. Des tips ?', now() - interval '3 days');

    INSERT INTO messages (channel_id, sender_id, content, created_at) VALUES
      (ch_coaching, admin_id, 'Bravo pour les prospects ! Pour le closing tel, pense a la methode SPIN : Situation, Probleme, Implication, Need-payoff.', now() - interval '3 days' + interval '30 minutes');
  END IF;

  IF user2_id IS NOT NULL THEN
    INSERT INTO messages (channel_id, sender_id, content, created_at) VALUES
      (ch_coaching, user2_id, 'Moi j''ai lance ma premiere offre a 2000€ cette semaine. Stresse mais excite !', now() - interval '2 hours'),
      (ch_coaching, admin_id, 'Excellent ! C''est le bon prix pour commencer. N''hesite pas a partager le retour de tes prospects.', now() - interval '1 hour');
  END IF;

  -- ========== MESSAGES: #annonces ==========

  INSERT INTO messages (channel_id, sender_id, content, created_at) VALUES
    (ch_annonces, admin_id, '📢 Nouvelle formation disponible : "Closer en 30 jours". Acces dans l''onglet Formation.', now() - interval '5 days'),
    (ch_annonces, admin_id, '🎯 Objectif du mois : chaque eleve doit generer au moins 3 appels decouverte. Let''s go !', now() - interval '2 days'),
    (ch_annonces, admin_id, '🔥 Mise a jour plateforme : nouveau CRM avec fiches eleves detaillees. Testez et donnez vos retours !', now() - interval '1 day');

  -- ========== MESSAGES: DM admin <-> user1 ==========

  IF ch_dm1 IS NOT NULL AND user1_id IS NOT NULL THEN
    INSERT INTO messages (channel_id, sender_id, content, created_at) VALUES
      (ch_dm1, admin_id, 'Salut ! Comment s''est passee ta semaine de prospection ?', now() - interval '2 days'),
      (ch_dm1, user1_id, 'Salut ! Ca avance bien, j''ai 5 leads chauds en ce moment.', now() - interval '2 days' + interval '30 minutes'),
      (ch_dm1, admin_id, 'Top ! On fait le point en session demain ? Je veux qu''on travaille tes scripts d''appel.', now() - interval '2 days' + interval '45 minutes'),
      (ch_dm1, user1_id, 'Parfait, j''ai justement prepare quelques questions. A demain !', now() - interval '2 days' + interval '1 hour'),
      (ch_dm1, user1_id, 'Au fait, j''ai signe mon premier client a 1500€/mois !!! 🎉', now() - interval '30 minutes'),
      (ch_dm1, admin_id, 'FELICITATIONS ! C''est enorme ! On celebre ca en session. Tu vois, la methode fonctionne 💪', now() - interval '25 minutes');
  END IF;

  -- ========== MESSAGES: DM admin <-> user2 ==========

  IF ch_dm2 IS NOT NULL AND user2_id IS NOT NULL THEN
    INSERT INTO messages (channel_id, sender_id, content, created_at) VALUES
      (ch_dm2, user2_id, 'Bonjour, j''ai une question sur la tarification de mon offre.', now() - interval '1 day'),
      (ch_dm2, admin_id, 'Bien sur, dis-moi tout. Quelle est ta cible et ton offre actuelle ?', now() - interval '1 day' + interval '15 minutes'),
      (ch_dm2, user2_id, 'Je vise les coachs sportifs, et je propose un accompagnement marketing a 800€/mois. C''est trop bas ?', now() - interval '1 day' + interval '30 minutes'),
      (ch_dm2, admin_id, 'Pour du coaching marketing, oui c''est en dessous du marche. Vise 1500-2000€ minimum. On verra comment justifier ce prix en session.', now() - interval '3 hours');
  END IF;

  -- ========== PIN a message in #general ==========
  UPDATE messages SET is_pinned = true
  WHERE id = (
    SELECT id FROM messages
    WHERE channel_id = ch_general AND sender_id = admin_id
    AND content LIKE 'Bienvenue%'
    LIMIT 1
  );

  RAISE NOTICE 'Messaging seed data inserted successfully!';
END $$;
