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
        title="Aucune activite"
        description="Enregistrez votre premiere activite pour la voir apparaitre ici."
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
              Messages
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Calls
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Looms
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
              <td className="px-4 py-3">
                <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-0.5 text-sm font-semibold text-primary">
                  {activity.messages_sent}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center justify-center rounded-full bg-blue-100 px-3 py-0.5 text-sm font-semibold text-blue-700">
                  {activity.calls_made}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center justify-center rounded-full bg-purple-100 px-3 py-0.5 text-sm font-semibold text-purple-700">
                  {activity.looms_sent}
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
