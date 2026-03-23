// ─── CONTRACT TEMPLATES ─────────────────
export interface ContractTemplate {
  id: string;
  title: string;
  content: string; // HTML/Markdown with {{variable}} placeholders
  variables: TemplateVariable[];
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface TemplateVariable {
  key: string;
  label: string;
  type: "text" | "number" | "date" | "email";
  defaultValue?: string;
}

// ─── CONTRACTS ──────────────────────────
export interface Contract {
  id: string;
  template_id: string | null;
  client_id: string;
  title: string;
  content: string; // Rendered content
  status: ContractStatus;
  signature_data: SignatureData | null;
  signature_image: string | null; // Canvas data URL
  sent_at: string | null;
  signed_at: string | null;
  expires_at: string | null;
  cancellation_reason: string | null;
  version: number;
  auto_renew: boolean;
  renewal_period_months: number;
  renewal_notice_days: number;
  renewed_from_id: string | null;
  renewal_status: ContractRenewalStatus | null;
  amount: number | null;
  start_date: string | null;
  end_date: string | null;
  renewal_of: string | null;
  renewed_to: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  client?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
}

export type ContractStatus =
  | "draft"
  | "sent"
  | "signed"
  | "cancelled"
  | "active"
  | "renewed"
  | "expired";

export type ContractRenewalStatus =
  | "pending_renewal"
  | "renewed"
  | "expired"
  | "cancelled";

export type RenewalLogAction =
  | "reminder_sent"
  | "auto_renewed"
  | "cancelled"
  | "expired";

export interface ContractRenewalLog {
  id: string;
  contract_id: string;
  action: RenewalLogAction;
  details: Record<string, unknown>;
  created_at: string;
}

export interface SignatureData {
  signed_at: string;
  ip_address: string;
  user_agent: string;
  signer_name?: string;
}

// ─── INVOICES ───────────────────────────
export interface Invoice {
  id: string;
  invoice_number: string;
  contract_id: string | null;
  client_id: string;
  amount: number;
  tax: number;
  tax_rate: number;
  total: number;
  status: InvoiceStatus;
  due_date: string | null;
  paid_at: string | null;
  stripe_invoice_id: string | null;
  notes: string | null;
  discount: number;
  line_items: InvoiceLineItem[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  client?: {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
  contract?: { id: string; title: string } | null;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

export type InvoiceStatus =
  | "draft"
  | "sent"
  | "paid"
  | "overdue"
  | "cancelled"
  | "partial"
  | "refunded";

// ─── PAYMENT SCHEDULES ──────────────────
export interface PaymentSchedule {
  id: string;
  contract_id: string | null;
  client_id: string;
  total_amount: number;
  installments: number;
  frequency: PaymentFrequency;
  start_date: string;
  installment_details: PaymentScheduleInstallment[];
  created_at: string;
  updated_at: string;
  // Joined
  client?: { id: string; full_name: string };
}

export interface PaymentScheduleInstallment {
  index: number;
  amount: number;
  due_date: string;
  status: "pending" | "paid" | "overdue";
  paid_at: string | null;
}

export type PaymentFrequency = "monthly" | "weekly" | "biweekly" | "custom";

export const FREQUENCY_LABELS: Record<PaymentFrequency, string> = {
  monthly: "Mensuel",
  weekly: "Hebdomadaire",
  biweekly: "Bi-mensuel",
  custom: "Personnalise",
};

// ─── COMMISSIONS ───────────────────────
export type CommissionRole = "closer" | "setter" | "coach" | "referral";
export type CommissionStatus = "pending" | "paid" | "cancelled";

export interface Commission {
  id: string;
  sale_id: string | null;
  closer_call_id: string | null;
  contractor_id: string;
  contractor_role: CommissionRole;
  sale_amount: number;
  commission_rate: number;
  commission_amount: number;
  percentage: number;
  amount: number;
  split_type: string;
  status: CommissionStatus;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  contractor?: { id: string; full_name: string; email: string } | null;
}

export interface CommissionSummary {
  contractor_id: string;
  contractor_name: string;
  role: CommissionRole;
  total_owed: number;
  total_paid: number;
  remaining: number;
  count: number;
}

/** Default commission rates by role (as decimal, e.g. 0.10 = 10%) */
export const DEFAULT_COMMISSION_RATES: Record<CommissionRole, number> = {
  closer: 0.1,
  setter: 0.05,
  coach: 0.03,
  referral: 0.05,
};

export const COMMISSION_ROLE_LABELS: Record<CommissionRole, string> = {
  closer: "Closer",
  setter: "Setter",
  coach: "Coach",
  referral: "Parrainage",
};

// ─── PAYMENT REMINDERS ──────────────────
export interface PaymentReminder {
  id: string;
  invoice_id: string;
  reminder_type: ReminderType;
  scheduled_at: string;
  sent_at: string | null;
  created_at: string;
}

export type ReminderType = "j-3" | "j0" | "j+3" | "j+7" | "j+14" | "j+21";

// ─── ONBOARDING ─────────────────────────
export const ONBOARDING_STEPS = [
  { step: 0, label: "Bienvenue", description: "Presentation de la plateforme" },
  { step: 1, label: "Profil", description: "Completer votre profil" },
  { step: 2, label: "Contrat", description: "Signer votre contrat" },
  { step: 3, label: "Paiement", description: "Configurer le paiement" },
  { step: 4, label: "Objectifs", description: "Definir vos objectifs" },
  { step: 5, label: "Check-in", description: "Premier bilan de la semaine" },
  { step: 6, label: "Formation", description: "Acces a la formation" },
  { step: 7, label: "Termine", description: "Pret a démarrer" },
] as const;

export type OnboardingStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

// ─── BILLING STATS ──────────────────────
export interface BillingStats {
  totalRevenue: number;
  pendingAmount: number;
  overdueAmount: number;
  contractsSigned: number;
  contractsPending: number;
  invoicesPaid: number;
  invoicesOverdue: number;
}
