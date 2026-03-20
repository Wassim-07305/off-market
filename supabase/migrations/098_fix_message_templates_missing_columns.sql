-- ═══════════════════════════════════════════════════════════════
-- 098 — Fix message_templates missing columns
-- Migration 076 created the table without shortcut/usage_count/updated_at.
-- Migration 060's CREATE TABLE IF NOT EXISTS was then skipped.
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE public.message_templates ADD COLUMN IF NOT EXISTS shortcut TEXT;
ALTER TABLE public.message_templates ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;
ALTER TABLE public.message_templates ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Ensure RLS policies allow all roles to use templates properly
-- Drop narrow policies from 076, recreate with proper role access

DROP POLICY IF EXISTS msg_templates_read ON public.message_templates;
DROP POLICY IF EXISTS msg_templates_write ON public.message_templates;
DROP POLICY IF EXISTS "Staff manages templates" ON public.message_templates;
DROP POLICY IF EXISTS "Sales sees own and shared" ON public.message_templates;
DROP POLICY IF EXISTS "Sales manages own" ON public.message_templates;

-- Anyone authenticated can see shared templates + their own
CREATE POLICY templates_select ON public.message_templates
  FOR SELECT USING (
    created_by = auth.uid()
    OR is_shared = true
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );

-- Anyone authenticated can create templates
CREATE POLICY templates_insert ON public.message_templates
  FOR INSERT WITH CHECK (
    created_by = auth.uid()
  );

-- Users can update/delete their own; admin/coach can manage all
CREATE POLICY templates_update ON public.message_templates
  FOR UPDATE USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );

CREATE POLICY templates_delete ON public.message_templates
  FOR DELETE USING (
    created_by = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'coach'))
  );
