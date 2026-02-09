import { useMemo } from 'react'
import { CalendarDays } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { CallCalendarWithRelations } from '@/types/database'
import { useCallCalendar } from '@/hooks/useCallCalendar'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { CALL_TYPE_COLORS, CALL_STATUS_COLORS } from '@/lib/constants'
import type { CallType, CallStatus } from '@/lib/constants'
import { cn, formatDate } from '@/lib/utils'

interface ClientCalendarProps {
  clientId: string
}

function ClientCalendar({ clientId }: ClientCalendarProps) {
  const { data: calls, isLoading } = useCallCalendar({ client_id: clientId })

  const columns = useMemo<ColumnDef<CallCalendarWithRelations, unknown>[]>(
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
        accessorKey: 'time',
        header: 'Heure',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm text-foreground">{row.original.time}</span>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        enableSorting: true,
        cell: ({ row }) => {
          const type = row.original.type as CallType
          return (
            <Badge className={cn(CALL_TYPE_COLORS[type])}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        enableSorting: true,
        cell: ({ row }) => {
          const status = row.original.status as CallStatus
          return (
            <Badge className={cn(CALL_STATUS_COLORS[status])}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          )
        },
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

  if (!calls || calls.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDays className="h-6 w-6" />}
        title="Aucun call planifie"
        description="Aucun call n'est planifie pour ce client."
      />
    )
  }

  return (
    <DataTable
      columns={columns}
      data={calls}
      pagination
      pageSize={10}
    />
  )
}

export { ClientCalendar }
