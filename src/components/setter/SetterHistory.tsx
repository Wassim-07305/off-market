import type { SetterActivity } from '@/types/database'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { formatDate } from '@/lib/utils'

interface SetterHistoryProps {
  data: (SetterActivity & {
    client?: { id: string; name: string }
    profile?: { id: string; full_name: string }
  })[]
  isLoading: boolean
}

export function SetterHistory({ data, isLoading }: SetterHistoryProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title="Aucune activité"
        description="Enregistrez votre première activité pour la voir apparaître ici."
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-border bg-secondary/50">
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Date
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Client
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Messages envoyés
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Notes
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((activity) => (
            <tr
              key={activity.id}
              className="border-b border-border transition-colors hover:bg-secondary/30"
            >
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {formatDate(activity.date)}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-foreground">
                {activity.client?.name ?? '-'}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-0.5 text-sm font-semibold text-primary">
                  {activity.messages_sent}
                </span>
              </td>
              <td className="max-w-[300px] px-4 py-3">
                <span className="truncate text-sm text-muted-foreground">
                  {activity.notes || '-'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
