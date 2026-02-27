-- ============================================
-- Migration 011: Auto-provisioning des clients
-- ============================================

-- Marquer le canal "general" existant comme default
UPDATE public.channels SET is_default = true WHERE name = 'general' AND is_default = false;

-- Fonction: auto-provisionner un nouveau client
-- Quand un profil passe en role='client':
-- 1. Creer/trouver le canal General
-- 2. L'ajouter comme membre
-- 3. Message systeme de bienvenue
-- 4. Notification de bienvenue
CREATE OR REPLACE FUNCTION auto_provision_client()
RETURNS TRIGGER AS $$
DECLARE
  general_id UUID;
BEGIN
  -- Seulement quand le role change vers 'client'
  IF NEW.role::text = 'client' AND (TG_OP = 'INSERT' OR OLD.role::text IS DISTINCT FROM 'client') THEN
    -- Trouver ou creer le canal General
    SELECT id INTO general_id FROM public.channels WHERE is_default = true LIMIT 1;

    IF general_id IS NULL THEN
      INSERT INTO public.channels (name, type, is_default, description)
      VALUES ('General', 'public', true, 'Canal general pour tous les membres')
      RETURNING id INTO general_id;
    END IF;

    -- Ajouter au canal General
    INSERT INTO public.channel_members (channel_id, profile_id, role)
    VALUES (general_id, NEW.id, 'member')
    ON CONFLICT (channel_id, profile_id) DO NOTHING;

    -- Message systeme de bienvenue
    INSERT INTO public.messages (channel_id, sender_id, content, content_type)
    VALUES (general_id, NEW.id, NEW.full_name || ' a rejoint Off Market !', 'system');

    -- Notification de bienvenue
    INSERT INTO public.notifications (recipient_id, type, title, body)
    VALUES (NEW.id, 'system', 'Bienvenue sur Off Market !', 'Ton espace est pret. Explore la messagerie, les formations et le feed.');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger sur INSERT et UPDATE de role dans profiles
DROP TRIGGER IF EXISTS on_client_provisioning ON public.profiles;
CREATE TRIGGER on_client_provisioning
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION auto_provision_client();


-- ============================================
-- Notifications automatiques
-- ============================================

-- Ajouter 'feed' aux types de notification autorises
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
CHECK (type = ANY (ARRAY['new_message','mention','form_response','module_complete',
  'task_assigned','task_due','student_inactive','new_enrollment','ai_insight','system','feed']));

-- Notification quand un nouveau message est envoye
CREATE OR REPLACE FUNCTION notify_channel_members_on_message()
RETURNS TRIGGER AS $$
DECLARE
  channel_name TEXT;
  sender_name TEXT;
  member RECORD;
BEGIN
  -- Ne pas notifier pour les messages systeme
  IF NEW.content_type = 'system' THEN
    RETURN NEW;
  END IF;

  SELECT name INTO channel_name FROM public.channels WHERE id = NEW.channel_id;
  SELECT full_name INTO sender_name FROM public.profiles WHERE id = NEW.sender_id;

  FOR member IN
    SELECT profile_id FROM public.channel_members
    WHERE channel_id = NEW.channel_id AND profile_id != NEW.sender_id
  LOOP
    INSERT INTO public.notifications (recipient_id, type, title, body, data)
    VALUES (
      member.profile_id,
      'new_message',
      'Nouveau message',
      COALESCE(sender_name, 'Quelqu''un') || ' dans ' || COALESCE(channel_name, 'un canal'),
      jsonb_build_object('channel_id', NEW.channel_id, 'message_id', NEW.id)
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_notify ON public.messages;
CREATE TRIGGER on_message_notify
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION notify_channel_members_on_message();


-- Notification quand un nouveau post feed est cree
CREATE OR REPLACE FUNCTION notify_feed_post()
RETURNS TRIGGER AS $$
DECLARE
  author_name TEXT;
  member RECORD;
BEGIN
  SELECT full_name INTO author_name FROM public.profiles WHERE id = NEW.author_id;

  FOR member IN
    SELECT id FROM public.profiles WHERE id != NEW.author_id
  LOOP
    INSERT INTO public.notifications (recipient_id, type, title, body, data)
    VALUES (
      member.id,
      'feed',
      'Nouveau post',
      COALESCE(author_name, 'Quelqu''un') || ' a publie dans le feed',
      jsonb_build_object('post_id', NEW.id)
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_feed_post_notify ON public.feed_posts;
CREATE TRIGGER on_feed_post_notify
  AFTER INSERT ON public.feed_posts
  FOR EACH ROW EXECUTE FUNCTION notify_feed_post();
