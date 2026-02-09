import { useState } from 'react'
import { Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNotificationStore } from '@/stores/notification-store'
import { NotificationDropdown } from './NotificationDropdown'

export function NotificationBell() {
  const { unreadCount } = useNotificationStore()
  const [open, setOpen] = useState(false)

  const toggleDropdown = () => {
    setOpen((prev) => !prev)
  }

  const closeDropdown = () => {
    setOpen(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggleDropdown}
        className={cn(
          'relative rounded-md p-2 text-muted-foreground',
          'transition-colors duration-200',
          'hover:bg-secondary hover:text-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          'cursor-pointer'
        )}
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <NotificationDropdown open={open} onClose={closeDropdown} />
    </div>
  )
}
