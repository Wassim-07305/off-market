import { useState, useCallback, useRef, useEffect } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { useSearchMessages } from '@/hooks/useMessages'
import type { MessageWithSender } from '@/types/database'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface MessageSearchProps {
  channelId: string
  onClose: () => void
  onSelectMessage?: (messageId: string) => void
}

export function MessageSearch({ channelId, onClose, onSelectMessage }: MessageSearchProps) {
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleChange = useCallback((value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedQuery(value)
    }, 300)
  }, [])

  const { data, isLoading } = useSearchMessages(channelId, debouncedQuery)
  const results = data?.pages.flatMap((p) => p.data) ?? []

  const handleSelect = useCallback((msg: MessageWithSender) => {
    onSelectMessage?.(msg.id)
    onClose()
  }, [onSelectMessage, onClose])

  const highlightMatch = useCallback((text: string, search: string) => {
    if (!search.trim() || !text) return text
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)
    return parts.map((part, i) =>
      regex.test(part)
        ? <mark key={i} className="bg-primary/20 text-primary rounded-sm px-0.5">{part}</mark>
        : part
    )
  }, [])

  return (
    <div className="flex flex-col border-b border-border bg-white">
      {/* Search input */}
      <div className="flex items-center gap-2 px-4 py-2">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="Rechercher dans les messages..."
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        <button
          onClick={onClose}
          className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Results */}
      {debouncedQuery.trim() && (
        <div className="max-h-64 overflow-y-auto border-t border-border/50">
          {results.length === 0 && !isLoading ? (
            <p className="px-4 py-3 text-center text-xs text-muted-foreground">
              Aucun résultat pour « {debouncedQuery} »
            </p>
          ) : (
            <div className="divide-y divide-border/30">
              {results.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => handleSelect(msg)}
                  className={cn(
                    'flex w-full flex-col gap-0.5 px-4 py-2.5 text-left transition-colors',
                    'hover:bg-muted/50'
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium text-foreground">
                      {msg.sender?.full_name ?? 'Inconnu'}
                    </span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">
                      {format(new Date(msg.created_at), 'd MMM, HH:mm', { locale: fr })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {highlightMatch(msg.content ?? '', debouncedQuery)}
                  </p>
                </button>
              ))}
            </div>
          )}

          {results.length > 0 && (
            <p className="px-4 py-1.5 text-center text-[10px] text-muted-foreground/60">
              {results.length} résultat{results.length > 1 ? 's' : ''}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
