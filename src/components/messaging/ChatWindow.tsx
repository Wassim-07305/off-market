import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChannelWithDetails, MessageWithSender } from '@/types/database'
import { useMessages, useSendMessage, useEditMessage, useDeleteMessage } from '@/hooks/useMessages'
import { useMarkChannelRead } from '@/hooks/useMessageReads'
import { useAuthStore } from '@/stores/auth-store'
import { useRole } from '@/hooks/useRole'
import { ChannelHeader } from './ChannelHeader'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { ReadOnlyBanner } from './ReadOnlyBanner'
import { Skeleton } from '@/components/ui/skeleton'
import { format, isSameDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'

interface ChatWindowProps {
  channel: ChannelWithDetails
  onBack: () => void
  onSettings?: () => void
  showBack?: boolean
}

export function ChatWindow({ channel, onBack, onSettings, showBack = false }: ChatWindowProps) {
  const userId = useAuthStore((s) => s.user?.id)
  const { isAdmin } = useRole()
  const messagesQuery = useMessages(channel.id)
  const sendMessage = useSendMessage()
  const editMessage = useEditMessage()
  const deleteMessage = useDeleteMessage()
  const markRead = useMarkChannelRead()

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  // All messages flattened from infinite query pages
  const allMessages = messagesQuery.data?.pages.flatMap((p) => p.data) ?? []

  // Mark channel as read when opening
  useEffect(() => {
    if (channel.id && channel.unread_count > 0) {
      markRead.mutate(channel.id)
    }
  }, [channel.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (autoScroll) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [allMessages.length, autoScroll])

  // Detect scroll position to toggle auto-scroll
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100
    setAutoScroll(isAtBottom)

    // Load more when scrolling to top
    if (scrollTop < 50 && messagesQuery.hasNextPage && !messagesQuery.isFetchingNextPage) {
      const prevScrollHeight = container.scrollHeight
      messagesQuery.fetchNextPage().then(() => {
        // Maintain scroll position after loading older messages
        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight
          container.scrollTop = newScrollHeight - prevScrollHeight
        })
      })
    }
  }, [messagesQuery])

  // Check if user can write
  const canWrite = channel.write_mode === 'all' || isAdmin

  const handleSend = (content?: string, fileUrl?: string, fileName?: string) => {
    if (!userId) return
    sendMessage.mutate({
      channelId: channel.id,
      content,
      senderId: userId,
      fileUrl,
      fileName,
    })
    setAutoScroll(true)
  }

  const handleEdit = (message: MessageWithSender) => {
    const newContent = window.prompt('Modifier le message :', message.content || '')
    if (newContent !== null && newContent !== message.content) {
      editMessage.mutate({ id: message.id, content: newContent, channelId: channel.id })
    }
  }

  const handleDelete = (message: MessageWithSender) => {
    if (window.confirm('Supprimer ce message ?')) {
      deleteMessage.mutate({ id: message.id, channelId: channel.id })
    }
  }

  // Group messages for showing sender name
  const shouldShowSender = (msg: MessageWithSender, idx: number) => {
    if (idx === 0) return true
    const prev = allMessages[idx - 1]
    if (prev.sender_id !== msg.sender_id) return true
    // Show sender if gap > 5 minutes
    const gap = new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime()
    return gap > 5 * 60 * 1000
  }

  return (
    <div className="flex h-full flex-col">
      <ChannelHeader
        channel={channel}
        onBack={onBack}
        onSettings={onSettings}
        showBack={showBack}
      />

      {/* Messages area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3"
      >
        {messagesQuery.isFetchingNextPage && (
          <div className="flex justify-center py-3">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {messagesQuery.isLoading ? (
          <div className="space-y-4 py-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`flex gap-2 ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-48 rounded-2xl" />
                </div>
              </div>
            ))}
          </div>
        ) : allMessages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">
              Aucun message. Commencez la conversation !
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {allMessages.map((msg, idx) => {
              const showDate =
                idx === 0 ||
                !isSameDay(new Date(allMessages[idx - 1].created_at), new Date(msg.created_at))

              return (
                <div key={msg.id}>
                  {showDate && (
                    <div className="my-4 flex items-center gap-3">
                      <div className="h-px flex-1 bg-border" />
                      <span className="shrink-0 text-xs font-medium text-muted-foreground">
                        {format(new Date(msg.created_at), 'EEEE d MMMM', { locale: fr })}
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>
                  )}
                  <MessageBubble
                    message={msg}
                    isOwn={msg.sender_id === userId}
                    showSender={shouldShowSender(msg, idx)}
                    onEdit={msg.sender_id === userId ? handleEdit : undefined}
                    onDelete={msg.sender_id === userId || isAdmin ? handleDelete : undefined}
                  />
                </div>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      {canWrite ? (
        <MessageInput onSend={handleSend} disabled={sendMessage.isPending} />
      ) : (
        <ReadOnlyBanner />
      )}
    </div>
  )
}
