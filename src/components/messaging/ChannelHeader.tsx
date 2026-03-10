import { ArrowLeft, Hash, Settings } from 'lucide-react'
import type { ChannelWithDetails } from '@/types/database'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function isOnline(lastSeenAt: string | null | undefined): boolean {
  if (!lastSeenAt) return false
  const diff = Date.now() - new Date(lastSeenAt).getTime()
  return diff < 5 * 60 * 1000 // actif dans les 5 dernières minutes
}

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

  const otherMemberOnline = channel.type === 'direct' && channel.other_member
    ? isOnline((channel.other_member as Record<string, unknown>).last_seen_at as string | null)
    : false

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
        <div className="relative">
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
          {otherMemberOnline && (
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
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
          {channel.type === 'direct'
            ? otherMemberOnline ? 'En ligne' : 'Message direct'
            : `${channel.member_count} membres`}
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
