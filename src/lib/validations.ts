import { z } from "zod";

// ─── AUTH ────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
});

export const signupSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  fullName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

export const createClientSchema = z.object({
  email: z.string().email("Email invalide"),
  fullName: z.string().min(2, "Le nom est requis").max(100),
  phone: z.string().optional().nullable(),
});

// ─── INVOICES ────────────────────────────────────────────────
export const createInvoiceSchema = z.object({
  invoice_number: z.string().min(1, "Numéro de facture requis"),
  contract_id: z.string().uuid().optional().nullable(),
  client_id: z.string().uuid("Client requis"),
  amount: z.number().positive("Le montant doit être positif"),
  tax: z.number().min(0, "La taxe ne peut pas être négative").default(0),
  total: z.number().positive("Le total doit être positif"),
  status: z
    .enum(["draft", "sent", "paid", "overdue", "cancelled"])
    .default("draft"),
  due_date: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateInvoiceSchema = createInvoiceSchema.partial().extend({
  id: z.string().uuid(),
});

export const markInvoicePaidSchema = z.object({
  id: z.string().uuid(),
  paid_at: z.string().optional(),
});

// ─── CONTRACTS ───────────────────────────────────────────────
export const createContractSchema = z.object({
  template_id: z.string().uuid().optional().nullable(),
  client_id: z.string().uuid("Client requis"),
  title: z.string().min(1, "Titre requis").max(200),
  content: z.string().min(1, "Contenu requis"),
  status: z.enum(["draft", "sent", "signed", "cancelled"]).default("draft"),
  expires_at: z.string().optional().nullable(),
});

export const updateContractSchema = createContractSchema.partial().extend({
  id: z.string().uuid(),
});

export const signContractSchema = z.object({
  id: z.string().uuid(),
  signature_image: z.string().optional().nullable(),
  signature_data: z
    .object({
      signed_at: z.string(),
      ip_address: z.string(),
      user_agent: z.string(),
    })
    .optional()
    .nullable(),
});

// ─── CALLS ───────────────────────────────────────────────────
export const createCallSchema = z.object({
  client_id: z.string().uuid().optional().nullable(),
  assigned_to: z.string().uuid("Assigné à requis"),
  title: z.string().min(1, "Titre requis").max(200),
  date: z.string().min(1, "Date requise"),
  time: z.string().min(1, "Heure requise"),
  duration_minutes: z.number().int().positive().default(30),
  call_type: z
    .enum(["manuel", "iclosed", "calendly", "booking", "autre"])
    .default("manuel"),
  status: z
    .enum(["planifie", "realise", "no_show", "annule", "reporte"])
    .default("planifie"),
  link: z.string().url().optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
});

export const updateCallSchema = createCallSchema.partial().extend({
  id: z.string().uuid(),
});

export const rescheduleCallSchema = z.object({
  id: z.string().uuid(),
  date: z.string().min(1, "Nouvelle date requise"),
  time: z.string().min(1, "Nouvelle heure requise"),
  reschedule_reason: z.string().max(500).optional().nullable(),
});

export const rateCallSatisfactionSchema = z.object({
  id: z.string().uuid(),
  satisfaction_rating: z.number().int().min(1).max(5),
});

// ─── CRM / PIPELINE ─────────────────────────────────────────
export const createContactSchema = z.object({
  full_name: z.string().min(2, "Nom requis").max(100),
  email: z.string().email("Email invalide").optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  company: z.string().max(100).optional().nullable(),
  source: z
    .enum(["instagram", "linkedin", "referral", "website", "other"])
    .optional()
    .nullable(),
  stage: z
    .enum(["prospect", "qualifie", "proposition", "closing", "client", "perdu"])
    .default("prospect"),
  assigned_to: z.string().uuid().optional().nullable(),
  estimated_value: z.number().min(0).default(0),
  notes: z.string().max(5000).optional().nullable(),
  tags: z.array(z.string()).default([]),
});

export const updateContactSchema = createContactSchema.partial().extend({
  id: z.string().uuid(),
});

export const moveContactStageSchema = z.object({
  id: z.string().uuid(),
  stage: z.enum([
    "prospect",
    "qualifie",
    "proposition",
    "closing",
    "client",
    "perdu",
  ]),
  sort_order: z.number().int().min(0).optional(),
});

export const createInteractionSchema = z.object({
  contact_id: z.string().uuid(),
  type: z.enum(["call", "email", "meeting", "note", "message"]),
  content: z.string().max(5000).optional().nullable(),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

// ─── COACH ASSIGNMENTS ───────────────────────────────────────
export const createCoachAssignmentSchema = z.object({
  coach_id: z.string().uuid("Coach requis"),
  client_id: z.string().uuid("Client requis"),
  notes: z.string().max(2000).optional().nullable(),
});

export const updateCoachAssignmentSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["active", "paused", "ended"]),
  notes: z.string().max(2000).optional().nullable(),
});

// ─── AI CHAT ─────────────────────────────────────────────────
export const aiChatSchema = z.object({
  message: z.string().min(1, "Message requis").max(10000),
  conversationId: z.string().uuid().optional(),
  context: z.string().optional(),
});

// ─── ACCOUNT DELETION ────────────────────────────────────────
export const deleteAccountSchema = z.object({
  userId: z.string().uuid("ID utilisateur requis"),
  confirmation: z.literal(true),
});

// ─── CALL NOTES ──────────────────────────────────────────────
export const createCallNoteSchema = z.object({
  call_id: z.string().uuid(),
  summary: z.string().max(5000).optional().nullable(),
  client_mood: z
    .enum(["tres_positif", "positif", "neutre", "negatif", "tres_negatif"])
    .optional()
    .nullable(),
  outcome: z
    .enum(["interested", "follow_up", "not_interested", "closed", "no_show"])
    .optional()
    .nullable(),
  next_steps: z.string().max(2000).optional().nullable(),
  action_items: z
    .array(
      z.object({
        title: z.string(),
        done: z.boolean().default(false),
      }),
    )
    .default([]),
});

// ─── TYPE EXPORTS ────────────────────────────────────────────
export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;
export type CreateContractInput = z.infer<typeof createContractSchema>;
export type UpdateContractInput = z.infer<typeof updateContractSchema>;
export type SignContractInput = z.infer<typeof signContractSchema>;
export type CreateCallInput = z.infer<typeof createCallSchema>;
export type UpdateCallInput = z.infer<typeof updateCallSchema>;
export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type CreateCoachAssignmentInput = z.infer<
  typeof createCoachAssignmentSchema
>;
export type UpdateCoachAssignmentInput = z.infer<
  typeof updateCoachAssignmentSchema
>;
export type AiChatInput = z.infer<typeof aiChatSchema>;
export type CreateCallNoteInput = z.infer<typeof createCallNoteSchema>;
