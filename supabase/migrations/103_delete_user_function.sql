-- ═══════════════════════════════════════════════════════════════
-- 103 — Server-side user deletion function
-- Cleans up all FK references before deleting from auth.users
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.delete_user_account(target_user_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Clean up tables that reference profiles(id) without CASCADE
  DELETE FROM channel_members WHERE profile_id = target_user_id;
  DELETE FROM messages WHERE sender_id = target_user_id;
  DELETE FROM ai_messages WHERE conversation_id IN (
    SELECT id FROM ai_conversations WHERE user_id = target_user_id
  );
  DELETE FROM ai_conversations WHERE user_id = target_user_id;
  DELETE FROM notifications WHERE recipient_id = target_user_id;
  DELETE FROM journal_entries WHERE user_id = target_user_id;
  DELETE FROM gamification_entries WHERE profile_id = target_user_id;
  DELETE FROM form_submissions WHERE user_id = target_user_id;
  DELETE FROM lesson_progress WHERE user_id = target_user_id;
  DELETE FROM user_invites WHERE email = (SELECT email FROM profiles WHERE id = target_user_id);

  -- Tables with various column names
  BEGIN DELETE FROM onboarding_progress WHERE user_id = target_user_id; EXCEPTION WHEN others THEN NULL; END;
  BEGIN DELETE FROM coaching_sessions WHERE client_id = target_user_id; EXCEPTION WHEN others THEN NULL; END;
  BEGIN DELETE FROM coaching_sessions WHERE coach_id = target_user_id; EXCEPTION WHEN others THEN NULL; END;
  BEGIN DELETE FROM coach_assignments WHERE client_id = target_user_id; EXCEPTION WHEN others THEN NULL; END;
  BEGIN DELETE FROM coach_assignments WHERE coach_id = target_user_id; EXCEPTION WHEN others THEN NULL; END;
  BEGIN DELETE FROM client_ai_memory WHERE client_id = target_user_id; EXCEPTION WHEN others THEN NULL; END;
  BEGIN DELETE FROM contracts WHERE client_id = target_user_id; EXCEPTION WHEN others THEN NULL; END;
  BEGIN DELETE FROM certificates WHERE student_id = target_user_id; EXCEPTION WHEN others THEN NULL; END;
  BEGIN DELETE FROM crm_contacts WHERE assigned_to = target_user_id; EXCEPTION WHEN others THEN NULL; END;
  BEGIN DELETE FROM crm_contacts WHERE created_by = target_user_id; EXCEPTION WHEN others THEN NULL; END;
  BEGIN DELETE FROM call_calendar WHERE client_id = target_user_id; EXCEPTION WHEN others THEN NULL; END;
  BEGIN DELETE FROM call_calendar WHERE assigned_to = target_user_id; EXCEPTION WHEN others THEN NULL; END;
  BEGIN DELETE FROM commissions WHERE contractor_id = target_user_id; EXCEPTION WHEN others THEN NULL; END;
  BEGIN DELETE FROM resources WHERE uploaded_by = target_user_id; EXCEPTION WHEN others THEN NULL; END;
  BEGIN DELETE FROM feed_posts WHERE author_id = target_user_id; EXCEPTION WHEN others THEN NULL; END;
  BEGIN DELETE FROM announcements WHERE author_id = target_user_id; EXCEPTION WHEN others THEN NULL; END;
  BEGIN DELETE FROM quiz_submissions WHERE profile_id = target_user_id; EXCEPTION WHEN others THEN NULL; END;
  BEGIN DELETE FROM student_details WHERE profile_id = target_user_id; EXCEPTION WHEN others THEN NULL; END;
  BEGIN UPDATE channels SET created_by = NULL WHERE created_by = target_user_id; EXCEPTION WHEN others THEN NULL; END;
  BEGIN UPDATE leads SET assigned_to = NULL WHERE assigned_to = target_user_id; EXCEPTION WHEN others THEN NULL; END;

  -- Delete the profile itself
  DELETE FROM profiles WHERE id = target_user_id;

  -- Delete from auth.users
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;
