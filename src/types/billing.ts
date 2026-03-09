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
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  client?: { id: string; full_name: string; email: string; avatar_url: string | null };
}

export type ContractStatus = "draft" | "sent" | "signed" | "cancelled";

export interface SignatureData {
  signed_at: string;
  ip_address: string;
  user_agent: string;
}

// ─── INVOICES ───────────────────────────
export interface Invoice {
  id: string;
  invoice_number: string;
  contract_id: string | null;
  client_id: string;
  amount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  due_date: string | null;
  paid_at: string | null;
  stripe_invoice_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  client?: { id: string; full_name: string; email: string; avatar_url: string | null };
  contract?: { id: string; title: string } | null;
}

export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled";

// ─── PAYMENT SCHEDULES ──────────────────
export interface PaymentSchedule {
  id: string;
  contract_id: string | null;
  client_id: string;
  total_amount: number;
  installments: number;
  frequency: PaymentFrequency;
  start_date: string;
  created_at: string;
  updated_at: string;
  // Joined
  client?: { id: string; full_name: string };
}

export type PaymentFrequency = "monthly" | "weekly" | "biweekly" | "custom";

// ─── PAYMENT REMINDERS ──────────────────
export interface PaymentReminder {
  id: string;
  invoice_id: string;
  reminder_type: ReminderType;
  scheduled_at: string;
  sent_at: string | null;
  created_at: string;
}

export type ReminderType = "j-3" | "j0" | "j+3" | "j+7" | "j+14";

// ─── ONBOARDING ─────────────────────────
export const ONBOARDING_STEPS = [
  { step: 0, label: "Bienvenue", description: "Presentation de la plateforme" },
  { step: 1, label: "Profil", description: "Completer votre profil" },
  { step: 2, label: "Contrat", description: "Signer votre contrat" },
  { step: 3, label: "Paiement", description: "Configurer le paiement" },
  { step: 4, label: "Objectifs", description: "Definir vos objectifs" },
  { step: 5, label: "Check-in", description: "Premier bilan de la semaine" },
  { step: 6, label: "Formation", description: "Acces a la formation" },
  { step: 7, label: "Termine", description: "Pret a demarrer" },
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
