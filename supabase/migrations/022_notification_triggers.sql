-- ============================================
-- Migration 022: Triggers notifications + alertes coach
-- ============================================

-- Etendre les types de notification autorises
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check
CHECK (type = ANY (ARRAY[
  'new_message','mention','form_response','module_complete',
  'task_assigned','task_due','student_inactive','new_enrollment',
  'ai_insight','system','feed','report','checkin','goal','badge','call_reminder'
]));


-- ─── Notification: signalement de contenu ───────────────
CREATE OR REPLACE FUNCTION notify_report_created()
RETURNS TRIGGER AS $$
DECLARE
  reporter_name TEXT;
  staff RECORD;
BEGIN
  SELECT full_name INTO reporter_name FROM public.profiles WHERE id = NEW.reporter_id;

  -- Notifier tous les admins et coachs
  FOR staff IN
    SELECT id FROM public.profiles WHERE role IN ('admin', 'coach') AND id != NEW.reporter_id
  LOOP
    INSERT INTO public.notifications (recipient_id, type, title, body, data)
    VALUES (
      staff.id,
      'report',
      'Nouveau signalement',
      COALESCE(reporter_name, 'Un utilisateur') || ' a signale un contenu (' || NEW.reason || ')',
      jsonb_build_object('report_id', NEW.id, 'reason', NEW.reason)
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_report_notify ON public.feed_reports;
CREATE TRIGGER on_report_notify
  AFTER INSERT ON public.feed_reports
  FOR EACH ROW EXECUTE FUNCTION notify_report_created();


-- ─── Notification: check-in soumis (notifier le coach/admin) ───
CREATE OR REPLACE FUNCTION notify_checkin_submitted()
RETURNS TRIGGER AS $$
DECLARE
  client_name TEXT;
  staff RECORD;
BEGIN
  SELECT full_name INTO client_name FROM public.profiles WHERE id = NEW.client_id;

  FOR staff IN
    SELECT id FROM public.profiles WHERE role IN ('admin', 'coach')
  LOOP
    INSERT INTO public.notifications (recipient_id, type, title, body, data)
    VALUES (
      staff.id,
      'checkin',
      'Nouveau check-in',
      COALESCE(client_name, 'Un client') || ' a soumis son bilan hebdomadaire',
      jsonb_build_object('checkin_id', NEW.id, 'client_id', NEW.client_id, 'mood', NEW.mood)
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_checkin_notify ON public.weekly_checkins;
CREATE TRIGGER on_checkin_notify
  AFTER INSERT ON public.weekly_checkins
  FOR EACH ROW EXECUTE FUNCTION notify_checkin_submitted();


-- ─── Notification: objectif cree (notifier le client) ───
CREATE OR REPLACE FUNCTION notify_goal_created()
RETURNS TRIGGER AS $$
DECLARE
  setter_name TEXT;
BEGIN
  -- Ne notifier que si l'objectif est cree par quelqu'un d'autre (coach)
  IF NEW.set_by IS NOT NULL AND NEW.set_by != NEW.client_id THEN
    SELECT full_name INTO setter_name FROM public.profiles WHERE id = NEW.set_by;

    INSERT INTO public.notifications (recipient_id, type, title, body, data)
    VALUES (
      NEW.client_id,
      'goal',
      'Nouvel objectif',
      COALESCE(setter_name, 'Votre coach') || ' vous a defini un objectif : ' || NEW.title,
      jsonb_build_object('goal_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_goal_notify ON public.coaching_goals;
CREATE TRIGGER on_goal_notify
  AFTER INSERT ON public.coaching_goals
  FOR EACH ROW EXECUTE FUNCTION notify_goal_created();


-- ─── Notification: reponse a un formulaire (notifier l'admin) ───
CREATE OR REPLACE FUNCTION notify_form_response()
RETURNS TRIGGER AS $$
DECLARE
  form_title TEXT;
  respondent_name TEXT;
  staff RECORD;
BEGIN
  SELECT f.title INTO form_title FROM public.forms f WHERE f.id = NEW.form_id;
  SELECT full_name INTO respondent_name FROM public.profiles WHERE id = NEW.respondent_id;

  FOR staff IN
    SELECT id FROM public.profiles WHERE role IN ('admin', 'coach')
  LOOP
    INSERT INTO public.notifications (recipient_id, type, title, body, data)
    VALUES (
      staff.id,
      'form_response',
      'Reponse formulaire',
      COALESCE(respondent_name, 'Un utilisateur') || ' a repondu a "' || COALESCE(form_title, 'un formulaire') || '"',
      jsonb_build_object('response_id', NEW.id, 'form_id', NEW.form_id)
    );
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_form_response_notify ON public.form_responses;
CREATE TRIGGER on_form_response_notify
  AFTER INSERT ON public.form_responses
  FOR EACH ROW EXECUTE FUNCTION notify_form_response();


-- ─── Notification: badge obtenu (notifier le client) ───
CREATE OR REPLACE FUNCTION notify_badge_earned()
RETURNS TRIGGER AS $$
DECLARE
  badge_name TEXT;
  badge_desc TEXT;
BEGIN
  SELECT name, description INTO badge_name, badge_desc
  FROM public.badges WHERE id = NEW.badge_id;

  INSERT INTO public.notifications (recipient_id, type, title, body, data)
  VALUES (
    NEW.profile_id,
    'badge',
    'Badge debloque !',
    'Vous avez obtenu le badge "' || COALESCE(badge_name, '???') || '"',
    jsonb_build_object('badge_id', NEW.badge_id)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_badge_earned_notify ON public.profile_badges;
CREATE TRIGGER on_badge_earned_notify
  AFTER INSERT ON public.profile_badges
  FOR EACH ROW EXECUTE FUNCTION notify_badge_earned();


-- ============================================
-- Alertes coach automatiques
-- ============================================

-- Fonction callable pour generer les alertes
-- A appeler via un cron ou manuellement
CREATE OR REPLACE FUNCTION generate_coach_alerts()
RETURNS void AS $$
DECLARE
  client RECORD;
  last_checkin TIMESTAMPTZ;
  last_activity TIMESTAMPTZ;
  latest_mood INT;
BEGIN
  FOR client IN
    SELECT id, full_name FROM public.profiles WHERE role = 'client'
  LOOP
    -- Check: pas de check-in depuis 14 jours
    SELECT MAX(created_at) INTO last_checkin
    FROM public.weekly_checkins WHERE client_id = client.id;

    IF last_checkin IS NOT NULL AND last_checkin < NOW() - INTERVAL '14 days' THEN
      -- Eviter les doublons non resolus
      IF NOT EXISTS (
        SELECT 1 FROM public.coach_alerts
        WHERE client_id = client.id AND alert_type = 'no_checkin' AND is_resolved = false
      ) THEN
        INSERT INTO public.coach_alerts (client_id, alert_type, title, description, severity)
        VALUES (
          client.id,
          'no_checkin',
          'Pas de check-in depuis 14 jours',
          client.full_name || ' n''a pas soumis de bilan hebdomadaire depuis plus de 14 jours.',
          'high'
        );
      END IF;
    END IF;

    -- Check: mood bas (derniere humeur <= 2)
    SELECT mood INTO latest_mood
    FROM public.weekly_checkins
    WHERE client_id = client.id AND mood IS NOT NULL
    ORDER BY week_start DESC LIMIT 1;

    IF latest_mood IS NOT NULL AND latest_mood <= 2 THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.coach_alerts
        WHERE client_id = client.id AND alert_type = 'low_mood' AND is_resolved = false
      ) THEN
        INSERT INTO public.coach_alerts (client_id, alert_type, title, description, severity)
        VALUES (
          client.id,
          'low_mood',
          'Moral bas detecte',
          client.full_name || ' a signale un moral de ' || latest_mood || '/5 dans son dernier check-in.',
          CASE WHEN latest_mood = 1 THEN 'critical' ELSE 'high' END
        );
      END IF;
    END IF;

    -- Check: inactivite 7 jours (pas de lesson_progress, checkin, message, ou feed_post)
    SELECT GREATEST(
      COALESCE((SELECT MAX(created_at) FROM public.weekly_checkins WHERE client_id = client.id), '1970-01-01'),
      COALESCE((SELECT MAX(created_at) FROM public.messages WHERE sender_id = client.id), '1970-01-01'),
      COALESCE((SELECT MAX(created_at) FROM public.feed_posts WHERE author_id = client.id), '1970-01-01')
    ) INTO last_activity;

    IF last_activity < NOW() - INTERVAL '7 days' AND last_activity > '1970-01-01' THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.coach_alerts
        WHERE client_id = client.id AND alert_type = 'inactive_7d' AND is_resolved = false
      ) THEN
        INSERT INTO public.coach_alerts (client_id, alert_type, title, description, severity)
        VALUES (
          client.id,
          'inactive_7d',
          'Client inactif depuis 7 jours',
          client.full_name || ' n''a eu aucune activite depuis 7 jours.',
          'medium'
        );
      END IF;
    END IF;

    -- Upgrade vers 14j si deja inactif 7j et toujours inactif
    IF last_activity < NOW() - INTERVAL '14 days' AND last_activity > '1970-01-01' THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.coach_alerts
        WHERE client_id = client.id AND alert_type = 'inactive_14d' AND is_resolved = false
      ) THEN
        INSERT INTO public.coach_alerts (client_id, alert_type, title, description, severity)
        VALUES (
          client.id,
          'inactive_14d',
          'Client inactif depuis 14 jours',
          client.full_name || ' n''a eu aucune activite depuis 14 jours. Intervention recommandee.',
          'critical'
        );
      END IF;
    END IF;

    -- Check: paiement en retard
    IF EXISTS (
      SELECT 1 FROM public.invoices
      WHERE client_id = client.id AND status = 'overdue'
    ) THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.coach_alerts
        WHERE client_id = client.id AND alert_type = 'payment_overdue' AND is_resolved = false
      ) THEN
        INSERT INTO public.coach_alerts (client_id, alert_type, title, description, severity)
        VALUES (
          client.id,
          'payment_overdue',
          'Paiement en retard',
          client.full_name || ' a une ou plusieurs factures en retard.',
          'high'
        );
      END IF;
    END IF;

  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
