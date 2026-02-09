import { cn } from '@/lib/utils'
import {
  startOfDay, endOfDay,
  startOfWeek, endOfWeek,
  startOfMonth, endOfMonth,
  startOfQuarter, endOfQuarter,
  startOfYear, endOfYear,
  format,
} from 'date-fns'
import { fr } from 'date-fns/locale'

export type TimePeriod = 'day' | 'week' | 'month' | 'quarter' | 'year'

const PERIOD_LABELS: Record<TimePeriod, string> = {
  day: 'Jour',
  week: 'Semaine',
  month: 'Mois',
  quarter: 'Trimestre',
  year: 'Année',
}

interface TimeFilterProps {
  value: TimePeriod
  onChange: (period: TimePeriod) => void
  className?: string
}

export function TimeFilter({ value, onChange, className }: TimeFilterProps) {
  return (
    <div className={cn('inline-flex items-center rounded-xl bg-muted p-1 gap-0.5', className)}>
      {(Object.keys(PERIOD_LABELS) as TimePeriod[]).map((period) => (
        <button
          key={period}
          onClick={() => onChange(period)}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200',
            value === period
              ? 'bg-white text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          {PERIOD_LABELS[period]}
        </button>
      ))}
    </div>
  )
}

export function getDateRange(period: TimePeriod): { from: string; to: string } {
  const now = new Date()
  let from: Date
  let to: Date

  switch (period) {
    case 'day':
      from = startOfDay(now)
      to = endOfDay(now)
      break
    case 'week':
      from = startOfWeek(now, { locale: fr, weekStartsOn: 1 })
      to = endOfWeek(now, { locale: fr, weekStartsOn: 1 })
      break
    case 'month':
      from = startOfMonth(now)
      to = endOfMonth(now)
      break
    case 'quarter':
      from = startOfQuarter(now)
      to = endOfQuarter(now)
      break
    case 'year':
      from = startOfYear(now)
      to = endOfYear(now)
      break
  }

  return {
    from: format(from, 'yyyy-MM-dd'),
    to: format(to, 'yyyy-MM-dd'),
  }
}
