import { useAuthStore } from '@/stores/auth-store'
import { canAccess } from '@/lib/permissions'
import type { AppRole } from '@/types/database'
import type { Module } from '@/lib/permissions'

export function useRole() {
  const role = useAuthStore((state) => state.role)

  function hasRole(target: AppRole): boolean {
    return role === target
  }

  function checkAccess(module: Module): boolean {
    return canAccess(role, module)
  }

  return {
    role,
    hasRole,
    canAccess: checkAccess,
    isAdmin: role === 'admin',
    isManager: role === 'manager',
    isCoach: role === 'coach',
    isSetter: role === 'setter',
    isCloser: role === 'closer',
  }
}
