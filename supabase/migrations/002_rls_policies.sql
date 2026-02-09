-- ============================================
-- RLS Policies - Toutes les tables
-- ============================================

-- PROFILES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "profiles_update_admin" ON profiles FOR UPDATE USING (has_role('admin'));
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (true);

-- USER_ROLES
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_select" ON user_roles FOR SELECT USING (true);
CREATE POLICY "user_roles_admin" ON user_roles FOR ALL USING (has_role('admin'));
CREATE POLICY "user_roles_own" ON user_roles FOR SELECT USING (user_id = auth.uid());

-- CLIENTS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clients_admin_manager" ON clients FOR ALL USING (has_role('admin') OR has_role('manager'));
CREATE POLICY "clients_assigned" ON clients FOR SELECT USING (is_assigned_to_client(id));
CREATE POLICY "clients_coach" ON clients FOR SELECT USING (has_role('coach'));

-- CLIENT_ASSIGNMENTS
ALTER TABLE client_assignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "assignments_admin_manager" ON client_assignments FOR ALL USING (has_role('admin') OR has_role('manager'));
CREATE POLICY "assignments_own" ON client_assignments FOR SELECT USING (user_id = auth.uid());

-- LEADS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "leads_admin_manager" ON leads FOR ALL USING (has_role('admin') OR has_role('manager'));
CREATE POLICY "leads_own" ON leads FOR ALL USING (auth.uid() = assigned_to);
CREATE POLICY "leads_coach" ON leads FOR SELECT USING (has_role('coach') AND is_coached_by(assigned_to));

-- CALL_CALENDAR
ALTER TABLE call_calendar ENABLE ROW LEVEL SECURITY;
CREATE POLICY "calls_admin_manager" ON call_calendar FOR ALL USING (has_role('admin') OR has_role('manager'));
CREATE POLICY "calls_own" ON call_calendar FOR ALL USING (auth.uid() = assigned_to);
CREATE POLICY "calls_coach" ON call_calendar FOR SELECT USING (has_role('coach') AND is_coached_by(assigned_to));

-- CLOSER_CALLS
ALTER TABLE closer_calls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "closer_admin_manager" ON closer_calls FOR ALL USING (has_role('admin') OR has_role('manager'));
CREATE POLICY "closer_own" ON closer_calls FOR ALL USING (auth.uid() = closer_id);

-- FINANCIAL_ENTRIES
ALTER TABLE financial_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "finance_admin_manager" ON financial_entries FOR ALL USING (has_role('admin') OR has_role('manager'));

-- PAYMENT_SCHEDULES
ALTER TABLE payment_schedules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "payments_admin_manager" ON payment_schedules FOR ALL USING (has_role('admin') OR has_role('manager'));

-- SOCIAL_CONTENT
ALTER TABLE social_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "social_admin_manager" ON social_content FOR ALL USING (has_role('admin') OR has_role('manager'));
CREATE POLICY "social_coach" ON social_content FOR ALL USING (has_role('coach'));
CREATE POLICY "social_assigned" ON social_content FOR SELECT USING (is_assigned_to_client(client_id));

-- SETTER_ACTIVITIES
ALTER TABLE setter_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "setter_admin_manager" ON setter_activities FOR ALL USING (has_role('admin') OR has_role('manager'));
CREATE POLICY "setter_own" ON setter_activities FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "setter_coach" ON setter_activities FOR SELECT USING (has_role('coach') AND is_coached_by(user_id));

-- INTERVIEWS
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "interviews_admin" ON interviews FOR ALL USING (has_role('admin'));
CREATE POLICY "interviews_coach" ON interviews FOR ALL USING (auth.uid() = coach_id);
CREATE POLICY "interviews_member" ON interviews FOR SELECT USING (auth.uid() = member_id);

-- BLOCKAGES
ALTER TABLE blockages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blockages_admin" ON blockages FOR ALL USING (has_role('admin'));
CREATE POLICY "blockages_coach" ON blockages FOR ALL USING (
  EXISTS (SELECT 1 FROM interviews WHERE interviews.id = blockages.interview_id AND interviews.coach_id = auth.uid())
);
CREATE POLICY "blockages_member" ON blockages FOR SELECT USING (auth.uid() = member_id);

-- INSTAGRAM_ACCOUNTS
ALTER TABLE instagram_accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ig_accounts_admin_manager" ON instagram_accounts FOR ALL USING (has_role('admin') OR has_role('manager'));
CREATE POLICY "ig_accounts_coach" ON instagram_accounts FOR SELECT USING (has_role('coach'));
CREATE POLICY "ig_accounts_assigned" ON instagram_accounts FOR SELECT USING (is_assigned_to_client(client_id));

-- INSTAGRAM_POST_STATS
ALTER TABLE instagram_post_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ig_stats_admin_manager" ON instagram_post_stats FOR ALL USING (has_role('admin') OR has_role('manager'));
CREATE POLICY "ig_stats_coach" ON instagram_post_stats FOR SELECT USING (has_role('coach'));

-- NOTIFICATIONS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_own" ON notifications FOR ALL USING (auth.uid() = user_id);

-- RITUALS
ALTER TABLE rituals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rituals_admin_manager" ON rituals FOR ALL USING (has_role('admin') OR has_role('manager'));
CREATE POLICY "rituals_assigned" ON rituals FOR SELECT USING (is_assigned_to_client(client_id));
