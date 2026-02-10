import { useMemo, useState } from 'react'
import { Check, Search, X } from 'lucide-react'
import type { Profile } from '@/types/database'
import { cn, getInitials } from '@/lib/utils'

interface MemberSelectorProps {
  profiles: Profile[]
  selected: string[]
  onChange: (ids: string[]) => void
  excludeIds?: string[]
}

export function MemberSelector({ profiles, selected, onChange, excludeIds = [] }: MemberSelectorProps) {
  const [search, setSearch] = useState('')

  const available = useMemo(() => {
    const excluded = new Set(excludeIds)
    return profiles.filter((p) => !excluded.has(p.id))
  }, [profiles, excludeIds])

  const filtered = useMemo(() => {
    if (!search.trim()) return available
    const q = search.toLowerCase()
    return available.filter(
      (p) => p.full_name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
    )
  }, [available, search])

  const selectedSet = new Set(selected)

  const toggle = (id: string) => {
    if (selectedSet.has(id)) {
      onChange(selected.filter((s) => s !== id))
    } else {
      onChange([...selected, id])
    }
  }

  const selectedProfiles = profiles.filter((p) => selectedSet.has(p.id))

  return (
    <div className="space-y-3">
      {/* Selected chips */}
      {selectedProfiles.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedProfiles.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
            >
              {p.full_name}
              <button
                type="button"
                onClick={() => toggle(p.id)}
                className="ml-0.5 rounded-full p-0.5 hover:bg-primary/20"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un membre..."
          className={cn(
            'h-9 w-full rounded-xl border border-border bg-muted/30 pl-8 pr-3 text-sm',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring'
          )}
        />
      </div>

      {/* List */}
      <div className="max-h-48 overflow-y-auto rounded-xl border border-border">
        {filtered.length === 0 ? (
          <p className="px-3 py-4 text-center text-sm text-muted-foreground">Aucun résultat</p>
        ) : (
          filtered.map((p) => {
            const isSelected = selectedSet.has(p.id)
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => toggle(p.id)}
                className={cn(
                  'flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors',
                  'hover:bg-muted',
                  isSelected && 'bg-primary/5'
                )}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                  {p.avatar_url ? (
                    <img src={p.avatar_url} alt={p.full_name} className="h-8 w-8 rounded-full object-cover" />
                  ) : (
                    getInitials(p.full_name)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">{p.full_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.email}</p>
                </div>
                {isSelected && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
