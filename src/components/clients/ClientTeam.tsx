import { useClientAssignments } from '@/hooks/useClientAssignments'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Users } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import { ROLE_LABELS } from '@/lib/constants'
import type { AppRole } from '@/types/database'

interface ClientTeamProps {
  clientId: string
}

export function ClientTeam({ clientId }: ClientTeamProps) {
  const { data: assignments, isLoading } = useClientAssignments(clientId)

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
    )
  }

  if (!assignments || assignments.length === 0) {
    return (
      <EmptyState
        icon={<Users className="h-10 w-10" />}
        title="Aucun membre assigné"
        description="Aucun membre d'équipe n'est assigné à ce client."
      />
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {assignments.map((assignment) => (
        <Card key={assignment.id}>
          <CardContent className="flex items-center gap-3 pt-6">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-red-400/10 text-xs font-semibold text-red-300 ring-2 ring-red-500/10">
              {assignment.profile?.avatar_url ? (
                <img
                  src={assignment.profile.avatar_url}
                  alt={assignment.profile.full_name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                getInitials(assignment.profile?.full_name ?? 'U')
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {assignment.profile?.full_name ?? 'Utilisateur'}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {assignment.profile?.email}
              </p>
            </div>
            <Badge variant="secondary">
              {ROLE_LABELS[assignment.role as AppRole] ?? assignment.role}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
