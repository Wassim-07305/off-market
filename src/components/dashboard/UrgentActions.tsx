import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { AlertTriangle, Users, Phone, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'

interface UrgentItem {
  icon: typeof AlertTriangle
  text: string
  link: string
  warning?: boolean
}

export function UrgentActions() {
  const today = format(new Date(), 'yyyy-MM-dd')

  const { data: urgentItems = [] } = useQuery({
    queryKey: ['dashboard-urgent', today],
    queryFn: async () => {
      const items: UrgentItem[] = []

      // Leads to follow up
      const { data: leadsToRelance } = await supabase
        .from('leads')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'à_relancer')

      const relanceCount = leadsToRelance?.length ?? 0
      if (relanceCount > 0) {
        items.push({
          icon: Users,
          text: `${relanceCount} lead${relanceCount > 1 ? 's' : ''} à relancer`,
          link: '/leads?status=à_relancer',
        })
      }

      // Calls planned today
      const { data: todayCalls } = await supabase
        .from('call_calendar')
        .select('id', { count: 'exact', head: true })
        .eq('date', today)
        .eq('status', 'planifié')

      const callCount = todayCalls?.length ?? 0
      if (callCount > 0) {
        items.push({
          icon: Phone,
          text: `${callCount} call${callCount > 1 ? 's' : ''} prévu${callCount > 1 ? 's' : ''} aujourd'hui`,
          link: '/call-calendar',
        })
      }

      // Overdue payments
      const { data: overdue } = await supabase
        .from('payment_schedules')
        .select('id', { count: 'exact', head: true })
        .lt('due_date', today)
        .eq('is_paid', false)

      const overdueCount = overdue?.length ?? 0
      if (overdueCount > 0) {
        items.push({
          icon: AlertTriangle,
          text: `${overdueCount} paiement${overdueCount > 1 ? 's' : ''} en retard`,
          link: '/finances',
          warning: true,
        })
      }

      return items
    },
    refetchInterval: 120000,
  })

  if (urgentItems.length === 0) {
    return (
      <div className="rounded-2xl border border-border/40 bg-white p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
            <AlertTriangle className="h-4 w-4 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-foreground">Actions urgentes</h3>
        </div>
        <p className="text-sm text-muted-foreground">Aucune action urgente</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border/40 bg-white p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
        </div>
        <h3 className="font-semibold text-foreground">Actions urgentes</h3>
        <span className="ml-auto text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
          {urgentItems.length}
        </span>
      </div>
      <div className="space-y-2">
        {urgentItems.map((item, i) => {
          const Icon = item.icon
          return (
            <Link
              key={i}
              to={item.link}
              className="flex items-center gap-3 rounded-xl p-2.5 text-sm transition-colors hover:bg-muted/50"
            >
              <Icon className={`h-4 w-4 shrink-0 ${item.warning ? 'text-amber-500' : 'text-muted-foreground'}`} />
              <span className="flex-1 text-foreground">{item.text}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
