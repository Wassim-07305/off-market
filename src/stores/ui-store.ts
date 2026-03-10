import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Theme = 'light' | 'dark' | 'system'

interface UIState {
  sidebarCollapsed: boolean
  sidebarMobileOpen: boolean
  searchQuery: string
  commandPaletteOpen: boolean
  notificationsPanelOpen: boolean
  keyboardShortcutsOpen: boolean
  theme: Theme
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  toggleMobileSidebar: () => void
  setMobileSidebarOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
  setCommandPaletteOpen: (open: boolean) => void
  setNotificationsPanelOpen: (open: boolean) => void
  setKeyboardShortcutsOpen: (open: boolean) => void
  setTheme: (theme: Theme) => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      sidebarMobileOpen: false,
      searchQuery: '',
      commandPaletteOpen: false,
      notificationsPanelOpen: false,
      keyboardShortcutsOpen: false,
      theme: 'light' as Theme,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      toggleMobileSidebar: () => set((state) => ({ sidebarMobileOpen: !state.sidebarMobileOpen })),
      setMobileSidebarOpen: (open) => set({ sidebarMobileOpen: open }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
      setNotificationsPanelOpen: (open) => set({ notificationsPanelOpen: open }),
      setKeyboardShortcutsOpen: (open) => set({ keyboardShortcutsOpen: open }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-store',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed, theme: state.theme }),
    }
  )
)
