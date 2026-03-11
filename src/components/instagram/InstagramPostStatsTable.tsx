import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import type { InstagramPostStat } from '@/types/database'
import { useInstagramPostStats } from '@/hooks/useInstagram'
import { DataTable } from '@/components/ui/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { ExternalLink, Image } from 'lucide-react'
import { formatDate, formatPercent } from '@/lib/utils'

const numberFormatter = new Intl.NumberFormat('fr-FR')

interface InstagramPostStatsTableProps {
  accountId: string
}

export function InstagramPostStatsTable({ accountId }: InstagramPostStatsTableProps) {
  const { data: stats, isLoading } = useInstagramPostStats(accountId)

  const columns = useMemo<ColumnDef<InstagramPostStat, unknown>[]>(
    () => [
      {
        accessorKey: 'post_url',
        header: 'URL',
        cell: ({ row }) =>
          row.original.post_url ? (
            <a
              href={row.original.post_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="max-w-[120px] truncate text-sm">Voir</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          ) : (
            <span className="text-muted-foreground">-</span>
          ),
      },
      {
        accessorKey: 'likes',
        header: 'Likes',
        cell: ({ row }) => (
          <span className="font-mono text-foreground">
            {numberFormatter.format(row.original.likes)}
          </span>
        ),
      },
      {
        accessorKey: 'comments',
        header: 'Commentaires',
        cell: ({ row }) => (
          <span className="font-mono text-muted-foreground">
            {numberFormatter.format(row.original.comments)}
          </span>
        ),
      },
      {
        accessorKey: 'shares',
        header: 'Partages',
        cell: ({ row }) => (
          <span className="font-mono text-muted-foreground">
            {numberFormatter.format(row.original.shares)}
          </span>
        ),
      },
      {
        accessorKey: 'saves',
        header: 'Saves',
        cell: ({ row }) => (
          <span className="font-mono text-muted-foreground">
            {numberFormatter.format(row.original.saves)}
          </span>
        ),
      },
      {
        accessorKey: 'reach',
        header: 'Portée',
        cell: ({ row }) => (
          <span className="font-mono text-muted-foreground">
            {numberFormatter.format(row.original.reach)}
          </span>
        ),
      },
      {
        accessorKey: 'impressions',
        header: 'Impressions',
        cell: ({ row }) => (
          <span className="font-mono text-muted-foreground">
            {numberFormatter.format(row.original.impressions)}
          </span>
        ),
      },
      {
        accessorKey: 'engagement_rate',
        header: 'Engagement',
        cell: ({ row }) => (
          <span className="font-mono font-medium text-foreground">
            {formatPercent(Number(row.original.engagement_rate))}
          </span>
        ),
      },
      {
        accessorKey: 'posted_at',
        header: 'Date',
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-xs text-muted-foreground">
            {row.original.posted_at ? formatDate(row.original.posted_at) : '-'}
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

  if (!stats || stats.length === 0) {
    return (
      <EmptyState
        icon={<Image className="h-6 w-6" />}
        title="Aucune statistique de publication"
        description="Les statistiques apparaîtront ici une fois les données synchronisées."
      />
    )
  }

  return (
    <DataTable
      columns={columns}
      data={stats}
      pagination={false}
    />
  )
}
