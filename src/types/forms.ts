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
  status: z.enum(['à_relancer', 'booké', 'no_show', 'pas_intéressé', 'en_cours']).default('à_relancer'),
  client_status: z.enum(['contacté', 'qualifié', 'proposé', 'closé', 'perdu']).default('contacté'),
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
  type: z.enum(['manuel', 'iclosed', 'calendly', 'autre']).default('manuel'),
  status: z.enum(['planifié', 'réalisé', 'no_show', 'annulé', 'reporté']).default('planifié'),
  link: z.string().url().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})
export type CallCalendarFormData = z.infer<typeof callCalendarSchema>

// Closer call forms
export const closerCallSchema = z.object({
  client_id: z.string().uuid('Sélectionnez un client'),
  lead_id: z.string().uuid().optional().nullable(),
  closer_id: z.string().uuid().optional().nullable(),
  date: z.string().min(1, 'La date est requise'),
  status: z.enum(['closé', 'non_closé']).default('non_closé'),
  revenue: z.coerce.number().min(0).default(0),
  nombre_paiements: z.coerce.number().int().min(1).default(1),
  link: z.string().url().optional().or(z.literal('')),
  debrief: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})
export type CloserCallFormData = z.infer<typeof closerCallSchema>

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

// Social content forms
export const socialContentSchema = z.object({
  client_id: z.string().uuid('Sélectionnez un client'),
  title: z.string().min(1, 'Le titre est requis'),
  status: z.enum(['à_tourner', 'idée', 'en_cours', 'publié', 'reporté']).default('idée'),
  format: z.enum(['réel', 'story', 'carrousel', 'post']).optional().nullable(),
  video_type: z
    .enum(['réact', 'b-roll', 'vidéo_virale', 'preuve_sociale', 'facecam', 'talking_head', 'vlog'])
    .optional()
    .nullable(),
  link: z.string().url().optional().or(z.literal('')),
  is_validated: z.boolean().default(false),
  text_content: z.string().optional().or(z.literal('')),
  planned_date: z.string().optional().or(z.literal('')),
})
export type SocialContentFormData = z.infer<typeof socialContentSchema>

// Setter activity forms
export const setterActivitySchema = z.object({
  client_id: z.string().uuid('Sélectionnez un client'),
  date: z.string().min(1, 'La date est requise'),
  messages_sent: z.coerce.number().int().min(0).default(0),
  notes: z.string().optional().or(z.literal('')),
})
export type SetterActivityFormData = z.infer<typeof setterActivitySchema>

// Interview forms
export const interviewSchema = z.object({
  coach_id: z.string().uuid('Sélectionnez un coach'),
  member_id: z.string().uuid('Sélectionnez un membre'),
  date: z.string().min(1, 'La date est requise'),
  status: z.enum(['planifié', 'réalisé', 'annulé']).default('planifié'),
  positive_points: z.string().optional().or(z.literal('')),
  improvement_areas: z.string().optional().or(z.literal('')),
  actions: z.string().optional().or(z.literal('')),
  deadline: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
})
export type InterviewFormData = z.infer<typeof interviewSchema>

// Blockage forms
export const blockageSchema = z.object({
  interview_id: z.string().uuid().optional().nullable(),
  member_id: z.string().uuid().optional().nullable(),
  category: z.enum(['technique', 'motivation', 'organisation', 'communication', 'formation', 'autre']).optional(),
  problem: z.string().min(1, 'Le problème est requis'),
  why_1: z.string().optional().or(z.literal('')),
  why_2: z.string().optional().or(z.literal('')),
  why_3: z.string().optional().or(z.literal('')),
  why_4: z.string().optional().or(z.literal('')),
  why_5: z.string().optional().or(z.literal('')),
  root_cause: z.string().optional().or(z.literal('')),
  decided_action: z.string().optional().or(z.literal('')),
  result: z.string().optional().or(z.literal('')),
})
export type BlockageFormData = z.infer<typeof blockageSchema>

// Instagram forms
export const instagramAccountSchema = z.object({
  client_id: z.string().uuid('Sélectionnez un client'),
  username: z.string().min(1, "Le nom d'utilisateur est requis"),
  followers: z.coerce.number().int().min(0).default(0),
  following: z.coerce.number().int().min(0).default(0),
  media_count: z.coerce.number().int().min(0).default(0),
})
export type InstagramAccountFormData = z.infer<typeof instagramAccountSchema>

export const instagramPostStatSchema = z.object({
  account_id: z.string().uuid('Sélectionnez un compte'),
  post_url: z.string().url().optional().or(z.literal('')),
  likes: z.coerce.number().int().min(0).default(0),
  comments: z.coerce.number().int().min(0).default(0),
  shares: z.coerce.number().int().min(0).default(0),
  saves: z.coerce.number().int().min(0).default(0),
  reach: z.coerce.number().int().min(0).default(0),
  impressions: z.coerce.number().int().min(0).default(0),
  engagement_rate: z.coerce.number().min(0).default(0),
  posted_at: z.string().optional().or(z.literal('')),
})
export type InstagramPostStatFormData = z.infer<typeof instagramPostStatSchema>
