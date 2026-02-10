import { useMemo } from 'react'
import { FileText } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { LeadWithRelations } from '@/types/database'
import { useLeadsByClient } from '@/hooks/useLeads'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import {
  LEAD_STATUS_LABELS,
  LEAD_STATUS_COLORS,
} from '@/lib/constants'
import type { LeadStatus } from '@/lib/constants'
import { cn, formatCurrency } from '@/lib/utils'

interface ClientLeadsProps {
  clientId: string
}

function ClientLeads({ clientId }: ClientLeadsProps) {
  const { data: leads, isLoading } = useLeadsByClient(clientId)

  const columns = useMemo<ColumnDef<LeadWithRelations, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nom',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.name}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        enableSorting: true,
        cell: ({ row }) => {
          const status = row.original.status as LeadStatus
          return (
            <Badge className={cn(LEAD_STATUS_COLORS[status])}>
              {LEAD_STATUS_LABELS[status]}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'ca_contracté',
        header: 'CA Contracté',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm text-foreground">
            {formatCurrency(Number(row.original.ca_contracté))}
          </span>
        ),
      },
      {
        accessorKey: 'ca_collecté',
        header: 'CA Collecté',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm text-foreground">
            {formatCurrency(Number(row.original.ca_collecté))}
          </span>
        ),
      },
    ],
    []
  )

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (!leads || leads.length === 0) {
    return (
      <EmptyState
        icon={<FileText className="h-6 w-6" />}
        title="Aucun lead"
        description="Aucun lead n'est associe a ce client."
      />
    )
  }

  return (
    <DataTable
      columns={columns}
      data={leads}
      pagination
      pageSize={10}
    />
  )
}

export { ClientLeads }
