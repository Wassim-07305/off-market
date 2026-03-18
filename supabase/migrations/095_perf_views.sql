-- ============================================================
-- 095_perf_views.sql
-- Vues de performance : remplacer les agrégations client-side
-- par des vues PostgreSQL
-- ============================================================

-- ────────────────────────────────────────────
-- 1. member_stats — profils + XP + badges + niveau
--    Remplace 3 requêtes séparées dans use-members.ts
-- ────────────────────────────────────────────
CREATE OR REPLACE VIEW member_stats AS
SELECT
  p.id,
  p.full_name,
  p.avatar_url,
  p.role,
  p.bio,
  p.created_at,
  COALESCE(xp.total_xp, 0)::int        AS total_xp,
  COALESCE(b.badge_count, 0)::int       AS badge_count,
  COALESCE(lc.level, 1)                 AS level,
  COALESCE(lc.name, 'Debutant')         AS level_name,
  COALESCE(lc.icon, '🌱')               AS level_icon
FROM profiles p
LEFT JOIN LATERAL (
  SELECT SUM(xp_amount)::int AS total_xp
  FROM xp_transactions
  WHERE profile_id = p.id
) xp ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*)::int AS badge_count
  FROM user_badges
  WHERE profile_id = p.id
) b ON true
LEFT JOIN LATERAL (
  SELECT lc2.level, lc2.name, lc2.icon
  FROM level_config lc2
  WHERE lc2.min_xp <= COALESCE(xp.total_xp, 0)
  ORDER BY lc2.min_xp DESC
  LIMIT 1
) lc ON true
ORDER BY p.full_name;

-- ────────────────────────────────────────────
-- 2. hall_of_fame_enriched — hall_of_fame + profil + XP + badges
--    Remplace 3 requêtes séparées dans use-hall-of-fame.ts
-- ────────────────────────────────────────────
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
  COALESCE(b.badge_count, 0)::int        AS badge_count
FROM hall_of_fame h
LEFT JOIN profiles p ON p.id = h.user_id
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

-- ────────────────────────────────────────────
-- 3. dashboard_kpis — stats globales dashboard
--    Remplace les 6 requêtes parallèles dans use-dashboard-stats.ts
-- ────────────────────────────────────────────
CREATE OR REPLACE VIEW dashboard_kpis AS
SELECT
  -- Clients
  (SELECT COUNT(*) FROM profiles WHERE role = 'client')::int
    AS total_clients,
  (SELECT COUNT(*) FROM profiles
   WHERE role = 'client'
     AND created_at <= (date_trunc('month', CURRENT_DATE) - interval '1 day'))::int
    AS last_month_clients,
  -- Revenue ce mois (paid invoices)
  (SELECT COALESCE(SUM(total), 0) FROM invoices
   WHERE status = 'paid'
     AND created_at >= date_trunc('month', CURRENT_DATE))::numeric
    AS revenue_this_month,
  -- Revenue mois dernier
  (SELECT COALESCE(SUM(total), 0) FROM invoices
   WHERE status = 'paid'
     AND created_at >= date_trunc('month', CURRENT_DATE) - interval '1 month'
     AND created_at < date_trunc('month', CURRENT_DATE))::numeric
    AS revenue_last_month,
  -- Cours actifs
  (SELECT COUNT(*) FROM courses WHERE status = 'published')::int
    AS active_courses,
  -- Check-ins cette semaine (lundi = début de semaine)
  (SELECT COUNT(*) FROM weekly_checkins
   WHERE week_start >= date_trunc('week', CURRENT_DATE))::int
    AS weekly_checkins;

-- ────────────────────────────────────────────
-- 4. revenue_by_month — factures payées par mois (6 derniers mois)
--    Remplace l'agrégation client-side dans useRevenueChart / useRevenueStats
-- ────────────────────────────────────────────
CREATE OR REPLACE VIEW revenue_by_month AS
SELECT
  to_char(paid_at, 'YYYY-MM') AS month,
  to_char(paid_at, 'Mon')     AS label,
  SUM(total)::numeric          AS revenue
FROM invoices
WHERE status = 'paid'
  AND paid_at IS NOT NULL
  AND paid_at >= date_trunc('month', CURRENT_DATE) - interval '5 months'
GROUP BY 1, 2
ORDER BY 1;

-- ────────────────────────────────────────────
-- 5. revenue_by_quarter — factures payées par trimestre
-- ────────────────────────────────────────────
CREATE OR REPLACE VIEW revenue_by_quarter AS
SELECT
  'T' || EXTRACT(QUARTER FROM paid_at)::int || ' ' || EXTRACT(YEAR FROM paid_at)::int AS quarter,
  SUM(total)::numeric AS revenue
FROM invoices
WHERE status = 'paid'
  AND paid_at IS NOT NULL
GROUP BY 1
ORDER BY MIN(paid_at) DESC
LIMIT 4;

-- ────────────────────────────────────────────
-- 6. student_stats_summary — stats étudiants pour admin dashboard
--    Remplace les 4 requêtes de useStudentStats
-- ────────────────────────────────────────────
CREATE OR REPLACE VIEW student_stats_summary AS
SELECT
  (SELECT COUNT(*) FROM profiles WHERE role = 'client')::int
    AS total_students,
  (SELECT COUNT(*) FROM profiles
   WHERE role = 'client'
     AND created_at >= date_trunc('month', CURRENT_DATE))::int
    AS new_students_this_month,
  (SELECT COUNT(*) FROM student_details WHERE tag = 'churned')::int
    AS churned_students,
  (SELECT COUNT(*) FROM student_details
   WHERE flag IN ('yellow', 'orange', 'red'))::int
    AS at_risk_students,
  (SELECT COALESCE(
    ROUND(AVG(lifetime_value::numeric)),
    0
  ) FROM student_details WHERE lifetime_value IS NOT NULL AND lifetime_value::numeric > 0)::int
    AS average_ltv;

-- ────────────────────────────────────────────
-- 7. revenue_by_channel — revenus par source d'acquisition
-- ────────────────────────────────────────────
CREATE OR REPLACE VIEW revenue_by_channel AS
SELECT
  COALESCE(acquisition_source, 'autre') AS channel,
  SUM(lifetime_value::numeric)::numeric AS revenue
FROM student_details
WHERE lifetime_value IS NOT NULL
GROUP BY 1
ORDER BY 2 DESC
LIMIT 6;

-- ────────────────────────────────────────────
-- 8. sales_pipeline_summary — contacts CRM par stage
--    Remplace useSalesStats
-- ────────────────────────────────────────────
CREATE OR REPLACE VIEW sales_pipeline_summary AS
SELECT
  COALESCE(stage, 'prospect') AS stage,
  COUNT(*)::int                AS count
FROM crm_contacts
GROUP BY 1;

-- ────────────────────────────────────────────
-- 9. engagement_stats — lesson progress + checkins
--    Remplace useEngagementStats
-- ────────────────────────────────────────────
CREATE OR REPLACE VIEW engagement_stats AS
SELECT
  (SELECT COUNT(*) FROM lesson_progress)::int AS total_completions,
  (SELECT COUNT(*) FROM lessons)::int         AS total_lessons,
  (SELECT COUNT(*) FROM profiles WHERE role = 'client')::int AS total_students,
  (SELECT COUNT(*) FROM weekly_checkins
   WHERE week_start >= date_trunc('week', CURRENT_DATE))::int AS weekly_checkins;

-- ────────────────────────────────────────────
-- 10. coach_leaderboard — coaches avec nombre d'étudiants
--    Remplace useCoachLeaderboard
-- ────────────────────────────────────────────
CREATE OR REPLACE VIEW coach_leaderboard AS
SELECT
  p.id,
  p.full_name    AS name,
  p.avatar_url   AS avatar,
  COALESCE(ca.student_count, 0)::int AS students,
  COALESCE(sd.avg_health, 0)::int    AS avg_health
FROM profiles p
LEFT JOIN LATERAL (
  SELECT COUNT(*)::int AS student_count
  FROM coach_assignments
  WHERE coach_id = p.id
) ca ON true
LEFT JOIN LATERAL (
  SELECT ROUND(AVG(health_score))::int AS avg_health
  FROM student_details
  WHERE assigned_coach = p.id
    AND health_score IS NOT NULL
) sd ON true
WHERE p.role = 'coach';

-- ────────────────────────────────────────────
-- Recharger le schema PostgREST
-- ────────────────────────────────────────────
NOTIFY pgrst, 'reload schema';
