import { ArrowLeft, Hash, Settings } from 'lucide-react'
import type { ChannelWithDetails } from '@/types/database'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ChannelHeaderProps {
  channel: ChannelWithDetails
  onBack: () => void
  onSettings?: () => void
  showBack?: boolean
}

export function ChannelHeader({ channel, onBack, onSettings, showBack = false }: ChannelHeaderProps) {
  const displayName =
    channel.type === 'direct' && channel.other_member
      ? channel.other_member.full_name
      : channel.name

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex h-14 items-center gap-3 border-b border-border bg-white px-4">
      {showBack && (
        <button
          type="button"
          onClick={onBack}
          className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}

      {channel.type === 'direct' ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
          {channel.other_member?.avatar_url ? (
            <img
              src={channel.other_member.avatar_url}
              alt={displayName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <Hash className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-semibold text-foreground">{displayName}</h2>
        <p className="truncate text-xs text-muted-foreground">
          {channel.type === 'direct' ? 'Message direct' : `${channel.member_count} membres`}
        </p>
      </div>

      {onSettings && channel.type === 'group' && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onSettings}
          icon={<Settings className="h-4 w-4" />}
          className={cn('shrink-0')}
        >
          <span className="sr-only">Paramètres</span>
        </Button>
      )}
    </div>
  )
}
