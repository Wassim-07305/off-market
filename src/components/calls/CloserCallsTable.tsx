import { ExternalLink, Pencil, Trash2 } from 'lucide-react'
import type { CloserCallWithRelations } from '@/types/database'
import { useUpdateCloserCall } from '@/hooks/useCloserCalls'

import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import { CLOSER_CALL_STATUSES } from '@/lib/constants'
import type { CloserCallStatus } from '@/lib/constants'

interface CloserCallsTableProps {
  data: CloserCallWithRelations[]
  isLoading: boolean
  onEdit?: (call: CloserCallWithRelations) => void
  onDelete?: (id: string) => void
}

const statusLabels: Record<CloserCallStatus, string> = {
  closé: 'Closé',
  non_closé: 'Non closé',
}

const statusColors: Record<CloserCallStatus, string> = {
  closé: 'bg-green-100 text-green-700',
  non_closé: 'bg-red-100 text-red-700',
}

export function CloserCallsTable({ data, isLoading, onEdit, onDelete }: CloserCallsTableProps) {
  const updateCloserCall = useUpdateCloserCall()

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
        title="Aucun closer call"
        description="Aucun closer call ne correspond à vos critères."
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
              Lead
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Closer
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Statut
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Revenue
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Paiements
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Lien
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Debrief
            </th>
            <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground" />
          </tr>
        </thead>
        <tbody>
          {data.map((call) => (
            <tr
              key={call.id}
              className="border-b border-border transition-colors hover:bg-secondary/30"
            >
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {formatDate(call.date)}
              </td>
              <td className="px-4 py-3 text-sm font-medium text-foreground">
                {call.client?.name ?? '-'}
              </td>
              <td className="px-4 py-3 text-sm text-muted-foreground">
                {call.lead?.name ?? '-'}
              </td>
              <td className="px-4 py-3 text-sm text-foreground">
                {call.closer?.full_name ?? '-'}
              </td>
              <td className="px-4 py-3">
                <select
                  value={call.status}
                  onChange={(e) => {
                    updateCloserCall.mutate({
                      id: call.id,
                      status: e.target.value as CloserCallStatus,
                    })
                  }}
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-xs font-medium border-0 cursor-pointer',
                    'focus:outline-none focus:ring-2 focus:ring-ring',
                    statusColors[call.status as CloserCallStatus]
                  )}
                >
                  {CLOSER_CALL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {statusLabels[s]}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-3 text-sm font-mono text-foreground">
                {formatCurrency(call.revenue)}
              </td>
              <td className="px-4 py-3 text-sm text-center text-foreground">
                {call.nombre_paiements}
              </td>
              <td className="px-4 py-3">
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
              <td className="max-w-[200px] px-4 py-3">
                <span className="truncate text-sm text-muted-foreground">
                  {call.debrief || '-'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(call)}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm('Supprimer ce closer call ?')) {
                          onDelete(call.id)
                        }
                      }}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
