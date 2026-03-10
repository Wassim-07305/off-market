import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { InstagramAccountWithRelations } from '@/types/database'
import { DataTable } from '@/components/ui/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Instagram } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const numberFormatter = new Intl.NumberFormat('fr-FR')

interface InstagramAccountsTableProps {
  data: InstagramAccountWithRelations[]
  isLoading: boolean
  onSelect: (id: string) => void
}

export function InstagramAccountsTable({ data, isLoading, onSelect }: InstagramAccountsTableProps) {
  const columns = useMemo<ColumnDef<InstagramAccountWithRelations, unknown>[]>(
    () => [
      {
        accessorKey: 'username',
        header: 'Username',
        cell: ({ row }) => (
          <span className="font-medium text-foreground">@{row.original.username}</span>
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
        accessorKey: 'followers',
        header: 'Abonnés',
        cell: ({ row }) => (
          <span className="font-mono text-foreground">
            {numberFormatter.format(row.original.followers)}
          </span>
        ),
      },
      {
        accessorKey: 'following',
        header: 'Abonnements',
        cell: ({ row }) => (
          <span className="font-mono text-muted-foreground">
            {numberFormatter.format(row.original.following)}
          </span>
        ),
      },
      {
        accessorKey: 'media_count',
        header: 'Publications',
        cell: ({ row }) => (
          <span className="font-mono text-muted-foreground">
            {numberFormatter.format(row.original.media_count)}
          </span>
        ),
      },
      {
        accessorKey: 'last_synced_at',
        header: 'Dernière sync',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {row.original.last_synced_at ? formatDate(row.original.last_synced_at) : '-'}
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
        icon={<Instagram className="h-6 w-6" />}
        title="Aucun compte Instagram"
        description="Ajoutez votre premier compte Instagram pour suivre les performances."
      />
    )
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      pagination={false}
      onRowClick={(row) => onSelect(row.id)}
    />
  )
}
