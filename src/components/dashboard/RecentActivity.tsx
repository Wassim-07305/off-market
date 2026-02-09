import { Activity, Target, Phone, DollarSign, Send } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useNotificationStore } from '@/stores/notification-store'
import { cn } from '@/lib/utils'

const typeConfig: Record<string, { icon: typeof Activity; color: string }> = {
  lead_status: { icon: Target, color: 'bg-red-50 text-red-600' },
  new_call: { icon: Phone, color: 'bg-blue-50 text-blue-600' },
  call_closed: { icon: DollarSign, color: 'bg-emerald-50 text-emerald-600' },
  general: { icon: Send, color: 'bg-amber-50 text-amber-600' },
}

export function RecentActivity() {
  const { notifications } = useNotificationStore()
  const recentItems = notifications.slice(0, 8)

  return (
    <div className="rounded-2xl border border-border/40 bg-white p-5">
      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4 text-muted-foreground" />
        Activité récente
      </h3>

      {recentItems.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">Aucune activité récente</p>
      ) : (
        <div className="space-y-1">
          {recentItems.map((item) => {
            const config = typeConfig[item.type] ?? typeConfig.general
            const Icon = config.icon

            return (
              <div
                key={item.id}
                className="flex items-start gap-3 rounded-xl p-2.5 transition-colors hover:bg-muted/30"
              >
                <div className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', config.color)}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground truncate">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: fr })}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
