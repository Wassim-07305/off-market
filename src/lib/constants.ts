export const APP_ROLES = ['admin', 'coach', 'prospect'] as const
export type AppRole = (typeof APP_ROLES)[number]

export const ROLE_LABELS: Record<AppRole, string> = {
  admin: 'Administrateur',
  coach: 'Coach',
  prospect: 'Prospect',
}

export const CLIENT_STATUSES = ['actif', 'inactif', 'archivé'] as const
export type ClientStatus = (typeof CLIENT_STATUSES)[number]

export const CLIENT_STATUS_COLORS: Record<ClientStatus, string> = {
  actif: 'bg-green-100 text-green-700',
  inactif: 'bg-gray-100 text-gray-600',
  archivé: 'bg-red-100 text-red-700',
}

export const LEAD_STATUSES = ['premier_message', 'en_discussion', 'qualifie', 'loom_envoye', 'call_planifie', 'close', 'perdu'] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  premier_message: 'Premier message',
  en_discussion: 'En discussion',
  qualifie: 'Qualifié',
  loom_envoye: 'Loom envoyé',
  call_planifie: 'Call planifié',
  close: 'Closé',
  perdu: 'Perdu',
}

export const LEAD_STATUS_COLORS: Record<LeadStatus, string> = {
  premier_message: 'bg-slate-100 text-slate-700',
  en_discussion: 'bg-blue-100 text-blue-700',
  qualifie: 'bg-indigo-100 text-indigo-700',
  loom_envoye: 'bg-purple-100 text-purple-700',
  call_planifie: 'bg-amber-100 text-amber-700',
  close: 'bg-green-100 text-green-700',
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

export const CALL_TYPES = ['manuel', 'iclosed', 'calendly', 'coaching', 'closing', 'autre'] as const
export type CallType = (typeof CALL_TYPES)[number]

export const CALL_TYPE_LABELS: Record<CallType, string> = {
  manuel: 'Manuel',
  iclosed: 'iClosed',
  calendly: 'Calendly',
  coaching: 'Coaching',
  closing: 'Closing',
  autre: 'Autre',
}

export const CALL_TYPE_COLORS: Record<CallType, string> = {
  manuel: 'bg-gray-100 text-gray-700',
  iclosed: 'bg-blue-100 text-blue-700',
  calendly: 'bg-green-100 text-green-700',
  coaching: 'bg-purple-100 text-purple-700',
  closing: 'bg-red-100 text-red-700',
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

export const CALL_STATUS_LABELS: Record<CallStatus, string> = {
  planifié: 'Planifié',
  réalisé: 'Réalisé',
  no_show: 'No show',
  annulé: 'Annulé',
  reporté: 'Reporté',
}

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

// Closer call statuses
export const CLOSER_CALL_STATUSES = ['closé', 'non_closé'] as const
export type CloserCallStatus = (typeof CLOSER_CALL_STATUSES)[number]

export const CLOSER_CALL_STATUS_LABELS: Record<CloserCallStatus, string> = {
  closé: 'Closé',
  non_closé: 'Non closé',
}

export const CLOSER_CALL_STATUS_COLORS: Record<CloserCallStatus, string> = {
  closé: 'bg-green-100 text-green-700',
  non_closé: 'bg-red-100 text-red-700',
}

// Social content statuses
export const SOCIAL_CONTENT_STATUSES = ['idée', 'a_tourner', 'en_cours', 'publié', 'reporté'] as const
export type SocialContentStatus = (typeof SOCIAL_CONTENT_STATUSES)[number]

export const SOCIAL_CONTENT_STATUS_LABELS: Record<SocialContentStatus, string> = {
  idée: 'Idée',
  a_tourner: 'À tourner',
  en_cours: 'En cours',
  publié: 'Publié',
  reporté: 'Reporté',
}

export const SOCIAL_CONTENT_STATUS_COLORS: Record<SocialContentStatus, string> = {
  idée: 'bg-slate-100 text-slate-700',
  a_tourner: 'bg-amber-100 text-amber-700',
  en_cours: 'bg-blue-100 text-blue-700',
  publié: 'bg-green-100 text-green-700',
  reporté: 'bg-orange-100 text-orange-700',
}

export const SOCIAL_FORMATS = ['reel', 'story', 'carrousel', 'post'] as const
export type SocialFormat = (typeof SOCIAL_FORMATS)[number]

export const SOCIAL_FORMAT_LABELS: Record<SocialFormat, string> = {
  reel: 'Reel',
  story: 'Story',
  carrousel: 'Carrousel',
  post: 'Post',
}

export const VIDEO_TYPES = ['react', 'b-roll', 'video_virale', 'preuve_sociale', 'facecam', 'talking_head', 'vlog'] as const
export type VideoType = (typeof VIDEO_TYPES)[number]

export const VIDEO_TYPE_LABELS: Record<VideoType, string> = {
  react: 'React',
  'b-roll': 'B-Roll',
  video_virale: 'Vidéo virale',
  preuve_sociale: 'Preuve sociale',
  facecam: 'Facecam',
  talking_head: 'Talking Head',
  vlog: 'Vlog',
}

export const NOTIFICATION_TYPES = ['lead_status', 'new_call', 'call_closed', 'general'] as const

export const RITUAL_FREQUENCIES = ['quotidien', 'hebdomadaire', 'mensuel'] as const

export const ITEMS_PER_PAGE = 20
