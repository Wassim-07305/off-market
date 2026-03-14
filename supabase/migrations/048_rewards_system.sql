-- ═══════════════════════════════════════
-- OFF MARKET — REWARDS & REDEMPTION SYSTEM
-- ═══════════════════════════════════════

-- ─── REWARDS CATALOG ─────────────────
CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cost_xp INTEGER NOT NULL CHECK (cost_xp > 0),
  type TEXT NOT NULL CHECK (type IN ('session_bonus', 'resource_unlock', 'badge_exclusive', 'custom')),
  stock INTEGER, -- NULL = unlimited
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── REWARD REDEMPTIONS ──────────────
CREATE TABLE public.reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE CASCADE,
  xp_spent INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'cancelled')),
  redeemed_at TIMESTAMPTZ DEFAULT now(),
  fulfilled_at TIMESTAMPTZ,
  fulfilled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- ─── LEADERBOARD ANONYMITY ──────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS leaderboard_anonymous BOOLEAN DEFAULT false;

-- ─── REDEEM REWARD FUNCTION ─────────
CREATE OR REPLACE FUNCTION redeem_reward(
  p_user_id UUID,
  p_reward_id UUID
) RETURNS UUID
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_cost INTEGER;
  v_stock INTEGER;
  v_balance INTEGER;
  v_redemption_id UUID;
BEGIN
  -- Get reward info
  SELECT cost_xp, stock INTO v_cost, v_stock
  FROM rewards
  WHERE id = p_reward_id AND is_active = true;

  IF v_cost IS NULL THEN
    RAISE EXCEPTION 'Recompense introuvable ou inactive';
  END IF;

  -- Check stock
  IF v_stock IS NOT NULL THEN
    -- Count existing non-cancelled redemptions
    DECLARE v_redeemed INTEGER;
    BEGIN
      SELECT COUNT(*) INTO v_redeemed
      FROM reward_redemptions
      WHERE reward_id = p_reward_id AND status != 'cancelled';

      IF v_redeemed >= v_stock THEN
        RAISE EXCEPTION 'Rupture de stock';
      END IF;
    END;
  END IF;

  -- Calculate XP balance
  SELECT COALESCE(SUM(xp_amount), 0) INTO v_balance
  FROM xp_transactions
  WHERE profile_id = p_user_id;

  -- Subtract already-spent XP from previous redemptions
  v_balance := v_balance - COALESCE((
    SELECT SUM(xp_spent) FROM reward_redemptions
    WHERE user_id = p_user_id AND status != 'cancelled'
  ), 0);

  IF v_balance < v_cost THEN
    RAISE EXCEPTION 'XP insuffisant (solde: %, cout: %)', v_balance, v_cost;
  END IF;

  -- Create redemption
  INSERT INTO reward_redemptions (user_id, reward_id, xp_spent, status)
  VALUES (p_user_id, p_reward_id, v_cost, 'pending')
  RETURNING id INTO v_redemption_id;

  RETURN v_redemption_id;
END;
$$;

-- ─── RLS POLICIES ────────────────────
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Rewards: all authenticated can see active rewards
CREATE POLICY "All can view active rewards" ON public.rewards
  FOR SELECT USING (auth.uid() IS NOT NULL AND is_active = true);

-- Staff can see all rewards (including inactive)
CREATE POLICY "Staff can view all rewards" ON public.rewards
  FOR SELECT USING (get_my_role() IN ('admin', 'coach'));

-- Staff can manage rewards
CREATE POLICY "Staff can manage rewards" ON public.rewards
  FOR ALL USING (get_my_role() IN ('admin', 'coach'))
  WITH CHECK (get_my_role() IN ('admin', 'coach'));

-- Redemptions: users see their own
CREATE POLICY "Users can view own redemptions" ON public.reward_redemptions
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own redemptions (via RPC, but policy needed)
CREATE POLICY "Users can insert own redemptions" ON public.reward_redemptions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Staff can view all redemptions
CREATE POLICY "Staff can view all redemptions" ON public.reward_redemptions
  FOR SELECT USING (get_my_role() IN ('admin', 'coach'));

-- Staff can update redemptions (fulfill/cancel)
CREATE POLICY "Staff can update redemptions" ON public.reward_redemptions
  FOR UPDATE USING (get_my_role() IN ('admin', 'coach'))
  WITH CHECK (get_my_role() IN ('admin', 'coach'));

-- ─── INDEXES ─────────────────────────
CREATE INDEX idx_rewards_active ON public.rewards(is_active) WHERE is_active = true;
CREATE INDEX idx_rewards_type ON public.rewards(type);
CREATE INDEX idx_reward_redemptions_user_id ON public.reward_redemptions(user_id);
CREATE INDEX idx_reward_redemptions_reward_id ON public.reward_redemptions(reward_id);
CREATE INDEX idx_reward_redemptions_status ON public.reward_redemptions(status);
CREATE INDEX idx_profiles_leaderboard_anonymous ON public.profiles(leaderboard_anonymous);

-- ─── SEED DATA ───────────────────────
INSERT INTO public.rewards (title, description, cost_xp, type, stock) VALUES
  ('Session bonus 1-on-1', 'Une session de coaching individuel supplementaire de 30 minutes', 500, 'session_bonus', 10),
  ('Acces ressources premium', 'Debloquer le pack de templates et ressources exclusives', 300, 'resource_unlock', NULL),
  ('Badge exclusif "Elite"', 'Un badge dore exclusif visible sur ton profil', 1000, 'badge_exclusive', 5),
  ('Review offre personnalisee', 'Un retour detaille sur ton offre par l''equipe', 400, 'custom', NULL),
  ('Audit Instagram', 'Analyse complete de ton profil Instagram par un expert', 750, 'custom', 3);
