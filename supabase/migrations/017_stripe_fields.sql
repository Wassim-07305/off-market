-- ═══════════════════════════════════════
-- OFF MARKET — STRIPE INTEGRATION
-- ═══════════════════════════════════════

-- Add Stripe fields to invoices (stripe_invoice_id already exists)
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS stripe_checkout_session_id TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'pending' CHECK (payment_method IN ('pending', 'stripe', 'bank_transfer', 'manual'));

-- Add Stripe customer ID to profiles for recurring payments
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Index for quick lookup by Stripe IDs
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_checkout ON public.invoices(stripe_checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_invoices_stripe_payment_intent ON public.invoices(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id);
