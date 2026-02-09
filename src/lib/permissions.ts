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
  | 'interviews'
  | 'users'
  | 'documentation'
  | 'notifications'

const PERMISSIONS: Record<Module, AppRole[]> = {
  dashboard: ['admin', 'manager', 'coach', 'setter', 'closer', 'monteur'],
  clients: ['admin', 'manager', 'coach', 'setter', 'closer', 'monteur'],
  leads: ['admin', 'manager', 'coach', 'setter', 'closer'],
  'call-calendar': ['admin', 'manager', 'coach', 'setter', 'closer'],
  'closer-calls': ['admin', 'manager', 'closer'],
  'setter-activity': ['admin', 'manager', 'setter'],
  'social-content': ['admin', 'manager', 'coach', 'monteur'],
  finances: ['admin', 'manager'],
  instagram: ['admin', 'manager', 'coach', 'monteur'],
  interviews: ['admin', 'manager', 'coach'],
  users: ['admin'],
  documentation: ['admin', 'manager', 'coach', 'setter', 'closer', 'monteur'],
  notifications: ['admin', 'manager', 'coach', 'setter', 'closer', 'monteur'],
}

export function canAccess(role: AppRole | null, module: Module): boolean {
  if (!role) return false
  return PERMISSIONS[module].includes(role)
}

export function getAccessibleModules(role: AppRole | null): Module[] {
  if (!role) return []
  return (Object.keys(PERMISSIONS) as Module[]).filter((module) => PERMISSIONS[module].includes(role))
}
