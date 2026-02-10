import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import type { Lead } from '@/types/database'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowRight, Users } from 'lucide-react'
import type { BadgeVariant } from '@/components/ui/badge'

const statusConfig: Record<Lead['status'], { label: string; variant: BadgeVariant }> = {
  'premier_message': { label: 'Premier message', variant: 'secondary' },
  'en_discussion': { label: 'En discussion', variant: 'default' },
  'qualifie': { label: 'Qualifié', variant: 'default' },
  'loom_envoye': { label: 'Loom envoyé', variant: 'warning' },
  'call_planifie': { label: 'Call planifié', variant: 'warning' },
  'close': { label: 'Closé', variant: 'success' },
  'perdu': { label: 'Perdu', variant: 'destructive' },
}

function useRecentLeads() {
  return useQuery({
    queryKey: ['recent-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)

      if (error) throw error
      return data as Lead[]
    },
  })
}

export function RecentLeads() {
  const { data: leads, isLoading } = useRecentLeads()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Leads recents</CardTitle>
          <Link
            to="/pipeline"
            className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Voir tout
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : !leads || leads.length === 0 ? (
          <EmptyState
            icon={<Users className="h-6 w-6" />}
            title="Aucun lead"
            description="Pas encore de leads enregistres."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">Nom</th>
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">Source</th>
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">Statut</th>
                  <th className="pb-3 pr-4 font-medium text-muted-foreground">CA</th>
                  <th className="pb-3 font-medium text-muted-foreground">Date</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => {
                  const status = statusConfig[lead.status]
                  return (
                    <tr
                      key={lead.id}
                      className="border-b border-border last:border-b-0"
                    >
                      <td className="py-3 pr-4 font-medium text-foreground">
                        {lead.name}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground capitalize">
                        {lead.source ?? '-'}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="py-3 pr-4 text-foreground">
                        {formatCurrency(lead.ca_contracté)}
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {formatDate(lead.created_at)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
      {leads && leads.length > 0 && (
        <CardFooter>
          <Link
            to="/pipeline"
            className="text-sm font-medium text-primary hover:underline"
          >
            Voir tous les leads
          </Link>
        </CardFooter>
      )}
    </Card>
  )
}
