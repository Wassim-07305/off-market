import type { AppRole } from '@/types/database'

export type Module =
  | 'dashboard'
  | 'clients'
  | 'leads'
  | 'call-calendar'
  | 'closer-calls'
  | 'setter-activity'
  | 'social-content'
  | 'finances'
  | 'instagram'
  | 'users'
  | 'documentation'
  | 'notifications'
  | 'messaging'
  | 'formations'
  | 'student-overview'

const PERMISSIONS: Record<Module, AppRole[]> = {
  dashboard: ['admin', 'setter', 'eleve'],
  clients: ['admin', 'setter'],
  leads: ['admin', 'setter'],
  'call-calendar': ['admin', 'setter'],
  'closer-calls': ['admin'],
  'setter-activity': ['admin', 'setter'],
  'social-content': ['admin'],
  finances: ['admin'],
  instagram: ['admin'],
  users: ['admin'],
  documentation: ['admin', 'setter', 'eleve'],
  notifications: ['admin', 'setter', 'eleve'],
  messaging: ['admin', 'setter', 'eleve'],
  formations: ['admin', 'eleve'],
  'student-overview': ['admin'],
}

export function canAccess(role: AppRole | null, module: Module): boolean {
  if (!role) return false
  return PERMISSIONS[module].includes(role)
}

export function getAccessibleModules(role: AppRole | null): Module[] {
  if (!role) return []
  return (Object.keys(PERMISSIONS) as Module[]).filter((module) => PERMISSIONS[module].includes(role))
}
