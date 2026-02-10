import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import type { MessageWithSender } from '@/types/database'
import { cn, getInitials } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface MessageBubbleProps {
  message: MessageWithSender
  isOwn: boolean
  showSender: boolean
  onEdit?: (message: MessageWithSender) => void
  onDelete?: (message: MessageWithSender) => void
}

export function MessageBubble({ message, isOwn, showSender, onEdit, onDelete }: MessageBubbleProps) {
  const [showActions, setShowActions] = useState(false)

  const senderName = message.sender?.full_name ?? 'Utilisateur'
  const initials = getInitials(senderName)
  const time = format(new Date(message.created_at), 'HH:mm', { locale: fr })

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
          {/* Actions (shown on hover for own messages) */}
          {isOwn && showActions && (onEdit || onDelete) && (
            <div className="flex items-center gap-0.5">
              {onEdit && message.content && (
                <button
                  type="button"
                  onClick={() => onEdit(message)}
                  className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              )}
              {onDelete && (
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
        </div>

        <span className="mt-0.5 px-1 text-[10px] text-muted-foreground">
          {time}
          {message.is_edited && ' (modifié)'}
        </span>
      </div>
    </div>
  )
}
