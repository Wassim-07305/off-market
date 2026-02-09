import { useMemo } from 'react'
import type { Client } from '@/types/database'
import { useLeadsByClient } from '@/hooks/useLeads'
import { useClientAssignments } from '@/hooks/useClientAssignments'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CLIENT_STATUS_COLORS } from '@/lib/constants'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { HealthScore } from './HealthScore'
import { ActivityTimeline } from './ActivityTimeline'

interface ClientOverviewProps {
  client: Client
}

function ClientOverview({ client }: ClientOverviewProps) {
  const { data: leads, isLoading: leadsLoading } = useLeadsByClient(client.id)
  const { data: assignments, isLoading: assignmentsLoading } = useClientAssignments(client.id)

  const caContracte = leads?.reduce((sum, l) => sum + Number(l.ca_contracté), 0) ?? 0
  const caCollecte = leads?.reduce((sum, l) => sum + Number(l.ca_collecté), 0) ?? 0
  const nbLeads = leads?.length ?? 0
  const nbMembers = assignments?.length ?? 0

  // Compute health score (0-100) based on collection rate, activity, team
  const healthScore = useMemo(() => {
    let score = 50 // base
    // Collection rate bonus
    if (caContracte > 0) {
      const ratio = caCollecte / caContracte
      score += Math.min(ratio * 30, 30)
    }
    // Has leads bonus
    if (nbLeads > 0) score += 10
    // Has team members bonus
    if (nbMembers > 0) score += 10
    // Active status
    if (client.status === 'actif') score += 0
    else if (client.status === 'inactif') score -= 20
    else if (client.status === 'archivé') score -= 40
    return Math.max(0, Math.min(100, Math.round(score)))
  }, [caContracte, caCollecte, nbLeads, nbMembers, client.status])

  return (
    <div className="space-y-6">
      {/* Client Info + Health Score */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto]">
      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Statut</dt>
              <dd className="mt-1">
                <Badge className={cn(CLIENT_STATUS_COLORS[client.status])}>
                  {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Date de creation</dt>
              <dd className="mt-1 text-sm text-foreground">
                {formatDate(client.created_at)}
              </dd>
            </div>
            {client.email && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                <dd className="mt-1 text-sm text-foreground">{client.email}</dd>
              </div>
            )}
            {client.phone && (
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Téléphone</dt>
                <dd className="mt-1 text-sm text-foreground">{client.phone}</dd>
              </div>
            )}
            {client.notes && (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-muted-foreground">Notes</dt>
                <dd className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                  {client.notes}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Health Score */}
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <HealthScore score={healthScore} size={100} />
        </CardContent>
      </Card>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            {leadsLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground">CA Contracté</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {formatCurrency(caContracte)}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {leadsLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground">CA Collecté</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {formatCurrency(caCollecte)}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {assignmentsLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground">Membres assignes</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{nbMembers}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {leadsLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground">Nombre de leads</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{nbLeads}</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activité récente</CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityTimeline clientId={client.id} />
        </CardContent>
      </Card>
    </div>
  )
}

export { ClientOverview }
