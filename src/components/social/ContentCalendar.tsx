import { useState, useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  format,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns'
import { fr } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SocialContent } from '@/types/database'

const STATUS_COLORS: Record<string, string> = {
  à_tourner: 'bg-amber-100 text-amber-700',
  idée: 'bg-slate-100 text-slate-600',
  en_cours: 'bg-blue-100 text-blue-700',
  publié: 'bg-emerald-100 text-emerald-700',
  reporté: 'bg-red-100 text-red-700',
}

interface ContentCalendarProps {
  content: SocialContent[]
  onContentClick: (item: SocialContent) => void
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

export function ContentCalendar({ content, onContentClick }: ContentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentMonth])

  const contentByDate = useMemo(() => {
    const map: Record<string, SocialContent[]> = {}
    for (const item of content) {
      if (item.planned_date) {
        const key = item.planned_date
        if (!map[key]) map[key] = []
        map[key].push(item)
      }
    }
    return map
  }, [content])

  return (
    <div className="rounded-2xl border border-border/40 bg-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/40 px-5 py-3">
        <h3 className="text-base font-semibold text-foreground capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Aujourd'hui
          </button>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 border-b border-border/40">
        {WEEKDAYS.map((day) => (
          <div key={day} className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, i) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const dayContent = contentByDate[dateKey] ?? []
          const inMonth = isSameMonth(day, currentMonth)
          const today = isToday(day)

          return (
            <div
              key={i}
              className={cn(
                'min-h-[80px] border-b border-r border-border/20 p-1.5',
                !inMonth && 'bg-muted/20 opacity-40',
                today && 'bg-primary/[0.03]'
              )}
            >
              <span className={cn(
                'inline-flex h-6 w-6 items-center justify-center rounded-full text-xs',
                today ? 'bg-primary text-white font-semibold' : 'text-muted-foreground'
              )}>
                {format(day, 'd')}
              </span>
              <div className="mt-0.5 space-y-0.5">
                {dayContent.slice(0, 3).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onContentClick(item)}
                    className={cn(
                      'w-full truncate rounded-md px-1.5 py-0.5 text-left text-[10px] font-medium transition-opacity hover:opacity-80',
                      STATUS_COLORS[item.status] ?? 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {item.title}
                  </button>
                ))}
                {dayContent.length > 3 && (
                  <p className="px-1 text-[9px] text-muted-foreground">
                    +{dayContent.length - 3} autres
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
