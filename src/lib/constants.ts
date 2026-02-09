export const APP_ROLES = ['admin', 'manager', 'coach', 'setter', 'closer', 'monteur'] as const
export type AppRole = (typeof APP_ROLES)[number]

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrateur',
  manager: 'Manager',
  coach: 'Coach',
  setter: 'Setter',
  closer: 'Closer',
  monteur: 'Monteur / CM',
}

export const CLIENT_STATUSES = ['actif', 'inactif', 'archivé'] as const
export type ClientStatus = (typeof CLIENT_STATUSES)[number]

export const CLIENT_STATUS_COLORS: Record<ClientStatus, string> = {
  actif: 'bg-green-100 text-green-700',
  inactif: 'bg-gray-100 text-gray-600',
  archivé: 'bg-red-100 text-red-700',
}

export const LEAD_STATUSES = ['à_relancer', 'booké', 'no_show', 'pas_intéressé', 'en_cours'] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  à_relancer: 'À relancer',
  booké: 'Booké',
  no_show: 'No show',
  pas_intéressé: 'Pas intéressé',
  en_cours: 'En cours',
}

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  à_relancer: 'bg-orange-100 text-orange-700',
  booké: 'bg-blue-100 text-blue-700',
  no_show: 'bg-red-100 text-red-700',
  pas_intéressé: 'bg-gray-100 text-gray-600',
  en_cours: 'bg-green-100 text-green-700',
}

export const CLIENT_SCOPE_STATUSES = ['contacté', 'qualifié', 'proposé', 'closé', 'perdu'] as const
export type ClientScopeStatus = (typeof CLIENT_SCOPE_STATUSES)[number]

export const CLIENT_SCOPE_STATUS_LABELS: Record<ClientScopeStatus, string> = {
  contacté: 'Contacté',
  qualifié: 'Qualifié',
  proposé: 'Proposé',
  closé: 'Closé',
  perdu: 'Perdu',
}

export const CLIENT_SCOPE_STATUS_COLORS: Record<ClientScopeStatus, string> = {
  contacté: 'bg-gray-100 text-gray-600',
  qualifié: 'bg-blue-100 text-blue-700',
  proposé: 'bg-yellow-100 text-yellow-700',
  closé: 'bg-green-100 text-green-700',
  perdu: 'bg-red-100 text-red-700',
}

export const LEAD_SOURCES = ['instagram', 'linkedin', 'tiktok', 'referral', 'ads', 'autre'] as const
export type LeadSource = (typeof LEAD_SOURCES)[number]

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  instagram: 'Instagram',
  linkedin: 'LinkedIn',
  tiktok: 'TikTok',
  referral: 'Referral',
  ads: 'Ads',
  autre: 'Autre',
}

export const CALL_TYPES = ['manuel', 'iclosed', 'calendly', 'autre'] as const
export type CallType = (typeof CALL_TYPES)[number]

export const CALL_TYPE_COLORS: Record<CallType, string> = {
  manuel: 'bg-gray-100 text-gray-700',
  iclosed: 'bg-blue-100 text-blue-700',
  calendly: 'bg-green-100 text-green-700',
  autre: 'bg-yellow-100 text-yellow-700',
}

export const CALL_STATUSES = ['planifié', 'réalisé', 'no_show', 'annulé', 'reporté'] as const
export type CallStatus = (typeof CALL_STATUSES)[number]

export const CALL_STATUS_COLORS: Record<CallStatus, string> = {
  planifié: 'bg-blue-100 text-blue-700',
  réalisé: 'bg-green-100 text-green-700',
  no_show: 'bg-red-100 text-red-700',
  annulé: 'bg-gray-100 text-gray-600',
  reporté: 'bg-orange-100 text-orange-700',
}

export const CLOSER_CALL_STATUSES = ['closé', 'non_closé'] as const
export type CloserCallStatus = (typeof CLOSER_CALL_STATUSES)[number]

export const FINANCIAL_TYPES = ['ca', 'récurrent', 'charge', 'prestataire'] as const
export type FinancialType = (typeof FINANCIAL_TYPES)[number]

export const FINANCIAL_TYPE_LABELS: Record<FinancialType, string> = {
  ca: 'CA',
  récurrent: 'Récurrent',
  charge: 'Charge',
  prestataire: 'Prestataire',
}

export const RECURRENCE_OPTIONS = ['mensuel', 'trimestriel', 'annuel'] as const
export type RecurrenceType = (typeof RECURRENCE_OPTIONS)[number]

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  mensuel: 'Mensuel',
  trimestriel: 'Trimestriel',
  annuel: 'Annuel',
}

export const SOCIAL_STATUSES = ['à_tourner', 'idée', 'en_cours', 'publié', 'reporté'] as const
export type SocialStatus = (typeof SOCIAL_STATUSES)[number]

export const SOCIAL_STATUS_LABELS: Record<SocialStatus, string> = {
  à_tourner: 'À tourner',
  idée: 'Idée',
  en_cours: 'En cours',
  publié: 'Publié',
  reporté: 'Reporté',
}

export const SOCIAL_FORMATS = ['réel', 'story', 'carrousel', 'post'] as const
export const VIDEO_TYPES = ['réact', 'b-roll', 'vidéo_virale', 'preuve_sociale', 'facecam', 'talking_head', 'vlog'] as const

export const INTERVIEW_STATUSES = ['planifié', 'réalisé', 'annulé'] as const
export type InterviewStatus = (typeof INTERVIEW_STATUSES)[number]

export const INTERVIEW_STATUS_COLORS: Record<InterviewStatus, string> = {
  planifié: 'bg-blue-100 text-blue-700',
  réalisé: 'bg-green-100 text-green-700',
  annulé: 'bg-red-100 text-red-700',
}

export const BLOCKAGE_CATEGORIES = ['technique', 'motivation', 'organisation', 'communication', 'formation', 'autre'] as const

export const NOTIFICATION_TYPES = ['lead_status', 'new_call', 'call_closed', 'general'] as const

export const RITUAL_FREQUENCIES = ['quotidien', 'hebdomadaire', 'mensuel'] as const

export const ITEMS_PER_PAGE = 20
