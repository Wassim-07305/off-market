-- ═══════════════════════════════════════
-- OFF MARKET — BILLING & ONBOARDING
-- ═══════════════════════════════════════

-- Add onboarding_step to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;

-- ─── CONTRACT TEMPLATES ─────────────────
CREATE TABLE public.contract_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- HTML/Markdown with {{variable}} placeholders
  variables JSONB DEFAULT '[]', -- [{key: "client_name", label: "Nom du client", type: "text"}]
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── CONTRACTS ──────────────────────────
CREATE TABLE public.contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES public.contract_templates(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Rendered content with variables substituted
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'signed', 'cancelled')),
  signature_data JSONB, -- {signed_at, ip_address, user_agent}
  sent_at TIMESTAMPTZ,
  signed_at TIMESTAMPTZ,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── INVOICES ───────────────────────────
-- Sequence for auto-numbering
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START WITH 1;

CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  contract_id UUID REFERENCES public.contracts(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax NUMERIC(10,2) NOT NULL DEFAULT 0,
  total NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date DATE,
  paid_at TIMESTAMPTZ,
  stripe_invoice_id TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-generate invoice number: OM-YYYY-NNNN
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.invoice_number := 'OM-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('invoice_number_seq')::text, 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_invoice_number
  BEFORE INSERT ON public.invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL OR NEW.invoice_number = '')
  EXECUTE FUNCTION generate_invoice_number();

-- ─── PAYMENT SCHEDULES ──────────────────
CREATE TABLE public.payment_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID REFERENCES public.contracts(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_amount NUMERIC(10,2) NOT NULL,
  installments INTEGER NOT NULL DEFAULT 1 CHECK (installments BETWEEN 1 AND 12),
  frequency TEXT NOT NULL DEFAULT 'monthly' CHECK (frequency IN ('monthly', 'weekly', 'biweekly', 'custom')),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── PAYMENT REMINDERS ──────────────────
CREATE TABLE public.payment_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('j-3', 'j0', 'j+3', 'j+7', 'j+14')),
  scheduled_at TIMESTAMPTZ NOT NULL,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── UPDATED_AT TRIGGERS ────────────────
CREATE TRIGGER update_contract_templates_updated_at BEFORE UPDATE ON public.contract_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON public.contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_schedules_updated_at BEFORE UPDATE ON public.payment_schedules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─── RLS POLICIES ───────────────────────
ALTER TABLE public.contract_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_reminders ENABLE ROW LEVEL SECURITY;

-- Contract Templates: admin/coach can manage
CREATE POLICY "Staff can manage contract templates"
  ON public.contract_templates FOR ALL
  USING (get_my_role() IN ('admin', 'coach'))
  WITH CHECK (get_my_role() IN ('admin', 'coach'));

CREATE POLICY "All authenticated can view active templates"
  ON public.contract_templates FOR SELECT
  USING (is_active = true AND auth.uid() IS NOT NULL);

-- Contracts: staff full, client own
CREATE POLICY "Staff can manage all contracts"
  ON public.contracts FOR ALL
  USING (get_my_role() IN ('admin', 'coach'))
  WITH CHECK (get_my_role() IN ('admin', 'coach'));

CREATE POLICY "Clients can view own contracts"
  ON public.contracts FOR SELECT
  USING (client_id = auth.uid());

CREATE POLICY "Clients can update own contracts for signing"
  ON public.contracts FOR UPDATE
  USING (client_id = auth.uid() AND status = 'sent')
  WITH CHECK (client_id = auth.uid());

-- Invoices: staff full, client own
CREATE POLICY "Staff can manage all invoices"
  ON public.invoices FOR ALL
  USING (get_my_role() IN ('admin', 'coach'))
  WITH CHECK (get_my_role() IN ('admin', 'coach'));

CREATE POLICY "Clients can view own invoices"
  ON public.invoices FOR SELECT
  USING (client_id = auth.uid());

-- Payment Schedules: staff full, client own
CREATE POLICY "Staff can manage all payment schedules"
  ON public.payment_schedules FOR ALL
  USING (get_my_role() IN ('admin', 'coach'))
  WITH CHECK (get_my_role() IN ('admin', 'coach'));

CREATE POLICY "Clients can view own payment schedules"
  ON public.payment_schedules FOR SELECT
  USING (client_id = auth.uid());

-- Payment Reminders: staff only
CREATE POLICY "Staff can manage payment reminders"
  ON public.payment_reminders FOR ALL
  USING (get_my_role() IN ('admin', 'coach'))
  WITH CHECK (get_my_role() IN ('admin', 'coach'));

-- ─── INDEXES ────────────────────────────
CREATE INDEX idx_contracts_client_id ON public.contracts(client_id);
CREATE INDEX idx_contracts_status ON public.contracts(status);
CREATE INDEX idx_invoices_client_id ON public.invoices(client_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_due_date ON public.invoices(due_date);
CREATE INDEX idx_payment_schedules_client_id ON public.payment_schedules(client_id);
CREATE INDEX idx_payment_reminders_invoice_id ON public.payment_reminders(invoice_id);
CREATE INDEX idx_payment_reminders_scheduled_at ON public.payment_reminders(scheduled_at);
