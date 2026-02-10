import { useMemo, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import type { ChannelWithDetails } from '@/types/database'
import { useRole } from '@/hooks/useRole'
import { ChannelListItem } from './ChannelListItem'
import { cn } from '@/lib/utils'

interface ChannelListProps {
  channels: ChannelWithDetails[]
  activeChannelId: string | null
  onSelect: (channelId: string) => void
  onCreateChannel: () => void
}

export function ChannelList({ channels, activeChannelId, onSelect, onCreateChannel }: ChannelListProps) {
  const { isAdmin } = useRole()
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return channels
    const q = search.toLowerCase()
    return channels.filter((c) => {
      const name = c.type === 'direct' && c.other_member ? c.other_member.full_name : c.name
      return name.toLowerCase().includes(q)
    })
  }, [channels, search])

  const directChannels = filtered.filter((c) => c.type === 'direct')
  const groupChannels = filtered.filter((c) => c.type === 'group')

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="text-base font-semibold text-foreground">Messages</h2>
        {isAdmin && (
          <button
            type="button"
            onClick={onCreateChannel}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Plus className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className={cn(
              'h-9 w-full rounded-xl border border-border bg-muted/30 pl-8 pr-3 text-sm',
              'placeholder:text-muted-foreground',
              'focus:outline-none focus:ring-2 focus:ring-ring'
            )}
          />
        </div>
      </div>

      {/* Channel lists */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {groupChannels.length > 0 && (
          <div className="mb-1">
            <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Canaux
            </p>
            {groupChannels.map((channel) => (
              <ChannelListItem
                key={channel.id}
                channel={channel}
                isActive={channel.id === activeChannelId}
                onClick={() => onSelect(channel.id)}
              />
            ))}
          </div>
        )}

        {directChannels.length > 0 && (
          <div className="mb-1">
            <p className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Messages directs
            </p>
            {directChannels.map((channel) => (
              <ChannelListItem
                key={channel.id}
                channel={channel}
                isActive={channel.id === activeChannelId}
                onClick={() => onSelect(channel.id)}
              />
            ))}
          </div>
        )}

        {filtered.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            {search ? 'Aucun résultat' : 'Aucune conversation'}
          </p>
        )}
      </div>
    </div>
  )
}
