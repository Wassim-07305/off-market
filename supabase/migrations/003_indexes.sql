-- ============================================
-- Indexes pour performance RLS et requêtes
-- ============================================

CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role ON user_roles(role);

CREATE INDEX idx_profiles_coach_id ON profiles(coach_id);

CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_created_by ON clients(created_by);

CREATE INDEX idx_client_assignments_client_id ON client_assignments(client_id);
CREATE INDEX idx_client_assignments_user_id ON client_assignments(user_id);

CREATE INDEX idx_leads_client_id ON leads(client_id);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_client_status ON leads(client_status);

CREATE INDEX idx_call_calendar_client_id ON call_calendar(client_id);
CREATE INDEX idx_call_calendar_assigned_to ON call_calendar(assigned_to);
CREATE INDEX idx_call_calendar_date ON call_calendar(date);

CREATE INDEX idx_closer_calls_client_id ON closer_calls(client_id);
CREATE INDEX idx_closer_calls_closer_id ON closer_calls(closer_id);
CREATE INDEX idx_closer_calls_date ON closer_calls(date);
CREATE INDEX idx_closer_calls_status ON closer_calls(status);

CREATE INDEX idx_financial_entries_client_id ON financial_entries(client_id);
CREATE INDEX idx_financial_entries_type ON financial_entries(type);
CREATE INDEX idx_financial_entries_date ON financial_entries(date);

CREATE INDEX idx_payment_schedules_client_id ON payment_schedules(client_id);
CREATE INDEX idx_payment_schedules_due_date ON payment_schedules(due_date);

CREATE INDEX idx_social_content_client_id ON social_content(client_id);
CREATE INDEX idx_social_content_status ON social_content(status);
CREATE INDEX idx_social_content_sort_order ON social_content(sort_order);

CREATE INDEX idx_setter_activities_user_id ON setter_activities(user_id);
CREATE INDEX idx_setter_activities_client_id ON setter_activities(client_id);
CREATE INDEX idx_setter_activities_date ON setter_activities(date);

CREATE INDEX idx_interviews_coach_id ON interviews(coach_id);
CREATE INDEX idx_interviews_member_id ON interviews(member_id);
CREATE INDEX idx_interviews_date ON interviews(date);

CREATE INDEX idx_blockages_interview_id ON blockages(interview_id);
CREATE INDEX idx_blockages_member_id ON blockages(member_id);

CREATE INDEX idx_ig_accounts_client_id ON instagram_accounts(client_id);
CREATE INDEX idx_ig_post_stats_account_id ON instagram_post_stats(account_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
