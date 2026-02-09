import { useMemo } from 'react'
import { Bell, Check, Target, Phone, Info } from 'lucide-react'
import { isToday, isYesterday, isThisWeek, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Drawer } from '@/components/shared/Drawer'
import { useUIStore } from '@/stores/ui-store'
import { useNotificationStore } from '@/stores/notification-store'
import { useAuth } from '@/hooks/useAuth'
import { useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications'
import { cn } from '@/lib/utils'
import type { Notification } from '@/types/database'

const typeIcons: Record<string, typeof Bell> = {
  lead_status: Target,
  new_call: Phone,
  call_closed: Check,
  general: Info,
}

const typeColors: Record<string, string> = {
  lead_status: 'bg-violet-50 text-violet-600',
  new_call: 'bg-blue-50 text-blue-600',
  call_closed: 'bg-emerald-50 text-emerald-600',
  general: 'bg-slate-50 text-slate-600',
}

function groupByDay(notifications: Notification[]) {
  const groups: { label: string; items: Notification[] }[] = []
  const today: Notification[] = []
  const yesterday: Notification[] = []
  const thisWeek: Notification[] = []
  const older: Notification[] = []

  for (const n of notifications) {
    const date = new Date(n.created_at)
    if (isToday(date)) today.push(n)
    else if (isYesterday(date)) yesterday.push(n)
    else if (isThisWeek(date)) thisWeek.push(n)
    else older.push(n)
  }

  if (today.length > 0) groups.push({ label: "Aujourd'hui", items: today })
  if (yesterday.length > 0) groups.push({ label: 'Hier', items: yesterday })
  if (thisWeek.length > 0) groups.push({ label: 'Cette semaine', items: thisWeek })
  if (older.length > 0) groups.push({ label: 'Plus ancien', items: older })

  return groups
}

export function NotificationsPanel() {
  const { notificationsPanelOpen, setNotificationsPanelOpen } = useUIStore()
  const { notifications, unreadCount } = useNotificationStore()
  const { user } = useAuth()
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  const grouped = useMemo(() => groupByDay(notifications), [notifications])

  const handleMarkAllRead = () => {
    if (user?.id) {
      markAllAsRead.mutate(user.id)
    }
  }

  return (
    <Drawer
      open={notificationsPanelOpen}
      onClose={() => setNotificationsPanelOpen(false)}
      title="Notifications"
    >
      <div className="px-6 py-4">
        {/* Actions */}
        {unreadCount > 0 && (
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </span>
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Tout marquer lu
            </button>
          </div>
        )}

        {/* Grouped notifications */}
        {grouped.length === 0 ? (
          <div className="py-12 text-center">
            <Bell className="mx-auto h-8 w-8 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">Aucune notification</p>
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map((group) => (
              <div key={group.label}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((n) => {
                    const Icon = typeIcons[n.type] ?? Bell
                    const colorClass = typeColors[n.type] ?? typeColors.general

                    return (
                      <div
                        key={n.id}
                        onClick={() => {
                          if (!n.is_read) markAsRead.mutate(n.id)
                        }}
                        className={cn(
                          'flex items-start gap-3 rounded-xl p-3 transition-colors cursor-pointer',
                          !n.is_read ? 'bg-primary/[0.03]' : 'hover:bg-muted/50'
                        )}
                      >
                        <div className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', colorClass)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start gap-2">
                            <p className={cn(
                              'text-sm',
                              !n.is_read ? 'font-semibold text-foreground' : 'text-foreground'
                            )}>
                              {n.title}
                            </p>
                            {!n.is_read && (
                              <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                            )}
                          </div>
                          {n.message && (
                            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                          )}
                          <p className="mt-1 text-[11px] text-muted-foreground">
                            {format(new Date(n.created_at), "HH:mm", { locale: fr })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Drawer>
  )
}
