import { Hash } from 'lucide-react'
import type { ChannelWithDetails } from '@/types/database'
import { cn, getInitials, formatRelativeDate } from '@/lib/utils'

interface ChannelListItemProps {
  channel: ChannelWithDetails
  isActive: boolean
  onClick: () => void
}

export function ChannelListItem({ channel, isActive, onClick }: ChannelListItemProps) {
  const displayName =
    channel.type === 'direct' && channel.other_member
      ? channel.other_member.full_name
      : channel.name

  const initials = getInitials(displayName)
  const lastMessage = channel.last_message
  const hasUnread = channel.unread_count > 0

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors',
        isActive
          ? 'bg-primary/10 text-foreground'
          : 'text-foreground hover:bg-muted',
      )}
    >
      {/* Avatar */}
      {channel.type === 'direct' ? (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
          {channel.other_member?.avatar_url ? (
            <img
              src={channel.other_member.avatar_url}
              alt={displayName}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
          <Hash className="h-5 w-5 text-muted-foreground" />
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className={cn('truncate text-sm', hasUnread ? 'font-semibold' : 'font-medium')}>
            {displayName}
          </span>
          {lastMessage && (
            <span className="shrink-0 text-[10px] text-muted-foreground">
              {formatRelativeDate(lastMessage.created_at)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className={cn('truncate text-xs', hasUnread ? 'font-medium text-foreground' : 'text-muted-foreground')}>
            {lastMessage
              ? lastMessage.content || 'Fichier joint'
              : 'Aucun message'}
          </p>
          {hasUnread && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
              {channel.unread_count > 99 ? '99+' : channel.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}
