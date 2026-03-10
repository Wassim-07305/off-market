import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { CloserCallWithRelations } from '@/types/database'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { formatCurrency, formatDate } from '@/lib/utils'
import { CLOSER_CALL_STATUS_LABELS } from '@/lib/constants'
import type { CloserCallStatus } from '@/lib/constants'

interface CloserCallsTableProps {
  data: CloserCallWithRelations[]
  isLoading: boolean
}

const STATUS_BADGE_VARIANTS: Record<CloserCallStatus, 'success' | 'destructive'> = {
  closé: 'success',
  non_closé: 'destructive',
}

export function CloserCallsTable({ data, isLoading }: CloserCallsTableProps) {
  const columns = useMemo<ColumnDef<CloserCallWithRelations, unknown>[]>(
    () => [
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {formatDate(row.original.date)}
          </span>
        ),
      },
      {
        accessorKey: 'client.name',
        header: 'Client',
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.client?.name ?? '-'}
          </span>
        ),
      },
      {
        accessorKey: 'lead.name',
        header: 'Lead',
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.lead?.name ?? '-'}
          </span>
        ),
      },
      {
        accessorKey: 'closer_profile.full_name',
        header: 'Closer',
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.closer_profile?.full_name ?? '-'}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        cell: ({ row }) => {
          const status = row.original.status as CloserCallStatus
          return (
            <Badge variant={STATUS_BADGE_VARIANTS[status] ?? 'secondary'}>
              {CLOSER_CALL_STATUS_LABELS[status] ?? status}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'revenue',
        header: 'Revenu',
        cell: ({ row }) => (
          <span className="font-mono font-medium text-foreground">
            {formatCurrency(Number(row.original.revenue))}
          </span>
        ),
      },
      {
        accessorKey: 'nombre_paiements',
        header: 'Paiements',
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.nombre_paiements}x
          </span>
        ),
      },
    ],
    []
  )

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title="Aucun appel closer"
        description="Ajoutez votre premier appel closer."
      />
    )
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      pagination={false}
    />
  )
}
