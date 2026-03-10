import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, Target, MessageCircle, GraduationCap, Menu } from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { useUnreadCount } from '@/hooks/useUnreadCount'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { path: '/', icon: LayoutDashboard, label: 'Accueil' },
  { path: '/pipeline', icon: Target, label: 'Pipeline' },
  { path: '/messaging', icon: MessageCircle, label: 'Messages', badge: true },
  { path: '/formations', icon: GraduationCap, label: 'Formations' },
]

export function MobileBottomNav() {
  const location = useLocation()
  const { toggleMobileSidebar } = useUIStore()
  const unreadMessages = useUnreadCount()

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/40 bg-white/95 backdrop-blur-sm md:hidden dark:bg-slate-900/95 dark:border-slate-700">
      <div className="flex h-16 items-center justify-around px-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.path === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(item.path)
          const Icon = item.icon
          const showBadge = item.badge && unreadMessages > 0

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                'flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className="relative">
                <Icon className={cn('h-5 w-5', isActive && 'drop-shadow-sm')} />
                {showBadge && (
                  <span className="absolute -right-1.5 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-white">
                    {unreadMessages > 99 ? '99+' : unreadMessages}
                  </span>
                )}
              </div>
              <span className={cn('text-[10px] font-medium', isActive && 'font-semibold')}>
                {item.label}
              </span>
            </NavLink>
          )
        })}

        {/* More menu button */}
        <button
          onClick={toggleMobileSidebar}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-muted-foreground transition-colors hover:text-foreground"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] font-medium">Plus</span>
        </button>
      </div>

      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
