import { useRef, useEffect, useCallback } from 'react'
import { CheckCheck, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNotificationStore } from '@/stores/notification-store'
import { useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications'
import { useAuth } from '@/hooks/useAuth'
import type { Notification } from '@/types/database'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { NotificationItem } from './NotificationItem'

interface NotificationDropdownProps {
  open: boolean
  onClose: () => void
}

export function NotificationDropdown({ open, onClose }: NotificationDropdownProps) {
  const { user } = useAuth()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore()
  const markAsReadMutation = useMarkAsRead()
  const markAllAsReadMutation = useMarkAllAsRead()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const handleClickOutside = useCallback(
    (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    },
    [onClose]
  )

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, handleClickOutside, handleEscape])

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.is_read) {
      markAsRead(notification.id)
      markAsReadMutation.mutate(notification.id)
    }
  }

  const handleMarkAllAsRead = () => {
    if (!user?.id) return
    markAllAsRead()
    markAllAsReadMutation.mutate(user.id)
  }

  if (!open) return null

  return (
    <div
      ref={dropdownRef}
      className={cn(
        'absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-lg border border-border bg-background shadow-xl sm:w-96',
        'animate-in fade-in-0 zoom-in-95'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">
          Notifications
        </h3>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            icon={<CheckCheck className="h-3.5 w-3.5" />}
            onClick={handleMarkAllAsRead}
            className="text-xs"
          >
            Tout marquer comme lu
          </Button>
        )}
      </div>

      {/* Notification list */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-5 w-5" />}
            title="Aucune notification"
            description="Vous êtes à jour."
            className="py-8"
          />
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClick={handleNotificationClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
