import { z } from 'zod'

// Auth forms
export const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Minimum 6 caractères'),
})
export type LoginFormData = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    full_name: z.string().min(2, 'Minimum 2 caractères'),
    email: z.string().email('Email invalide'),
    password: z.string().min(6, 'Minimum 6 caractères'),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirm_password'],
  })
export type RegisterFormData = z.infer<typeof registerSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
})
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

// Client forms
export const clientSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  status: z.enum(['actif', 'inactif', 'archivé']).default('actif'),
})
export type ClientFormData = z.infer<typeof clientSchema>

// Lead forms
export const leadSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  source: z.enum(['instagram', 'linkedin', 'tiktok', 'referral', 'ads', 'autre']).optional(),
  status: z.enum(['premier_message', 'en_discussion', 'qualifie', 'loom_envoye', 'call_planifie', 'close', 'perdu']).default('premier_message'),
  client_id: z.string().uuid().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  ca_contracté: z.coerce.number().min(0).default(0),
  ca_collecté: z.coerce.number().min(0).default(0),
  commission_setter: z.coerce.number().min(0).default(0),
  commission_closer: z.coerce.number().min(0).default(0),
  notes: z.string().optional().or(z.literal('')),
})
export type LeadFormData = z.infer<typeof leadSchema>

// Call calendar forms
export const callCalendarSchema = z.object({
  client_id: z.string().uuid('Sélectionnez un client'),
  lead_id: z.string().uuid().optional().nullable(),
  assigned_to: z.string().uuid().optional().nullable(),
  date: z.string().min(1, 'La date est requise'),
  time: z.string().min(1, "L'heure est requise"),
  type: z.enum(['manuel', 'iclosed', 'calendly', 'coaching', 'closing', 'autre']).default('manuel'),
  status: z.enum(['planifié', 'réalisé', 'no_show', 'annulé', 'reporté']).default('planifié'),
  link: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})
export type CallCalendarFormData = z.infer<typeof callCalendarSchema>

// Financial entry forms
export const financialEntrySchema = z.object({
  client_id: z.string().uuid('Sélectionnez un client'),
  type: z.enum(['ca', 'récurrent', 'charge', 'prestataire']),
  label: z.string().min(1, 'Le libellé est requis'),
  amount: z.coerce.number().min(0, 'Le montant doit être positif'),
  prestataire: z.string().optional().or(z.literal('')),
  is_paid: z.boolean().default(false),
  date: z.string().min(1, 'La date est requise'),
  recurrence: z.enum(['mensuel', 'trimestriel', 'annuel']).optional().nullable(),
})
export type FinancialEntryFormData = z.infer<typeof financialEntrySchema>

// Payment schedule forms
export const paymentScheduleSchema = z.object({
  financial_entry_id: z.string().uuid().optional().nullable(),
  client_id: z.string().uuid('Sélectionnez un client'),
  amount: z.coerce.number().min(0),
  due_date: z.string().min(1, "La date d'échéance est requise"),
  is_paid: z.boolean().default(false),
})
export type PaymentScheduleFormData = z.infer<typeof paymentScheduleSchema>

// Activity forms (prospection)
export const setterActivitySchema = z.object({
  client_id: z.string().uuid().optional().nullable(),
  date: z.string().min(1, 'La date est requise'),
  messages_sent: z.coerce.number().int().min(0).default(0),
  calls_made: z.coerce.number().int().min(0).default(0),
  looms_sent: z.coerce.number().int().min(0).default(0),
  notes: z.string().optional().or(z.literal('')),
})
export type SetterActivityFormData = z.infer<typeof setterActivitySchema>

// Channel forms
export const channelSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  type: z.enum(['direct', 'group']).default('group'),
  write_mode: z.enum(['all', 'admin_only']).default('all'),
  member_ids: z.array(z.string().uuid()).min(1, 'Au moins un membre requis'),
})
export type ChannelFormData = z.infer<typeof channelSchema>

// Message forms
export const messageSchema = z.object({
  content: z.string().min(1, 'Le message ne peut pas être vide'),
  file_url: z.string().url().optional().or(z.literal('')),
  file_name: z.string().optional().or(z.literal('')),
})
export type MessageFormData = z.infer<typeof messageSchema>

// Formation forms
export const formationSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional().or(z.literal('')),
  thumbnail_url: z.string().url().optional().or(z.literal('')),
  is_published: z.boolean().default(false),
})
export type FormationFormData = z.infer<typeof formationSchema>

// Formation module forms
export const formationModuleSchema = z.object({
  formation_id: z.string().uuid(),
  title: z.string().min(1, 'Le titre est requis'),
  description: z.string().optional().or(z.literal('')),
})
export type FormationModuleFormData = z.infer<typeof formationModuleSchema>

// Module item forms
export const moduleItemSchema = z.object({
  module_id: z.string().uuid(),
  title: z.string().min(1, 'Le titre est requis'),
  type: z.enum(['video', 'document']).default('video'),
  url: z.string().url().optional().or(z.literal('')),
  duration: z.coerce.number().int().min(0).optional(),
})
export type ModuleItemFormData = z.infer<typeof moduleItemSchema>
