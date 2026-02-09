import { useMemo, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { FinancialEntry } from '@/types/database'
import { useUpdateFinancialEntry } from '@/hooks/useFinances'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { formatCurrency, formatDate } from '@/lib/utils'
import { FINANCIAL_TYPE_LABELS } from '@/lib/constants'
import type { FinancialType } from '@/lib/constants'

type FinancialEntryWithClient = FinancialEntry & { client?: { id: string; name: string } }

interface FinanceEntriesTableProps {
  data: FinancialEntryWithClient[]
  isLoading: boolean
}

const TYPE_BADGE_VARIANTS: Record<FinancialType, 'default' | 'success' | 'warning' | 'destructive' | 'secondary'> = {
  ca: 'success',
  récurrent: 'default',
  charge: 'warning',
  prestataire: 'destructive',
}

function PaidCheckbox({ entry }: { entry: FinancialEntryWithClient }) {
  const updateMutation = useUpdateFinancialEntry()

  const handleToggle = useCallback(() => {
    updateMutation.mutate({ id: entry.id, is_paid: !entry.is_paid })
  }, [entry.id, entry.is_paid, updateMutation])

  return (
    <Checkbox
      checked={entry.is_paid}
      onChange={handleToggle}
    />
  )
}

export function FinanceEntriesTable({ data, isLoading }: FinanceEntriesTableProps) {
  const columns = useMemo<ColumnDef<FinancialEntryWithClient, unknown>[]>(
    () => [
      {
        accessorKey: 'label',
        header: 'Libellé',
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.label}</span>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => {
          const type = row.original.type as FinancialType
          return (
            <Badge variant={TYPE_BADGE_VARIANTS[type] ?? 'secondary'}>
              {FINANCIAL_TYPE_LABELS[type] ?? type}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'amount',
        header: 'Montant',
        cell: ({ row }) => (
          <span className="font-mono font-medium text-foreground">
            {formatCurrency(Number(row.original.amount))}
          </span>
        ),
      },
      {
        accessorKey: 'client.name',
        header: 'Client',
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.client?.name ?? '-'}
          </span>
        ),
      },
      {
        accessorKey: 'prestataire',
        header: 'Prestataire',
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {row.original.prestataire || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'is_paid',
        header: 'Payé',
        enableSorting: false,
        cell: ({ row }) => <PaidCheckbox entry={row.original} />,
      },
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {formatDate(row.original.date)}
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
        title="Aucune entrée financière"
        description="Ajoutez votre première entrée financière."
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
