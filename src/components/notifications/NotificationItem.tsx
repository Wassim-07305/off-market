import { Bell, Target, Phone, DollarSign } from 'lucide-react'
import { cn, formatRelativeDate } from '@/lib/utils'
import type { Notification } from '@/types/database'

interface NotificationItemProps {
  notification: Notification
  onClick: (notification: Notification) => void
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  general: <Bell className="h-4 w-4" />,
  lead_status: <Target className="h-4 w-4" />,
  new_call: <Phone className="h-4 w-4" />,
  call_closed: <DollarSign className="h-4 w-4" />,
}

const TYPE_ICON_COLORS: Record<string, string> = {
  general: 'bg-gray-100 text-gray-600',
  lead_status: 'bg-blue-100 text-blue-600',
  new_call: 'bg-green-100 text-green-600',
  call_closed: 'bg-yellow-100 text-yellow-600',
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const isUnread = !notification.is_read
  const icon = TYPE_ICONS[notification.type] ?? TYPE_ICONS.general
  const iconColor = TYPE_ICON_COLORS[notification.type] ?? TYPE_ICON_COLORS.general

  return (
    <button
      type="button"
      onClick={() => onClick(notification)}
      className={cn(
        'flex w-full items-start gap-3 px-4 py-3 text-left',
        'transition-colors duration-150',
        'hover:bg-secondary/50',
        'cursor-pointer',
        isUnread ? 'bg-primary/5' : 'bg-transparent'
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          iconColor
        )}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'truncate text-sm',
              isUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground'
            )}
          >
            {notification.title}
          </span>
          {isUnread && (
            <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        {notification.message && (
          <p className="truncate text-xs text-muted-foreground">
            {notification.message}
          </p>
        )}
        <span className="text-xs text-muted-foreground/70">
          {formatRelativeDate(notification.created_at)}
        </span>
      </div>
    </button>
  )
}
