import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Search,
  LayoutDashboard,
  Users,
  Target,
  Calendar,
  MessageCircle,
  GraduationCap,
  DollarSign,
  Activity,
  Plus,
  Phone,
} from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { useRole } from '@/hooks/useRole'
import { canAccess } from '@/lib/permissions'
import type { Module } from '@/lib/permissions'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import type { GlobalSearchResult } from '@/types/database'
import type { LucideIcon } from 'lucide-react'

interface CommandItem {
  id: string
  label: string
  icon: LucideIcon
  action: () => void
  group: string
  module?: Module
}

export function CommandPalette() {
  const { commandPaletteOpen, setCommandPaletteOpen } = useUIStore()
  const { role } = useRole()
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [searchResults, setSearchResults] = useState<GlobalSearchResult | null>(null)
  const [searching, setSearching] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const close = useCallback(() => {
    setCommandPaletteOpen(false)
    setQuery('')
    setSelectedIndex(0)
    setSearchResults(null)
  }, [setCommandPaletteOpen])

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [commandPaletteOpen, setCommandPaletteOpen])

  // Auto-focus input
  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [commandPaletteOpen])

  // Search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (query.length < 2) {
      setSearchResults(null)
      return
    }
    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await supabase.rpc('global_search', { search_term: query })
        setSearchResults(data as unknown as GlobalSearchResult ?? null)
      } catch {
        setSearchResults(null)
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const go = useCallback((path: string) => {
    navigate(path)
    close()
  }, [navigate, close])

  const navigationItems: CommandItem[] = [
    { id: 'nav-dashboard', label: 'Dashboard', icon: LayoutDashboard, action: () => go('/'), group: 'Navigation', module: 'dashboard' },
    { id: 'nav-messaging', label: 'Messagerie', icon: MessageCircle, action: () => go('/messaging'), group: 'Navigation', module: 'messaging' },
    { id: 'nav-formations', label: 'Formations', icon: GraduationCap, action: () => go('/formations'), group: 'Navigation', module: 'formations' },
    { id: 'nav-eleves', label: 'Élèves', icon: Users, action: () => go('/eleves'), group: 'Navigation', module: 'eleves' },
    { id: 'nav-pipeline', label: 'Pipeline', icon: Target, action: () => go('/pipeline'), group: 'Navigation', module: 'pipeline' },
    { id: 'nav-calendrier', label: 'Calendrier', icon: Calendar, action: () => go('/calendrier'), group: 'Navigation', module: 'calendrier' },
    { id: 'nav-activite', label: 'Activité', icon: Activity, action: () => go('/activite'), group: 'Navigation', module: 'activite' },
    { id: 'nav-finances', label: 'Finances', icon: DollarSign, action: () => go('/finances'), group: 'Navigation', module: 'finances' },
  ]

  const quickActions: CommandItem[] = [
    { id: 'action-lead', label: 'Nouveau lead', icon: Plus, action: () => go('/pipeline?action=new'), group: 'Actions rapides', module: 'pipeline' },
    { id: 'action-call', label: 'Nouveau call', icon: Phone, action: () => go('/calendrier?action=new'), group: 'Actions rapides', module: 'calendrier' },
  ]

  const filteredNavItems = navigationItems.filter(item =>
    (!item.module || canAccess(role, item.module)) &&
    (!query || item.label.toLowerCase().includes(query.toLowerCase()))
  )

  const filteredActions = quickActions.filter(item =>
    (!item.module || canAccess(role, item.module)) &&
    (!query || item.label.toLowerCase().includes(query.toLowerCase()))
  )

  const allItems = [...filteredActions, ...filteredNavItems]

  // Keyboard navigation
  useEffect(() => {
    if (!commandPaletteOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(i => Math.min(i + 1, allItems.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(i => Math.max(i - 1, 0))
      } else if (e.key === 'Enter') {
        e.preventDefault()
        allItems[selectedIndex]?.action()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [commandPaletteOpen, allItems, selectedIndex, close])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          />

          {/* Panel */}
          <motion.div
            className="fixed inset-x-0 top-[20%] z-50 mx-auto w-full max-w-lg"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <div className="mx-4 overflow-hidden rounded-2xl border border-border/40 bg-white shadow-2xl">
              {/* Input */}
              <div className="flex items-center border-b border-border/40 px-4">
                <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Rechercher ou exécuter une action..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="h-14 flex-1 bg-transparent px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                <kbd className="hidden items-center rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground sm:flex">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto p-2">
                {/* Quick Actions */}
                {filteredActions.length > 0 && (
                  <div className="mb-1">
                    <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Actions rapides
                    </p>
                    {filteredActions.map((item, i) => {
                      const Icon = item.icon
                      return (
                        <button
                          key={item.id}
                          onClick={item.action}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                            selectedIndex === i
                              ? 'bg-primary/10 text-primary'
                              : 'text-foreground hover:bg-muted'
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {item.label}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Navigation */}
                {filteredNavItems.length > 0 && (
                  <div className="mb-1">
                    <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      Navigation
                    </p>
                    {filteredNavItems.map((item, i) => {
                      const Icon = item.icon
                      const idx = filteredActions.length + i
                      return (
                        <button
                          key={item.id}
                          onClick={item.action}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                            selectedIndex === idx
                              ? 'bg-primary/10 text-primary'
                              : 'text-foreground hover:bg-muted'
                          )}
                        >
                          <Icon className="h-4 w-4 shrink-0" />
                          {item.label}
                        </button>
                      )
                    })}
                  </div>
                )}

                {/* Search Results */}
                {searchResults && (
                  <>
                    {searchResults.clients.length > 0 && (
                      <div className="mb-1">
                        <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          Clients
                        </p>
                        {searchResults.clients.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => go(`/eleves/${c.id}`)}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                          >
                            <Users className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="truncate">{c.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {searchResults.leads.length > 0 && (
                      <div className="mb-1">
                        <p className="px-2 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                          Leads
                        </p>
                        {searchResults.leads.map((l) => (
                          <button
                            key={l.id}
                            onClick={() => go('/pipeline')}
                            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-muted"
                          >
                            <Target className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span className="truncate">{l.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}

                {searching && (
                  <p className="py-6 text-center text-sm text-muted-foreground">Recherche...</p>
                )}

                {query.length >= 2 && !searching && !searchResults && allItems.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Aucun résultat pour « {query} »
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
