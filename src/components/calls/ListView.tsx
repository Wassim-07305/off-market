import type { CallCalendarWithRelations } from '@/types/database'
import { useUpdateCall } from '@/hooks/useCallCalendar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { cn, formatDate } from '@/lib/utils'
import {
  CALL_TYPE_COLORS,
  CALL_TYPE_LABELS,
  CALL_STATUSES,
  CALL_STATUS_COLORS,
  CALL_STATUS_LABELS,
} from '@/lib/constants'
import type { CallType, CallStatus } from '@/lib/constants'
import { ExternalLink } from 'lucide-react'

interface ListViewProps {
  calls: CallCalendarWithRelations[]
  isLoading: boolean
  onCallClick?: (call: CallCalendarWithRelations) => void
}

export function ListView({ calls, isLoading, onCallClick }: ListViewProps) {
  const updateCall = useUpdateCall()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full rounded-md" />
        ))}
      </div>
    )
  }

  if (calls.length === 0) {
    return (
      <EmptyState
        title="Aucun call"
        description="Aucun call ne correspond à vos critères."
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
              Heure
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Client
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Lead
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Type
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Statut
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Lien
            </th>
          </tr>
        </thead>
        <tbody>
          {calls.map((call) => (
            <tr
              key={call.id}
              className="border-b border-border transition-colors hover:bg-secondary/30 cursor-pointer"
              onClick={() => onCallClick?.(call)}
            >
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {formatDate(call.date)}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-foreground">
                {call.time.slice(0, 5)}
              </td>
              <td className="px-4 py-3 text-sm text-foreground">
                {call.client?.name ?? '-'}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {call.lead?.name ?? '-'}
              </td>
              <td className="px-4 py-3">
                <Badge className={CALL_TYPE_COLORS[call.type as CallType]}>
                  {CALL_TYPE_LABELS[call.type as CallType]}
                </Badge>
              </td>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                <select
                  value={call.status}
                  onChange={(e) => {
                    updateCall.mutate({
                      id: call.id,
                      status: e.target.value as CallStatus,
                    })
                  }}
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs font-medium border-0 cursor-pointer',
                    'focus:outline-none focus:ring-2 focus:ring-ring',
                    CALL_STATUS_COLORS[call.status as CallStatus]
                  )}
                >
                  {CALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {CALL_STATUS_LABELS[s]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                {call.link ? (
                  <a
                    href={call.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Lien
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
