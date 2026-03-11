import { useState, useMemo } from 'react'
import { Pencil, Trash2, SmilePlus } from 'lucide-react'
import type { MessageWithSender } from '@/types/database'
import { cn, getInitials } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAuth } from '@/hooks/useAuth'
import { useMessageReactions, useToggleReaction, groupReactions, REACTION_EMOJIS } from '@/hooks/useMessageReactions'

interface MessageBubbleProps {
  message: MessageWithSender
  isOwn: boolean
  showSender: boolean
  onEdit?: (message: MessageWithSender) => void
  onDelete?: (message: MessageWithSender) => void
}

export function MessageBubble({ message, isOwn, showSender, onEdit, onDelete }: MessageBubbleProps) {
  const { user } = useAuth()
  const [showActions, setShowActions] = useState(false)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

  const { data: reactions } = useMessageReactions(message.id)
  const toggleReaction = useToggleReaction()

  const groupedReactions = useMemo(
    () => groupReactions(reactions ?? [], user?.id),
    [reactions, user?.id]
  )

  const senderName = message.sender?.full_name ?? 'Utilisateur'
  const initials = getInitials(senderName)
  const time = format(new Date(message.created_at), 'HH:mm', { locale: fr })

  const handleReaction = (emoji: string) => {
    toggleReaction.mutate({ messageId: message.id, emoji })
    setShowEmojiPicker(false)
  }

  return (
    <div
      className={cn('group flex gap-2', isOwn ? 'flex-row-reverse' : 'flex-row')}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Avatar */}
      {showSender && !isOwn ? (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
          {message.sender?.avatar_url ? (
            <img
              src={message.sender.avatar_url}
              alt={senderName}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
      ) : !isOwn ? (
        <div className="w-8 shrink-0" />
      ) : null}

      {/* Message content */}
      <div className={cn('flex max-w-[75%] flex-col', isOwn ? 'items-end' : 'items-start')}>
        {showSender && !isOwn && (
          <span className="mb-0.5 px-1 text-xs font-medium text-muted-foreground">{senderName}</span>
        )}

        <div className="relative flex items-center gap-1">
          {/* Actions (shown on hover) */}
          {showActions && (
            <div className={cn('flex items-center gap-0.5', isOwn ? 'order-first' : 'order-last')}>
              {/* Emoji reaction button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <SmilePlus className="h-3.5 w-3.5" />
                </button>
                {showEmojiPicker && (
                  <div
                    className={cn(
                      'absolute z-10 flex gap-1 rounded-lg border border-border bg-white p-1.5 shadow-lg',
                      isOwn ? 'right-0' : 'left-0',
                      'bottom-full mb-1'
                    )}
                  >
                    {REACTION_EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(emoji)}
                        className="rounded p-1 text-base transition-transform hover:scale-125 hover:bg-muted"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {isOwn && onEdit && message.content && (
                <button
                  type="button"
                  onClick={() => onEdit(message)}
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              {isOwn && onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(message)}
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          )}

          <div className="flex flex-col">
            <div
              className={cn(
                'rounded-2xl px-3 py-2 text-sm',
                isOwn
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-muted text-foreground rounded-bl-md'
              )}
            >
              {message.content && <p className="whitespace-pre-wrap break-words">{message.content}</p>}

              {message.file_url && (
                <a
                  href={message.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'mt-1 flex items-center gap-1 text-xs underline',
                    isOwn ? 'text-primary-foreground/80' : 'text-blue-600'
                  )}
                >
                  {message.file_name || 'Fichier joint'}
                </a>
              )}
            </div>

            {/* Reactions display */}
            {groupedReactions.length > 0 && (
              <div className={cn('mt-1 flex flex-wrap gap-1', isOwn ? 'justify-end' : 'justify-start')}>
                {groupedReactions.map(({ emoji, count, hasReacted, users }) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    title={users.join(', ')}
                    className={cn(
                      'flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors',
                      hasReacted
                        ? 'border-primary/30 bg-primary/10 text-primary'
                        : 'border-border bg-white text-muted-foreground hover:border-primary/30 hover:bg-primary/5'
                    )}
                  >
                    <span>{emoji}</span>
                    <span className="font-medium">{count}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <span className="mt-0.5 px-1 text-[10px] text-muted-foreground">
          {time}
          {message.is_edited && ' (modifié)'}
        </span>
      </div>
    </div>
  )
}
