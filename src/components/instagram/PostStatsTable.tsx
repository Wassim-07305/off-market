import { useMemo } from 'react'
import type { ColumnDef } from '@tanstack/react-table'
import { ExternalLink } from 'lucide-react'
import type { InstagramPostStat } from '@/types/database'
import { useInstagramPostStats } from '@/hooks/useInstagram'
import { DataTable } from '@/components/ui/data-table'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { formatDate, formatPercent } from '@/lib/utils'

interface PostStatsTableProps {
  accountId: string
}

function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toLocaleString('fr-FR')
}

export function PostStatsTable({ accountId }: PostStatsTableProps) {
  const { data: stats, isLoading } = useInstagramPostStats(accountId)

  const columns = useMemo<ColumnDef<InstagramPostStat, unknown>[]>(
    () => [
      {
        accessorKey: 'post_url',
        header: 'URL du post',
        cell: ({ row }) => {
          const url = row.original.post_url
          if (!url) return <span className="text-muted-foreground">-</span>
          return (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-primary hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="max-w-[150px] truncate text-xs">{url}</span>
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          )
        },
      },
      {
        accessorKey: 'likes',
        header: 'Likes',
        cell: ({ row }) => (
          <span className="font-mono text-foreground">{formatNumber(row.original.likes)}</span>
        ),
      },
      {
        accessorKey: 'comments',
        header: 'Commentaires',
        cell: ({ row }) => (
          <span className="font-mono text-foreground">{formatNumber(row.original.comments)}</span>
        ),
      },
      {
        accessorKey: 'shares',
        header: 'Partages',
        cell: ({ row }) => (
          <span className="font-mono text-foreground">{formatNumber(row.original.shares)}</span>
        ),
      },
      {
        accessorKey: 'saves',
        header: 'Saves',
        cell: ({ row }) => (
          <span className="font-mono text-foreground">{formatNumber(row.original.saves)}</span>
        ),
      },
      {
        accessorKey: 'reach',
        header: 'Reach',
        cell: ({ row }) => (
          <span className="font-mono text-foreground">{formatNumber(row.original.reach)}</span>
        ),
      },
      {
        accessorKey: 'impressions',
        header: 'Impressions',
        cell: ({ row }) => (
          <span className="font-mono text-foreground">{formatNumber(row.original.impressions)}</span>
        ),
      },
      {
        accessorKey: 'engagement_rate',
        header: 'Engagement',
        cell: ({ row }) => (
          <span className="font-mono font-medium text-primary">
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
        title="Aucune statistique"
        description="Ajoutez les statistiques d'un post pour ce compte."
      />
    )
  }

  return (
    <DataTable
      columns={columns}
      data={stats}
      pagination
      pageSize={10}
    />
  )
}
