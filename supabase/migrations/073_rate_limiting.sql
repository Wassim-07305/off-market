-- ============================================================
-- 073: Rate limiting for enrichment & API actions
-- ============================================================

-- Table to track rate limit windows per user/action
CREATE TABLE IF NOT EXISTS api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  count INT NOT NULL DEFAULT 0,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint: one row per user/action/window
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_user_action_window
  ON api_rate_limits (user_id, action_type, window_start);

-- Index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start
  ON api_rate_limits (window_start);

-- ─── RLS ──────────────────────────────────────────────────
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Users can read their own limits
CREATE POLICY "Users can view own rate limits"
  ON api_rate_limits FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all limits
CREATE POLICY "Admins can view all rate limits"
  ON api_rate_limits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_roles.user_id = auth.uid()
        AND user_roles.role = 'admin'
    )
  );

-- Service role handles inserts/updates (via RPC)
-- No direct insert/update policies for regular users

-- ─── Default limits config table ──────────────────────────
CREATE TABLE IF NOT EXISTS rate_limit_config (
  action_type TEXT PRIMARY KEY,
  max_count INT NOT NULL,
  window_interval INTERVAL NOT NULL,
  description TEXT
);

INSERT INTO rate_limit_config (action_type, max_count, window_interval, description)
VALUES
  ('linkedin_enrich', 30, '1 hour', 'Enrichissement LinkedIn par heure'),
  ('instagram_enrich', 50, '1 hour', 'Enrichissement Instagram par heure'),
  ('bulk_enrich', 100, '1 day', 'Enrichissement en masse par jour'),
  ('ai_query', 60, '1 hour', 'Requetes IA par heure')
ON CONFLICT (action_type) DO NOTHING;

ALTER TABLE rate_limit_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read rate limit config"
  ON rate_limit_config FOR SELECT
  USING (true);

-- ─── RPC: check_rate_limit ────────────────────────────────
-- Returns true if allowed (and increments), false if rate limited
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_user_id UUID,
  p_action TEXT,
  p_max_count INT,
  p_window_interval INTERVAL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_current_count INT;
  v_allowed BOOLEAN;
BEGIN
  -- Calculate window start (truncate to interval boundary)
  -- For hour windows: truncate to current hour
  -- For day windows: truncate to current day
  IF p_window_interval >= '1 day'::interval THEN
    v_window_start := date_trunc('day', now());
  ELSE
    v_window_start := date_trunc('hour', now());
  END IF;

  -- Upsert: get or create the rate limit row
  INSERT INTO api_rate_limits (user_id, action_type, count, window_start)
  VALUES (p_user_id, p_action, 0, v_window_start)
  ON CONFLICT (user_id, action_type, window_start) DO NOTHING;

  -- Get current count
  SELECT count INTO v_current_count
  FROM api_rate_limits
  WHERE user_id = p_user_id
    AND action_type = p_action
    AND window_start = v_window_start;

  -- Check if allowed
  v_allowed := v_current_count < p_max_count;

  -- Increment if allowed
  IF v_allowed THEN
    UPDATE api_rate_limits
    SET count = count + 1
    WHERE user_id = p_user_id
      AND action_type = p_action
      AND window_start = v_window_start;

    v_current_count := v_current_count + 1;
  END IF;

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'current_count', v_current_count,
    'max_count', p_max_count,
    'remaining', GREATEST(0, p_max_count - v_current_count),
    'window_start', v_window_start,
    'reset_at', v_window_start + p_window_interval
  );
END;
$$;

-- ─── RPC: get_rate_limit_status ───────────────────────────
-- Returns current status without incrementing
CREATE OR REPLACE FUNCTION get_rate_limit_status(
  p_user_id UUID,
  p_action TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_config RECORD;
  v_window_start TIMESTAMPTZ;
  v_current_count INT DEFAULT 0;
BEGIN
  -- Get config for this action
  SELECT * INTO v_config
  FROM rate_limit_config
  WHERE action_type = p_action;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'current_count', 0,
      'max_count', 999,
      'remaining', 999,
      'reset_at', now() + '1 hour'::interval,
      'is_limited', false
    );
  END IF;

  -- Calculate window start
  IF v_config.window_interval >= '1 day'::interval THEN
    v_window_start := date_trunc('day', now());
  ELSE
    v_window_start := date_trunc('hour', now());
  END IF;

  -- Get current count (may not exist yet)
  SELECT count INTO v_current_count
  FROM api_rate_limits
  WHERE user_id = p_user_id
    AND action_type = p_action
    AND window_start = v_window_start;

  IF v_current_count IS NULL THEN
    v_current_count := 0;
  END IF;

  RETURN jsonb_build_object(
    'current_count', v_current_count,
    'max_count', v_config.max_count,
    'remaining', GREATEST(0, v_config.max_count - v_current_count),
    'reset_at', v_window_start + v_config.window_interval,
    'is_limited', v_current_count >= v_config.max_count
  );
END;
$$;

-- ─── Cleanup: remove old rate limit rows (> 7 days) ──────
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM api_rate_limits
  WHERE window_start < now() - INTERVAL '7 days';
END;
$$;
