import { useMemo } from 'react'
import { Wallet } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { FinancialEntry, PaymentSchedule } from '@/types/database'
import { useFinancialEntries, useFinanceStats, usePaymentSchedules } from '@/hooks/useFinances'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { FINANCIAL_TYPE_LABELS } from '@/lib/constants'
import type { FinancialType } from '@/lib/constants'
import { cn, formatCurrency, formatDate } from '@/lib/utils'

interface ClientFinancesProps {
  clientId: string
}

function ClientFinances({ clientId }: ClientFinancesProps) {
  const { data: entriesData, isLoading: entriesLoading } = useFinancialEntries({ client_id: clientId })
  const { data: stats, isLoading: statsLoading } = useFinanceStats(clientId)
  const { data: schedules, isLoading: schedulesLoading } = usePaymentSchedules(clientId)

  const entries = entriesData?.data ?? []

  const entryColumns = useMemo<ColumnDef<FinancialEntry & { client?: { id: string; name: string } }, unknown>[]>(
    () => [
      {
        accessorKey: 'date',
        header: 'Date',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm text-foreground">{formatDate(row.original.date)}</span>
        ),
      },
      {
        accessorKey: 'label',
        header: 'Libelle',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.label}</span>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        enableSorting: true,
        cell: ({ row }) => {
          const type = row.original.type as FinancialType
          return (
            <Badge variant="secondary">
              {FINANCIAL_TYPE_LABELS[type]}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'amount',
        header: 'Montant',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">
            {formatCurrency(Number(row.original.amount))}
          </span>
        ),
      },
      {
        accessorKey: 'is_paid',
        header: 'Paye',
        enableSorting: true,
        cell: ({ row }) => (
          <Badge
            className={cn(
              row.original.is_paid
                ? 'bg-green-100 text-green-700'
                : 'bg-orange-100 text-orange-700'
            )}
          >
            {row.original.is_paid ? 'Oui' : 'Non'}
          </Badge>
        ),
      },
    ],
    []
  )

  const scheduleColumns = useMemo<ColumnDef<PaymentSchedule & { client?: { id: string; name: string } }, unknown>[]>(
    () => [
      {
        accessorKey: 'due_date',
        header: 'Echeance',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm text-foreground">{formatDate(row.original.due_date)}</span>
        ),
      },
      {
        accessorKey: 'amount',
        header: 'Montant',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">
            {formatCurrency(Number(row.original.amount))}
          </span>
        ),
      },
      {
        accessorKey: 'is_paid',
        header: 'Paye',
        enableSorting: true,
        cell: ({ row }) => (
          <Badge
            className={cn(
              row.original.is_paid
                ? 'bg-green-100 text-green-700'
                : 'bg-orange-100 text-orange-700'
            )}
          >
            {row.original.is_paid ? 'Oui' : 'Non'}
          </Badge>
        ),
      },
      {
        accessorKey: 'paid_at',
        header: 'Date paiement',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.paid_at ? formatDate(row.original.paid_at) : '-'}
          </span>
        ),
      },
    ],
    []
  )

  if (entriesLoading && statsLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            {statsLoading ? (
              <Skeleton className="h-12 w-full" />
            ) : (
              <>
                <p className="text-sm font-medium text-muted-foreground">CA</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {formatCurrency(stats?.ca ?? 0)}
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
                <p className="text-sm font-medium text-muted-foreground">Recurrent</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {formatCurrency(stats?.récurrent ?? 0)}
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
                <p className="text-sm font-medium text-muted-foreground">Charges</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {formatCurrency(stats?.charges ?? 0)}
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
                <p className="text-sm font-medium text-muted-foreground">Marge</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  {(stats?.marge ?? 0).toFixed(1)}%
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Financial Entries Table */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-foreground">Entrees financieres</h3>
        {entries.length === 0 ? (
          <EmptyState
            icon={<Wallet className="h-6 w-6" />}
            title="Aucune entree financiere"
            description="Aucune entree financiere pour ce client."
          />
        ) : (
          <DataTable columns={entryColumns} data={entries} pagination pageSize={10} />
        )}
      </div>

      {/* Payment Schedules */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-foreground">Echeancier de paiement</h3>
        {schedulesLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !schedules || schedules.length === 0 ? (
          <EmptyState
            icon={<Wallet className="h-6 w-6" />}
            title="Aucune echeance"
            description="Aucune echeance de paiement pour ce client."
          />
        ) : (
          <DataTable columns={scheduleColumns} data={schedules} pagination pageSize={10} />
        )}
      </div>
    </div>
  )
}

export { ClientFinances }
