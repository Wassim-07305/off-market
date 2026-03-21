-- ═══════════════════════════════════════════════════════════════
-- 109 — Revert: CA = paid invoices ONLY (not signed contracts)
-- Contracts are engagements, not revenue. CA only counts when
-- the admin marks an invoice as "paid" (real money received).
-- ═══════════════════════════════════════════════════════════════

-- Restore original dashboard_kpis (invoices only)
CREATE OR REPLACE VIEW dashboard_kpis AS
SELECT
  (SELECT COUNT(*) FROM profiles WHERE role = 'client')::int
    AS total_clients,
  (SELECT COUNT(*) FROM profiles
   WHERE role = 'client'
     AND created_at <= (date_trunc('month', CURRENT_DATE) - interval '1 day'))::int
    AS last_month_clients,
  (SELECT COALESCE(SUM(total), 0) FROM invoices
   WHERE status = 'paid'
     AND created_at >= date_trunc('month', CURRENT_DATE))::numeric
    AS revenue_this_month,
  (SELECT COALESCE(SUM(total), 0) FROM invoices
   WHERE status = 'paid'
     AND created_at >= date_trunc('month', CURRENT_DATE) - interval '1 month'
     AND created_at < date_trunc('month', CURRENT_DATE))::numeric
    AS revenue_last_month,
  (SELECT COUNT(*) FROM courses WHERE status = 'published')::int
    AS active_courses,
  (SELECT COUNT(*) FROM weekly_checkins
   WHERE week_start >= date_trunc('week', CURRENT_DATE))::int
    AS weekly_checkins;

-- Restore original revenue_by_month (invoices only)
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

-- Restore original revenue_by_quarter (invoices only)
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
