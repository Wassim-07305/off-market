-- ============================================================
-- Migration: error_logs
-- Description: Global error monitoring table
-- ============================================================

CREATE TABLE IF NOT EXISTS error_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message text NOT NULL,
  stack text,
  component_stack text,
  page text,
  route text,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  user_email text,
  user_role text,
  source text NOT NULL DEFAULT 'unknown' CHECK (source IN ('error-boundary', 'unhandled-error', 'unhandled-rejection', 'api-error', 'manual')),
  severity text NOT NULL DEFAULT 'error' CHECK (severity IN ('warning', 'error', 'critical')),
  user_agent text,
  viewport text,
  metadata jsonb DEFAULT '{}',
  resolved boolean NOT NULL DEFAULT false,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_resolved ON error_logs(resolved);
CREATE INDEX IF NOT EXISTS idx_error_logs_source ON error_logs(source);
CREATE INDEX IF NOT EXISTS idx_error_logs_page ON error_logs(page);

ALTER TABLE error_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "authenticated_insert_error_logs" ON error_logs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "admin_read_error_logs" ON error_logs FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "admin_update_error_logs" ON error_logs FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "admin_delete_error_logs" ON error_logs FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "anon_insert_error_logs" ON error_logs FOR INSERT TO anon WITH CHECK (true);
