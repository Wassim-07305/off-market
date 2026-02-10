import { useState, useEffect } from 'react'
import { MessageCircle } from 'lucide-react'
import { useChannels } from '@/hooks/useChannels'
import { useChatStore } from '@/stores/chat-store'
import { ChannelList } from '@/components/messaging/ChannelList'
import { ChatWindow } from '@/components/messaging/ChatWindow'
import { CreateChannelModal } from '@/components/messaging/CreateChannelModal'
import { ChannelSettingsModal } from '@/components/messaging/ChannelSettingsModal'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export default function MessagingPage() {
  const { data: channels, isLoading } = useChannels()
  const { activeChannelId, setActiveChannel, mobileShowChat, setMobileShowChat } = useChatStore()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)

  const activeChannel = channels?.find((c) => c.id === activeChannelId) ?? null

  // Auto-select first channel if none selected
  useEffect(() => {
    if (!activeChannelId && channels && channels.length > 0) {
      setActiveChannel(channels[0].id)
    }
  }, [channels, activeChannelId, setActiveChannel])

  // Clear active channel if it no longer exists
  useEffect(() => {
    if (activeChannelId && channels && !channels.find((c) => c.id === activeChannelId)) {
      setActiveChannel(null)
    }
  }, [channels, activeChannelId, setActiveChannel])

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] gap-0 overflow-hidden rounded-xl border border-border bg-white">
        <div className="w-80 border-r border-border p-4 space-y-3">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-9 w-full rounded-xl" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex-1 p-6">
          <Skeleton className="h-full w-full rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex h-[calc(100vh-8rem)] overflow-hidden rounded-xl border border-border bg-white">
        {/* Channel list - hidden on mobile when chat is open */}
        <div
          className={cn(
            'w-full shrink-0 border-r border-border md:w-80',
            mobileShowChat ? 'hidden md:block' : 'block'
          )}
        >
          <ChannelList
            channels={channels ?? []}
            activeChannelId={activeChannelId}
            onSelect={(id) => {
              setActiveChannel(id)
              setMobileShowChat(true)
            }}
            onCreateChannel={() => setShowCreateModal(true)}
          />
        </div>

        {/* Chat area */}
        <div
          className={cn(
            'min-w-0 flex-1',
            !mobileShowChat ? 'hidden md:flex' : 'flex'
          )}
        >
          {activeChannel ? (
            <ChatWindow
              channel={activeChannel}
              onBack={() => setMobileShowChat(false)}
              onSettings={() => setShowSettingsModal(true)}
              showBack={mobileShowChat}
            />
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <EmptyState
                icon={<MessageCircle className="h-6 w-6" />}
                title="Sélectionnez une conversation"
                description="Choisissez un canal ou un message direct pour commencer."
              />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateChannelModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      <ChannelSettingsModal
        open={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        channel={activeChannel}
        onDeleted={() => setActiveChannel(null)}
      />
    </>
  )
}
