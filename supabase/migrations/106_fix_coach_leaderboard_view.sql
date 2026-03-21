-- ═══════════════════════════════════════════════════════════════
-- 106 — Coach leaderboard with composite scoring
-- Score = students(20%) + health(25%) + retention(25%) + sessions(15%) - atRisk(15%)
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE VIEW coach_leaderboard AS
SELECT
  p.id,
  p.full_name    AS name,
  p.avatar_url   AS avatar,
  COALESCE(ca.student_count, 0)::int AS students,
  COALESCE(sd.avg_health, 0)::int    AS avg_health,
  COALESCE(ca.student_count, 0)::int - COALESCE(risk.at_risk_count, 0)::int AS retained,
  COALESCE(sess.session_count, 0)::int AS sessions_month,
  COALESCE(risk.at_risk_count, 0)::int AS at_risk,
  -- Composite score (0-100)
  ROUND(
    -- 20% students (cap at 20 = max score)
    (LEAST(COALESCE(ca.student_count, 0), 20)::numeric / 20 * 20)
    -- 25% avg health
    + (COALESCE(sd.avg_health, 0)::numeric / 100 * 25)
    -- 25% retention (students - at_risk) / students
    + (CASE WHEN COALESCE(ca.student_count, 0) > 0
        THEN ((COALESCE(ca.student_count, 0) - COALESCE(risk.at_risk_count, 0))::numeric
              / COALESCE(ca.student_count, 0) * 25)
        ELSE 25 END)
    -- 15% sessions this month (cap at 10 = max score)
    + (LEAST(COALESCE(sess.session_count, 0), 10)::numeric / 10 * 15)
    -- 15% penalty for at-risk ratio
    + (CASE WHEN COALESCE(ca.student_count, 0) > 0
        THEN ((1 - COALESCE(risk.at_risk_count, 0)::numeric
              / COALESCE(ca.student_count, 0)) * 15)
        ELSE 15 END)
  )::int AS score
FROM profiles p
LEFT JOIN LATERAL (
  SELECT COUNT(*)::int AS student_count
  FROM coach_assignments
  WHERE coach_id = p.id AND status = 'active'
) ca ON true
LEFT JOIN LATERAL (
  SELECT ROUND(AVG(health_score))::int AS avg_health
  FROM student_details sd2
  JOIN coach_assignments ca2 ON ca2.client_id = sd2.profile_id
  WHERE ca2.coach_id = p.id AND ca2.status = 'active'
    AND sd2.health_score IS NOT NULL
) sd ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*)::int AS at_risk_count
  FROM student_details sd3
  JOIN coach_assignments ca3 ON ca3.client_id = sd3.profile_id
  WHERE ca3.coach_id = p.id AND ca3.status = 'active'
    AND (sd3.tag = 'at_risk' OR sd3.flag IN ('red', 'orange'))
) risk ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*)::int AS session_count
  FROM call_calendar cc
  WHERE cc.assigned_to = p.id
    AND cc.status IN ('realise', 'completed')
    AND cc.date >= date_trunc('month', CURRENT_DATE)
) sess ON true
WHERE p.role IN ('coach', 'admin')
ORDER BY score DESC, students DESC;

NOTIFY pgrst, 'reload schema';
