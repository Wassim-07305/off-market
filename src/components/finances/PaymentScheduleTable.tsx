import { useMemo, useCallback } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { PaymentSchedule } from '@/types/database'
import { useUpdatePaymentSchedule } from '@/hooks/useFinances'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { formatCurrency, formatDate } from '@/lib/utils'

type PaymentScheduleWithClient = PaymentSchedule & { client?: { id: string; name: string } }

interface PaymentScheduleTableProps {
  data: PaymentScheduleWithClient[]
  isLoading: boolean
}

function getScheduleStatus(item: PaymentScheduleWithClient): { label: string; variant: 'success' | 'warning' | 'destructive' } {
  if (item.is_paid) {
    return { label: 'Payé', variant: 'success' }
  }
  const dueDate = new Date(item.due_date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (dueDate < today) {
    return { label: 'En retard', variant: 'destructive' }
  }

  const sevenDaysFromNow = new Date(today)
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7)

  if (dueDate <= sevenDaysFromNow) {
    return { label: 'Bientôt', variant: 'warning' }
  }

  return { label: 'À venir', variant: 'warning' }
}

function PaidCheckbox({ item }: { item: PaymentScheduleWithClient }) {
  const updateMutation = useUpdatePaymentSchedule()

  const handleToggle = useCallback(() => {
    const updates: Partial<PaymentSchedule> & { id: string } = {
      id: item.id,
      is_paid: !item.is_paid,
    }
    if (!item.is_paid) {
      updates.paid_at = new Date().toISOString()
    } else {
      updates.paid_at = null
    }
    updateMutation.mutate(updates)
  }, [item.id, item.is_paid, updateMutation])

  return (
    <Checkbox
      checked={item.is_paid}
      onChange={handleToggle}
    />
  )
}

export function PaymentScheduleTable({ data, isLoading }: PaymentScheduleTableProps) {
  const columns = useMemo<ColumnDef<PaymentScheduleWithClient, unknown>[]>(
    () => [
      {
        accessorKey: 'client.name',
        header: 'Client',
        cell: ({ row }) => (
          <span className="text-foreground">
            {row.original.client?.name ?? '-'}
          </span>
        ),
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
        accessorKey: 'due_date',
        header: "Date d'échéance",
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {formatDate(row.original.due_date)}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Statut',
        cell: ({ row }) => {
          const status = getScheduleStatus(row.original)
          return <Badge variant={status.variant}>{status.label}</Badge>
        },
      },
      {
        accessorKey: 'is_paid',
        header: 'Payé',
        enableSorting: false,
        cell: ({ row }) => <PaidCheckbox item={row.original} />,
      },
      {
        accessorKey: 'paid_at',
        header: 'Date de paiement',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {row.original.paid_at ? formatDate(row.original.paid_at) : '-'}
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
        title="Aucun échéancier"
        description="Ajoutez votre premier échéancier de paiement."
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
