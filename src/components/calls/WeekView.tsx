import { useMemo } from 'react'
import { startOfWeek, addDays, format, isSameDay, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import type { CallCalendarWithRelations } from '@/types/database'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'
import { CALL_TYPE_COLORS } from '@/lib/constants'
import type { CallType } from '@/lib/constants'

interface WeekViewProps {
  calls: CallCalendarWithRelations[]
  weekStart: Date
  isLoading: boolean
  onCallClick?: (call: CallCalendarWithRelations) => void
}

const TIME_SLOTS = Array.from({ length: 13 }, (_, i) => i + 8) // 8h to 20h

const DAY_LABELS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export function WeekView({ calls, weekStart, isLoading, onCallClick }: WeekViewProps) {
  const weekDays = useMemo(() => {
    const monday = startOfWeek(weekStart, { weekStartsOn: 1 })
    return Array.from({ length: 7 }, (_, i) => addDays(monday, i))
  }, [weekStart])

  const callsByDayAndHour = useMemo(() => {
    const map = new Map<string, CallCalendarWithRelations[]>()
    for (const call of calls) {
      const callDate = parseISO(call.date)
      for (const day of weekDays) {
        if (isSameDay(callDate, day)) {
          const hour = parseInt(call.time.split(':')[0], 10)
          const key = `${format(day, 'yyyy-MM-dd')}-${hour}`
          const existing = map.get(key) ?? []
          existing.push(call)
          map.set(key, existing)
        }
      }
    }
    return map
  }, [calls, weekDays])

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-md" />
        ))}
      </div>
    )
  }

  if (calls.length === 0) {
    return (
      <EmptyState
        title="Aucun call cette semaine"
        description="Planifiez un nouveau call pour le voir apparaître ici."
      />
    )
  }

  const today = new Date()

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <div className="min-w-[640px]">
        {/* Header */}
        <div className="grid grid-cols-[40px_repeat(7,1fr)] border-b border-border bg-secondary/50">
          <div className="px-2 py-3 text-xs font-medium text-muted-foreground" />
          {weekDays.map((day, i) => (
            <div
              key={i}
              className={cn(
                'px-2 py-3 text-center',
                isSameDay(day, today) && 'bg-primary/5'
              )}
            >
              <div className="text-xs font-medium uppercase text-muted-foreground">
                {DAY_LABELS[i]}
              </div>
              <div
                className={cn(
                  'mt-0.5 text-sm font-semibold',
                  isSameDay(day, today) ? 'text-primary' : 'text-foreground'
                )}
              >
                {format(day, 'd', { locale: fr })}
              </div>
            </div>
          ))}
        </div>

        {/* Time slots */}
        {TIME_SLOTS.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-[40px_repeat(7,1fr)] border-b border-border last:border-b-0"
          >
            <div className="flex items-start px-2 py-2 text-xs text-muted-foreground">
              {hour}h00
            </div>
            {weekDays.map((day, dayIndex) => {
              const key = `${format(day, 'yyyy-MM-dd')}-${hour}`
              const slotCalls = callsByDayAndHour.get(key) ?? []
              return (
                <div
                  key={dayIndex}
                  className={cn(
                    'min-h-[48px] border-l border-border px-1 py-1',
                    isSameDay(day, today) && 'bg-primary/5'
                  )}
                >
                  {slotCalls.map((call) => (
                    <button
                      key={call.id}
                      type="button"
                      onClick={() => onCallClick?.(call)}
                      className={cn(
                        'mb-1 w-full rounded px-2 py-1 text-left text-xs transition-opacity hover:opacity-80 cursor-pointer',
                        CALL_TYPE_COLORS[call.type as CallType]
                      )}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate font-medium">
                          {call.type === 'iclosed' && (
                            <span className="mr-1 inline-flex items-center justify-center rounded bg-blue-600 px-1 py-px text-[8px] font-bold text-white leading-none">iC</span>
                          )}
                          {call.time.slice(0, 5)}
                        </span>
                        <span
                          className={cn(
                            'inline-block h-1.5 w-1.5 rounded-full',
                            call.status === 'réalisé'
                              ? 'bg-green-500'
                              : call.status === 'no_show'
                                ? 'bg-red-500'
                                : call.status === 'annulé'
                                  ? 'bg-gray-400'
                                  : call.status === 'reporté'
                                    ? 'bg-orange-500'
                                    : 'bg-blue-500'
                          )}
                        />
                      </div>
                      <div className="truncate text-[10px] opacity-80">
                        {call.client?.name ?? call.lead?.name ?? 'Sans client'}
                      </div>
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
