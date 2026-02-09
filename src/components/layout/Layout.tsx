import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useUIStore } from '@/stores/ui-store'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { NotificationsPanel } from '@/components/notifications/NotificationsPanel'
import { DemoDataButton } from '@/components/admin/DemoDataButton'

export function Layout() {
  const { setSidebarCollapsed, setMobileSidebarOpen } = useUIStore()
  const location = useLocation()

  // Auto-collapse sidebar on small screens, hide on mobile
  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 767px)')
    const tabletQuery = window.matchMedia('(min-width: 768px) and (max-width: 1023px)')

    const handleChange = () => {
      if (mobileQuery.matches) {
        setSidebarCollapsed(true)
        setMobileSidebarOpen(false)
      } else if (tabletQuery.matches) {
        setSidebarCollapsed(true)
      }
    }

    // Check on mount
    handleChange()

    mobileQuery.addEventListener('change', handleChange)
    tabletQuery.addEventListener('change', handleChange)
    return () => {
      mobileQuery.removeEventListener('change', handleChange)
      tabletQuery.removeEventListener('change', handleChange)
    }
  }, [setSidebarCollapsed, setMobileSidebarOpen])

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header />

        <main className="flex-1 overflow-y-auto p-5 md:p-8 lg:p-10">
          <div className="mx-auto max-w-[1400px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Global overlays */}
      <CommandPalette />
      <NotificationsPanel />
      <DemoDataButton />
    </div>
  )
}
