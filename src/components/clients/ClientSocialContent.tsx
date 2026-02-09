import { useMemo } from 'react'
import { Film } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { SocialContent } from '@/types/database'
import { useSocialContent } from '@/hooks/useSocialContent'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { SOCIAL_STATUS_LABELS } from '@/lib/constants'
import type { SocialStatus } from '@/lib/constants'
import { cn, formatDate } from '@/lib/utils'

interface ClientSocialContentProps {
  clientId: string
}

const SOCIAL_STATUS_COLORS: Record<SocialStatus, string> = {
  'à_tourner': 'bg-orange-100 text-orange-700',
  'idée': 'bg-gray-100 text-gray-600',
  'en_cours': 'bg-blue-100 text-blue-700',
  'publié': 'bg-green-100 text-green-700',
  'reporté': 'bg-red-100 text-red-700',
}

type SocialContentWithClient = SocialContent & { client?: { id: string; name: string } }

function ClientSocialContent({ clientId }: ClientSocialContentProps) {
  const { data: content, isLoading } = useSocialContent({ client_id: clientId })

  const columns = useMemo<ColumnDef<SocialContentWithClient, unknown>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Titre',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.title}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Statut',
        enableSorting: true,
        cell: ({ row }) => {
          const status = row.original.status as SocialStatus
          return (
            <Badge className={cn(SOCIAL_STATUS_COLORS[status])}>
              {SOCIAL_STATUS_LABELS[status]}
            </Badge>
          )
        },
      },
      {
        accessorKey: 'format',
        header: 'Format',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm text-foreground">
            {row.original.format
              ? row.original.format.charAt(0).toUpperCase() + row.original.format.slice(1)
              : '-'}
          </span>
        ),
      },
      {
        accessorKey: 'is_validated',
        header: 'Valide',
        enableSorting: true,
        cell: ({ row }) => (
          <div className="flex items-center">
            <div
              className={cn(
                'h-4 w-4 rounded-sm border',
                row.original.is_validated
                  ? 'border-primary bg-primary'
                  : 'border-border bg-background'
              )}
            >
              {row.original.is_validated && (
                <svg
                  className="h-4 w-4 text-primary-foreground"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M4 8l3 3 5-6" />
                </svg>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'planned_date',
        header: 'Date prevue',
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.planned_date ? formatDate(row.original.planned_date) : '-'}
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

  if (!content || content.length === 0) {
    return (
      <EmptyState
        icon={<Film className="h-6 w-6" />}
        title="Aucun contenu social"
        description="Aucun contenu social pour ce client."
      />
    )
  }

  return (
    <DataTable
      columns={columns}
      data={content}
      pagination
      pageSize={10}
    />
  )
}

export { ClientSocialContent }
