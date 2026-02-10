import { useCallback } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Target,
  Calendar,
  MessageCircle,
  GraduationCap,
  DollarSign,
  Settings,
  Activity,
  PanelLeftClose,
  PanelLeft,
  LogOut,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'
import { OffMarketLogo } from '@/components/ui/OffMarketLogo'
import { canAccess } from '@/lib/permissions'
import type { Module } from '@/lib/permissions'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { useUIStore } from '@/stores/ui-store'

interface NavItem {
  label: string
  icon: LucideIcon
  path: string
  module: Module
}

interface NavSection {
  label?: string
  items: NavItem[]
}

const NAV_SECTIONS: NavSection[] = [
  {
    items: [
      { label: 'Dashboard', icon: LayoutDashboard, path: '/', module: 'dashboard' },
      { label: 'Messagerie', icon: MessageCircle, path: '/messaging', module: 'messaging' },
      { label: 'Formations', icon: GraduationCap, path: '/formations', module: 'formations' },
      { label: 'Élèves', icon: Users, path: '/eleves', module: 'eleves' },
      { label: 'Pipeline', icon: Target, path: '/pipeline', module: 'pipeline' },
      { label: 'Calendrier', icon: Calendar, path: '/calendrier', module: 'calendrier' },
      { label: 'Activité', icon: Activity, path: '/activite', module: 'activite' },
    ],
  },
  {
    label: 'Gestion',
    items: [
      { label: 'Finances', icon: DollarSign, path: '/finances', module: 'finances' },
      { label: 'Utilisateurs', icon: Settings, path: '/users', module: 'users' },
    ],
  },
]

export function Sidebar() {
  const location = useLocation()
  const { profile, signOut } = useAuth()
  const { role } = useRole()
  const { sidebarCollapsed, toggleSidebar, sidebarMobileOpen, setMobileSidebarOpen } = useUIStore()

  const closeMobile = useCallback(() => {
    setMobileSidebarOpen(false)
  }, [setMobileSidebarOpen])

  const isCollapsed = sidebarCollapsed

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarMobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm md:hidden"
          onClick={closeMobile}
        />
      )}

      <aside
        className={cn(
          'z-30 flex h-screen flex-col border-r border-white/5 bg-gradient-to-b from-[#1a1f36] to-[#151929] transition-all duration-300',
          'fixed left-0 top-0',
          'md:static',
          sidebarMobileOpen ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0',
          'w-64 shrink-0',
          isCollapsed && 'md:w-[72px]'
        )}
      >
        {/* Logo */}
        <div
          className={cn(
            'flex h-16 items-center border-b border-white/5 px-5',
            isCollapsed ? 'md:justify-center md:px-0' : ''
          )}
        >
          <OffMarketLogo
            size={36}
            showText={!isCollapsed}
            textClassName="text-white"
            className={cn(isCollapsed && 'md:justify-center')}
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_SECTIONS.map((section, sIdx) => {
            const visibleItems = section.items.filter((item) => canAccess(role, item.module))
            if (visibleItems.length === 0) return null

            return (
              <div key={sIdx}>
                {/* Section divider & label */}
                {sIdx > 0 && (
                  <div className="mx-2 mt-4 mb-2 border-t border-white/5" />
                )}
                {section.label && !isCollapsed && (
                  <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    {section.label}
                  </p>
                )}

                <div className="space-y-0.5">
                  {visibleItems.map((item) => {
                    const Icon = item.icon
                    const isActive =
                      item.path === '/'
                        ? location.pathname === '/'
                        : location.pathname.startsWith(item.path)

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        title={isCollapsed ? item.label : undefined}
                        onClick={closeMobile}
                        className={cn(
                          'group relative flex items-center rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-200',
                          isActive
                            ? 'bg-red-500/15 text-white'
                            : 'text-slate-400 hover:bg-white/[0.06] hover:text-white',
                          isCollapsed && 'md:justify-center md:px-0'
                        )}
                      >
                        {/* Active indicator bar */}
                        {isActive && (
                          <div className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                        )}

                        <Icon className={cn(
                          'h-[18px] w-[18px] shrink-0 transition-all duration-200',
                          isCollapsed ? '' : 'mr-3',
                          isActive && 'drop-shadow-[0_0_6px_rgba(239,68,68,0.4)]'
                        )} />
                        <span className={cn(
                          isCollapsed && 'md:hidden'
                        )}>
                          {item.label}
                        </span>

                        {/* Tooltip on hover when collapsed */}
                        {isCollapsed && (
                          <span className="pointer-events-none absolute left-full ml-3 hidden rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs font-medium text-white shadow-xl md:group-hover:block">
                            {item.label}
                          </span>
                        )}
                      </NavLink>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden border-t border-white/5 px-3 py-3 md:block">
          <button
            onClick={toggleSidebar}
            className="flex w-full items-center justify-center rounded-xl px-3 py-2 text-sm text-slate-500 transition-all duration-200 hover:bg-white/[0.06] hover:text-slate-300"
            title={isCollapsed ? 'Ouvrir le menu' : 'Réduire le menu'}
          >
            {isCollapsed ? (
              <PanelLeft className="h-5 w-5" />
            ) : (
              <>
                <PanelLeftClose className="h-5 w-5" />
                <span className="ml-3">Réduire</span>
              </>
            )}
          </button>
        </div>

        {/* User profile */}
        <div className="border-t border-white/5 px-3 py-4">
          <div
            className={cn(
              'flex items-center rounded-xl px-3 py-2.5',
              isCollapsed && 'md:justify-center md:px-0'
            )}
          >
            <div className="relative">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-red-500/20 to-red-400/10 text-xs font-semibold text-red-300 ring-2 ring-red-500/10">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  getInitials(profile?.full_name ?? 'U')
                )}
              </div>
              {/* Online indicator */}
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#1a1f36]" />
            </div>
            <div className={cn(
              'ml-3 min-w-0 flex-1',
              isCollapsed && 'md:hidden'
            )}>
              <p className="truncate text-sm font-semibold text-white">
                {profile?.full_name ?? 'Utilisateur'}
              </p>
              <p className="truncate text-xs text-slate-500 capitalize">
                {role ?? ''}
              </p>
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={signOut}
            title={isCollapsed ? 'Déconnexion' : undefined}
            className={cn(
              'mt-1 flex w-full items-center rounded-xl px-3 py-2 text-sm text-slate-500 transition-all duration-200 hover:bg-red-500/10 hover:text-red-400',
              isCollapsed && 'md:justify-center md:px-0'
            )}
          >
            <LogOut className={cn('h-[18px] w-[18px] shrink-0', isCollapsed ? '' : 'mr-3')} />
            <span className={cn(
              isCollapsed && 'md:hidden'
            )}>
              Déconnexion
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}
