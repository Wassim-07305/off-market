import type { AppRole } from '@/types/database'

export type Module =
  | 'dashboard'
  | 'messaging'
  | 'formations'
  | 'eleves'
  | 'pipeline'
  | 'calendrier'
  | 'activite'
  | 'finances'
  | 'users'
  | 'notifications'

const PERMISSIONS: Record<Module, AppRole[]> = {
  dashboard: ['admin', 'setter', 'eleve'],
  messaging: ['admin', 'setter', 'eleve'],
  formations: ['admin', 'eleve'],
  eleves: ['admin', 'setter'],
  pipeline: ['admin', 'setter', 'eleve'],
  calendrier: ['admin', 'setter'],
  activite: ['admin', 'eleve'],
  finances: ['admin'],
  users: ['admin'],
  notifications: ['admin', 'setter', 'eleve'],
}

export function canAccess(role: AppRole | null, module: Module): boolean {
  if (!role) return false
  return PERMISSIONS[module].includes(role)
}

export function getAccessibleModules(role: AppRole | null): Module[] {
  if (!role) return []
  return (Object.keys(PERMISSIONS) as Module[]).filter((module) => PERMISSIONS[module].includes(role))
}
