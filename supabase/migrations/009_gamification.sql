-- ═══════════════════════════════════════
-- OFF MARKET — GAMIFICATION
-- ═══════════════════════════════════════

-- ─── XP CONFIG ────────────────────────
CREATE TABLE public.xp_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL UNIQUE,
  xp_amount INTEGER NOT NULL DEFAULT 0,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── XP TRANSACTIONS ──────────────────
CREATE TABLE public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  xp_amount INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── LEVEL CONFIG ─────────────────────
CREATE TABLE public.level_config (
  level INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  min_xp INTEGER NOT NULL,
  icon TEXT,
  color TEXT
);

-- ─── BADGES ───────────────────────────
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  category TEXT NOT NULL CHECK (category IN ('learning', 'engagement', 'revenue', 'social', 'special')),
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary')),
  condition JSONB DEFAULT '{}',
  xp_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── USER BADGES ──────────────────────
CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id, badge_id)
);

-- ─── CHALLENGES ───────────────────────
CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL CHECK (challenge_type IN ('weekly', 'monthly', 'community')),
  condition JSONB DEFAULT '{}',
  xp_reward INTEGER DEFAULT 0,
  badge_reward UUID REFERENCES public.badges(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── CHALLENGE PARTICIPANTS ───────────
CREATE TABLE public.challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  progress NUMERIC(10,2) DEFAULT 0,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(challenge_id, profile_id)
);

-- ─── AWARD XP FUNCTION ────────────────
CREATE OR REPLACE FUNCTION award_xp(
  p_profile_id UUID,
  p_action TEXT,
  p_metadata JSONB DEFAULT '{}'
) RETURNS INTEGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_xp INTEGER;
BEGIN
  SELECT xp_amount INTO v_xp FROM xp_config WHERE action = p_action AND is_active = true;
  IF v_xp IS NULL THEN RETURN 0; END IF;

  INSERT INTO xp_transactions (profile_id, action, xp_amount, metadata)
  VALUES (p_profile_id, p_action, v_xp, p_metadata);

  RETURN v_xp;
END;
$$;

-- ─── LEADERBOARD VIEW ─────────────────
CREATE OR REPLACE VIEW public.leaderboard AS
SELECT
  p.id AS profile_id,
  p.full_name,
  p.avatar_url,
  COALESCE(SUM(xt.xp_amount), 0)::INTEGER AS total_xp,
  COUNT(DISTINCT ub.badge_id)::INTEGER AS badge_count,
  RANK() OVER (ORDER BY COALESCE(SUM(xt.xp_amount), 0) DESC)::INTEGER AS rank
FROM public.profiles p
LEFT JOIN public.xp_transactions xt ON xt.profile_id = p.id
LEFT JOIN public.user_badges ub ON ub.profile_id = p.id
WHERE p.role = 'client'
GROUP BY p.id, p.full_name, p.avatar_url;

-- ─── RLS POLICIES ─────────────────────
ALTER TABLE public.xp_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- XP config: staff manage, all read
CREATE POLICY "All can read xp_config" ON public.xp_config FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage xp_config" ON public.xp_config FOR ALL
  USING (get_my_role() IN ('admin', 'coach')) WITH CHECK (get_my_role() IN ('admin', 'coach'));

-- XP transactions: own read, staff read all
CREATE POLICY "Users can view own xp" ON public.xp_transactions FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Staff can view all xp" ON public.xp_transactions FOR SELECT USING (get_my_role() IN ('admin', 'coach'));
CREATE POLICY "System can insert xp" ON public.xp_transactions FOR INSERT WITH CHECK (true);

-- Level config: all read
CREATE POLICY "All can read level_config" ON public.level_config FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage level_config" ON public.level_config FOR ALL
  USING (get_my_role() IN ('admin', 'coach')) WITH CHECK (get_my_role() IN ('admin', 'coach'));

-- Badges: all read
CREATE POLICY "All can read badges" ON public.badges FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage badges" ON public.badges FOR ALL
  USING (get_my_role() IN ('admin', 'coach')) WITH CHECK (get_my_role() IN ('admin', 'coach'));

-- User badges: own read, staff read all
CREATE POLICY "Users can view own badges" ON public.user_badges FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Staff can view all user_badges" ON public.user_badges FOR SELECT USING (get_my_role() IN ('admin', 'coach'));
CREATE POLICY "System can insert user_badges" ON public.user_badges FOR INSERT WITH CHECK (true);

-- Challenges: all read, staff manage
CREATE POLICY "All can read challenges" ON public.challenges FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Staff can manage challenges" ON public.challenges FOR ALL
  USING (get_my_role() IN ('admin', 'coach')) WITH CHECK (get_my_role() IN ('admin', 'coach'));

-- Challenge participants: own manage, staff read all
CREATE POLICY "Users can view own participation" ON public.challenge_participants FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Users can join challenges" ON public.challenge_participants FOR INSERT WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Users can update own progress" ON public.challenge_participants FOR UPDATE
  USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
CREATE POLICY "Staff can view all participants" ON public.challenge_participants FOR SELECT USING (get_my_role() IN ('admin', 'coach'));
CREATE POLICY "Staff can manage participants" ON public.challenge_participants FOR ALL
  USING (get_my_role() IN ('admin', 'coach')) WITH CHECK (get_my_role() IN ('admin', 'coach'));

-- ─── INDEXES ──────────────────────────
CREATE INDEX idx_xp_transactions_profile_id ON public.xp_transactions(profile_id);
CREATE INDEX idx_xp_transactions_action ON public.xp_transactions(action);
CREATE INDEX idx_xp_transactions_created_at ON public.xp_transactions(created_at DESC);
CREATE INDEX idx_user_badges_profile_id ON public.user_badges(profile_id);
CREATE INDEX idx_user_badges_badge_id ON public.user_badges(badge_id);
CREATE INDEX idx_challenges_active ON public.challenges(is_active) WHERE is_active = true;
CREATE INDEX idx_challenges_dates ON public.challenges(starts_at, ends_at);
CREATE INDEX idx_challenge_participants_challenge_id ON public.challenge_participants(challenge_id);
CREATE INDEX idx_challenge_participants_profile_id ON public.challenge_participants(profile_id);

-- ─── SEED DATA: XP CONFIG ─────────────
INSERT INTO public.xp_config (action, xp_amount, description) VALUES
  ('complete_module', 50, 'Completer un module de formation'),
  ('weekly_checkin', 20, 'Remplir le check-in hebdomadaire'),
  ('post_victory', 15, 'Poster une victoire dans le feed'),
  ('help_member', 10, 'Aider un autre membre (repondre dans le feed)'),
  ('attend_group_call', 30, 'Assister a un call de groupe'),
  ('achieve_goal', 100, 'Atteindre un objectif de coaching'),
  ('complete_weekly_challenge', 75, 'Completer un defi hebdomadaire'),
  ('complete_monthly_challenge', 200, 'Completer un defi mensuel'),
  ('streak_7d', 50, 'Streak de 7 jours de connexion'),
  ('streak_30d', 200, 'Streak de 30 jours de connexion');

-- ─── SEED DATA: LEVELS ────────────────
INSERT INTO public.level_config (level, name, min_xp, icon, color) VALUES
  (1, 'Debutant', 0, '🌱', '#71717A'),
  (2, 'Freelance Active', 200, '⚡', '#3B82F6'),
  (3, 'Closer en Herbe', 500, '🔥', '#F59E0B'),
  (4, 'Machine a Cash', 1200, '💰', '#22C55E'),
  (5, 'Legende des 10K', 2500, '👑', '#AF0000');

-- ─── SEED DATA: BADGES ────────────────
INSERT INTO public.badges (name, description, icon, category, rarity, condition, xp_reward) VALUES
  -- Learning
  ('Offre Creee', 'A cree et valide son offre', '📦', 'learning', 'common', '{"type":"manual"}', 20),
  ('Premier Module', 'A complete son premier module', '📖', 'learning', 'common', '{"type":"modules_completed","count":1}', 20),
  ('Etudiant Assidu', 'A complete 5 modules', '🎓', 'learning', 'uncommon', '{"type":"modules_completed","count":5}', 50),
  ('Formation Complete', 'A termine tout le parcours', '🏅', 'learning', 'rare', '{"type":"modules_completed","count":999}', 100),

  -- Engagement
  ('7 Jours de Streak', 'Connecte 7 jours consecutifs', '🔥', 'engagement', 'common', '{"type":"streak","days":7}', 0),
  ('30 Jours de Streak', 'Connecte 30 jours consecutifs', '💎', 'engagement', 'rare', '{"type":"streak","days":30}', 0),
  ('Check-in Parfait', '4 check-ins sur 4 dans le mois', '✅', 'engagement', 'uncommon', '{"type":"monthly_checkins","count":4}', 30),
  ('Habitue du Feed', 'A poste 10 fois dans le feed', '💬', 'engagement', 'common', '{"type":"posts_count","count":10}', 20),

  -- Revenue
  ('Premier 1K', 'Premier mois a 1 000 EUR', '🥉', 'revenue', 'uncommon', '{"type":"monthly_revenue","amount":1000}', 50),
  ('Cap des 5K', 'Premier mois a 5 000 EUR', '🥈', 'revenue', 'rare', '{"type":"monthly_revenue","amount":5000}', 100),
  ('10K Mois', 'Objectif ultime atteint', '🥇', 'revenue', 'epic', '{"type":"monthly_revenue","amount":10000}', 200),
  ('10K Recurrent', '2 mois consecutifs a 10K+', '🏆', 'revenue', 'legendary', '{"type":"recurring_revenue","amount":10000,"months":2}', 500),

  -- Social
  ('Premier Prospect', 'Premier prospect entre dans le pipeline', '🎯', 'social', 'common', '{"type":"manual"}', 10),
  ('Mentor', 'A aide 10 membres dans le feed', '🤝', 'social', 'rare', '{"type":"comments_count","count":10}', 75),
  ('Post du Mois', 'Post le plus like du mois', '⭐', 'social', 'epic', '{"type":"manual"}', 100);
