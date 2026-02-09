import { useMemo } from 'react'
import { Phone } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { CloserCallWithRelations } from '@/types/database'
import { useCloserCalls, useCloserCallStats } from '@/hooks/useCloserCalls'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { cn, formatCurrency, formatDate, formatPercent } from '@/lib/utils'

interface ClientCloserCallsProps {
  clientId: string
}

function ClientCloserCalls({ clientId }: ClientCloserCallsProps) {
  const { data, isLoading } = useCloserCalls({ client_id: clientId })
  const { data: stats, isLoading: statsLoading } = useCloserCallStats({ client_id: clientId })

  const calls = data?.data ?? []

  const columns = useMemo<ColumnDef<CloserCallWithRelations, unknown>[]>(
    () => [
      {
        accessorKey: 'date',
        header: 'Date',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm text-foreground">
            {formatDate(row.original.date)}
          </span>
        ),
      },
      {
        accessorKey: 'lead',
        header: 'Lead',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm text-foreground">
            {row.original.lead?.name ?? '-'}
          </span>
        ),
      },
      {
        accessorKey: 'closer',
        header: 'Closer',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm text-foreground">
            {row.original.closer?.full_name ?? '-'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        enableSorting: true,
        cell: ({ row }) => {
          const status = row.original.status
          return (
            <Badge
              className={cn(
                status === 'closé'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              )}
            >
              {status === 'closé' ? 'Closé' : 'Non closé'}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'revenue',
        header: 'Revenue',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">
            {formatCurrency(Number(row.original.revenue))}
          </span>
        ),
      },
    ],
    []
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            {statsLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground">CA close</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {formatCurrency(stats?.ca_total ?? 0)}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {statsLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground">Nb calls</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {stats?.total ?? 0}
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            {statsLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground">Taux closing</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {formatPercent(stats?.taux_closing ?? 0)}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      {calls.length === 0 ? (
        <EmptyState
          icon={<Phone className="h-6 w-6" />}
          title="Aucun closer call"
          description="Aucun closer call pour ce client."
        />
      ) : (
        <DataTable
          columns={columns}
          data={calls}
          pagination
          pageSize={10}
        />
      )}
    </div>
  )
}

export { ClientCloserCalls }
