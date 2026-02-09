import { Bell, User, LogOut, Menu } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useNotificationStore } from '@/stores/notification-store'
import { useUIStore } from '@/stores/ui-store'
import { Avatar } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { GlobalSearch } from './GlobalSearch'

export function Header() {
  const { profile, signOut } = useAuth()
  const { unreadCount } = useNotificationStore()
  const { toggleMobileSidebar, setNotificationsPanelOpen } = useUIStore()
  const navigate = useNavigate()

  return (
    <header className="flex h-16 items-center justify-between border-b border-border/40 bg-white/80 px-4 backdrop-blur-sm md:px-6">
      {/* Left: Hamburger (mobile) + Breadcrumb */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Breadcrumb />
      </div>

      {/* Center: Global Search */}
      <div className="hidden flex-1 justify-center px-8 md:flex">
        <GlobalSearch />
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <button
          onClick={() => setNotificationsPanelOpen(true)}
          className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* User dropdown */}
        <DropdownMenu
          align="right"
          trigger={
            <button className="flex items-center gap-2 rounded-xl p-1.5 transition-colors hover:bg-secondary">
              <Avatar
                src={profile?.avatar_url}
                name={profile?.full_name ?? 'Utilisateur'}
                size="sm"
              />
            </button>
          }
        >
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">
                {profile?.full_name ?? 'Utilisateur'}
              </span>
              <span className="text-xs text-muted-foreground">
                {profile?.email ?? ''}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            icon={<User className="h-4 w-4" />}
            onClick={() => navigate('/profile')}
          >
            Mon profil
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            icon={<LogOut className="h-4 w-4" />}
            destructive
            onClick={signOut}
          >
            Déconnexion
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
    </header>
  )
}
