import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, Users, FileText, Film, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import type { GlobalSearchResult } from '@/types/database'
import { cn } from '@/lib/utils'

export function GlobalSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GlobalSearchResult | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  // Search function
  const search = useCallback(async (term: string) => {
    if (term.length < 2) {
      setResults(null)
      setIsOpen(false)
      return
    }
    setLoading(true)
    try {
      const { data } = await supabase.rpc('global_search', { search_term: term })
      setResults(data as unknown as GlobalSearchResult ?? null)
      setIsOpen(true)
    } catch {
      setResults(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced input
  const handleChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (value.length < 2) {
      setResults(null)
      setIsOpen(false)
      return
    }
    debounceRef.current = setTimeout(() => search(value), 300)
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const handleSelect = (type: string, id: string) => {
    setIsOpen(false)
    setQuery('')
    setResults(null)
    if (type === 'client') navigate(`/clients/${id}`)
    else if (type === 'lead') navigate('/leads')
    else if (type === 'social') navigate('/social-content')
  }

  const handleClear = () => {
    setQuery('')
    setResults(null)
    setIsOpen(false)
    inputRef.current?.focus()
  }

  const hasResults =
    results &&
    (results.clients.length > 0 ||
      results.leads.length > 0 ||
      results.social_content.length > 0)

  const statusLabel = (status: string) => {
    return status.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Rechercher clients, leads, contenus..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => {
            if (results && query.length >= 2) setIsOpen(true)
          }}
          className={cn(
            'h-10 w-full rounded-lg border border-border bg-secondary/50 pl-9 pr-9 text-sm text-foreground',
            'placeholder:text-muted-foreground',
            'transition-all duration-200',
            'focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'
          )}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {!query && (
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">
            ⌘K
          </kbd>
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-[400px] overflow-y-auto rounded-lg border border-border bg-card shadow-lg">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center gap-2 px-4 py-6 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Recherche en cours...
            </div>
          )}

          {/* Empty State */}
          {!loading && !hasResults && query.length >= 2 && (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              Aucun resultat pour &laquo; {query} &raquo;
            </div>
          )}

          {/* Results */}
          {!loading && hasResults && (
            <div className="py-1">
              {/* Clients Section */}
              {results.clients.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    Clients
                  </div>
                  {results.clients.map((client) => (
                    <button
                      key={`client-${client.id}`}
                      onClick={() => handleSelect('client', client.id)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-secondary/80"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-foreground">
                          {client.name}
                        </span>
                        {client.email && (
                          <span className="ml-2 truncate text-xs text-muted-foreground">
                            {client.email}
                          </span>
                        )}
                      </div>
                      <span
                        className={cn(
                          'ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                          client.status === 'actif'
                            ? 'bg-emerald-100 text-emerald-700'
                            : client.status === 'inactif'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-gray-100 text-gray-600'
                        )}
                      >
                        {statusLabel(client.status)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Leads Section */}
              {results.leads.length > 0 && (
                <div>
                  {results.clients.length > 0 && (
                    <div className="mx-3 border-t border-border" />
                  )}
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    Leads
                  </div>
                  {results.leads.map((lead) => (
                    <button
                      key={`lead-${lead.id}`}
                      onClick={() => handleSelect('lead', lead.id)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-secondary/80"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="font-medium text-foreground">
                          {lead.name}
                        </span>
                        {lead.email && (
                          <span className="ml-2 truncate text-xs text-muted-foreground">
                            {lead.email}
                          </span>
                        )}
                      </div>
                      <span className="ml-2 shrink-0 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                        {statusLabel(lead.client_status)}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {/* Social Content Section */}
              {results.social_content.length > 0 && (
                <div>
                  {(results.clients.length > 0 || results.leads.length > 0) && (
                    <div className="mx-3 border-t border-border" />
                  )}
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <Film className="h-3.5 w-3.5" />
                    Contenus
                  </div>
                  {results.social_content.map((content) => (
                    <button
                      key={`social-${content.id}`}
                      onClick={() => handleSelect('social', content.id)}
                      className="flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors hover:bg-secondary/80"
                    >
                      <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                        {content.title}
                      </span>
                      <span
                        className={cn(
                          'ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
                          content.status === 'publié'
                            ? 'bg-emerald-100 text-emerald-700'
                            : content.status === 'en_cours'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-amber-100 text-amber-700'
                        )}
                      >
                        {statusLabel(content.status)}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
