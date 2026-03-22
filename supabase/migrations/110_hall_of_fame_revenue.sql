-- ============================================================
-- 110_hall_of_fame_revenue.sql
-- Enrichir la vue hall_of_fame_enriched avec le revenu mensuel
-- depuis student_details.current_revenue
-- ============================================================

CREATE OR REPLACE VIEW hall_of_fame_enriched AS
SELECT
  h.id,
  h.user_id                              AS profile_id,
  h.achievement,
  h.description,
  h.featured_at,
  h.created_at,
  -- Profil joint
  p.full_name,
  p.avatar_url,
  p.bio,
  -- XP et badges
  COALESCE(xp.total_xp, 0)::int         AS total_xp,
  COALESCE(b.badge_count, 0)::int        AS badge_count,
  -- Revenue depuis student_details
  COALESCE(sd.current_revenue, 0)::int   AS monthly_revenue,
  sd.niche
FROM hall_of_fame h
LEFT JOIN profiles p ON p.id = h.user_id
LEFT JOIN student_details sd ON sd.profile_id = h.user_id
LEFT JOIN LATERAL (
  SELECT SUM(xp_amount)::int AS total_xp
  FROM xp_transactions
  WHERE profile_id = h.user_id
) xp ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*)::int AS badge_count
  FROM user_badges
  WHERE profile_id = h.user_id
) b ON true
ORDER BY h.featured_at DESC;
