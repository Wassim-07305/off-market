import { ShieldAlert } from 'lucide-react'
import { useAuthStore } from '@/stores/auth-store'
import { canAccess } from '@/lib/permissions'
import type { Module } from '@/lib/permissions'
import type { ReactNode } from 'react'

interface RoleGuardProps {
  module: Module
  children: ReactNode
}

export function RoleGuard({ module, children }: RoleGuardProps) {
  const role = useAuthStore((state) => state.role)

  if (!canAccess(role, module)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-full bg-destructive/10 p-4">
          <ShieldAlert className="h-10 w-10 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            Acces refuse
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Vous n'avez pas les permissions necessaires pour acceder a cette
            section.
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
