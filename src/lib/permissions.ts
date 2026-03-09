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
  | 'settings'
  | 'analytics'

const PERMISSIONS: Record<Module, AppRole[]> = {
  dashboard: ['admin', 'coach', 'prospect'],
  messaging: ['admin', 'coach', 'prospect'],
  formations: ['admin', 'prospect'],
  eleves: ['admin', 'coach'],
  pipeline: ['admin', 'coach', 'prospect'],
  calendrier: ['admin', 'coach'],
  activite: ['admin', 'prospect'],
  finances: ['admin'],
  users: ['admin'],
  notifications: ['admin', 'coach', 'prospect'],
  settings: ['admin', 'coach', 'prospect'],
  analytics: ['admin'],
}

export function canAccess(role: AppRole | null, module: Module): boolean {
  if (!role) return false
  return PERMISSIONS[module].includes(role)
}

export function getAccessibleModules(role: AppRole | null): Module[] {
  if (!role) return []
  return (Object.keys(PERMISSIONS) as Module[]).filter((module) => PERMISSIONS[module].includes(role))
}
