import { useMemo } from 'react'
import { MessageSquare } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { SetterActivity } from '@/types/database'
import { useSetterActivities } from '@/hooks/useSetterActivities'
import { DataTable } from '@/components/ui/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { formatDate } from '@/lib/utils'

interface ClientSetterActivityProps {
  clientId: string
}

type SetterActivityWithProfile = SetterActivity & {
  profile?: { id: string; full_name: string }
  client?: { id: string; name: string }
}

function ClientSetterActivity({ clientId }: ClientSetterActivityProps) {
  const { data: activities, isLoading } = useSetterActivities({ client_id: clientId })

  const columns = useMemo<ColumnDef<SetterActivityWithProfile, unknown>[]>(
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
        accessorKey: 'profile',
        header: 'Profil',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm text-foreground">
            {row.original.profile?.full_name ?? '-'}
          </span>
        ),
      },
      {
        accessorKey: 'messages_sent',
        header: 'Messages envoyés',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm font-medium text-foreground">
            {row.original.messages_sent}
          </span>
        ),
      },
      {
        accessorKey: 'notes',
        header: 'Notes',
        enableSorting: false,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.notes || '-'}
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

  if (!activities || activities.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquare className="h-6 w-6" />}
        title="Aucune activité setter"
        description="Aucune activité de setter pour ce client."
      />
    )
  }

  return (
    <DataTable
      columns={columns}
      data={activities}
      pagination
      pageSize={10}
    />
  )
}

export { ClientSetterActivity }
