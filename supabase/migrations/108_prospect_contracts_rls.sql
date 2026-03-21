-- ═══════════════════════════════════════════════════════════════
-- 108 — Fix: Prospects can view and sign their own contracts
-- The existing "Clients can view own contracts" policy works for
-- role=client but prospects also need access to see and sign.
-- ═══════════════════════════════════════════════════════════════

-- Prospect can view own contracts
DROP POLICY IF EXISTS "Prospects can view own contracts" ON public.contracts;
CREATE POLICY "Prospects can view own contracts"
  ON public.contracts FOR SELECT
  USING (client_id = auth.uid() AND get_my_role() = 'prospect');

-- Prospect can sign contracts (update sent → signed)
DROP POLICY IF EXISTS "Prospects can sign own contracts" ON public.contracts;
CREATE POLICY "Prospects can sign own contracts"
  ON public.contracts FOR UPDATE
  USING (client_id = auth.uid() AND get_my_role() = 'prospect' AND status = 'sent')
  WITH CHECK (client_id = auth.uid() AND get_my_role() = 'prospect');
