"use client";

import { useEffect, useCallback } from "react";
import { useChannels } from "@/hooks/use-channels";
import { useMessages } from "@/hooks/use-messages";
import { useAuth } from "@/hooks/use-auth";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { useTyping } from "@/hooks/use-typing";
import { useMessagingStore } from "@/stores/messaging-store";
import { ChannelSidebar } from "./channel-sidebar";
import { ChatPanel } from "./chat-panel";
import { ChannelSettingsModal } from "./channel-settings-modal";
import { Hash } from "lucide-react";

export default function MessagingContainer() {
  const { user } = useAuth();
  const {
    channels,
    publicChannels,
    archivedChannels,
    dmChannels,
    isLoading: channelsLoading,
    createChannel,
    createDMChannel,
    muteChannel,
    unmuteChannel,
    archiveChannel,
    unarchiveChannel,
    showArchived,
    setShowArchived,
  } = useChannels();

  const {
    activeChannelId,
    setActiveChannelId,
    showMembersPanel,
    setShowMembersPanel,
    mobileSidebarOpen,
    setMobileSidebarOpen,
  } = useMessagingStore();

  const selectedChannel =
    channels.find((c) => c.id === activeChannelId) ?? null;

  const {
    messages,
    isLoading: messagesLoading,
    sendMessage,
    editMessage,
    deleteMessage,
    togglePin,
    toggleReaction,
    addAttachment,
    markAsRead,
  } = useMessages(activeChannelId);

  const { isOnline } = useOnlineStatus();
  const { typingUsers, broadcastTyping, stopTyping } =
    useTyping(activeChannelId);

  // Auto-select first channel
  useEffect(() => {
    if (!activeChannelId && channels.length > 0) {
      setActiveChannelId(channels[0].id);
    }
  }, [channels, activeChannelId, setActiveChannelId]);

  // Mark as read when channel changes
  useEffect(() => {
    if (activeChannelId) markAsRead();
  }, [activeChannelId]);

  const handleSelectChannel = useCallback(
    (id: string) => {
      setActiveChannelId(id);
      setMobileSidebarOpen(false);
    },
    [setActiveChannelId, setMobileSidebarOpen],
  );

  return (
    <div
      className="flex h-[calc(100vh-7rem)] bg-surface rounded-2xl overflow-hidden border border-border/40"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Sidebar */}
      <div
        className={`
        w-[272px] border-r border-border/40 flex flex-col shrink-0 bg-muted/30
        max-sm:absolute max-sm:inset-y-0 max-sm:left-0 max-sm:z-30 max-sm:w-[280px] max-sm:bg-surface max-sm:shadow-xl
        ${mobileSidebarOpen ? "max-sm:translate-x-0" : "max-sm:-translate-x-full"}
        sm:relative sm:translate-x-0 transition-transform duration-200
      `}
      >
        <ChannelSidebar
          publicChannels={publicChannels}
          archivedChannels={archivedChannels}
          dmChannels={dmChannels}
          activeChannelId={activeChannelId}
          onSelectChannel={handleSelectChannel}
          onCreateChannel={({ name, description, type, memberIds }) =>
            createChannel.mutateAsync({
              name,
              description,
              type,
              memberIds: user
                ? [...new Set([user.id, ...memberIds])]
                : memberIds,
            })
          }
          onCreateDM={(userId) =>
            createDMChannel.mutateAsync(userId).then((ch) => {
              setActiveChannelId(ch.id);
            })
          }
          isLoading={channelsLoading}
          isOnline={isOnline}
          showArchived={showArchived}
          onToggleShowArchived={() => setShowArchived(!showArchived)}
        />
      </div>

      {/* Backdrop for mobile sidebar */}
      {mobileSidebarOpen && (
        <div
          className="sm:hidden fixed inset-0 z-20 bg-black/40"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Chat area */}
      <div
        className="flex-1 flex flex-col min-w-0"
        key={activeChannelId ?? "empty"}
      >
        {selectedChannel ? (
          <ChatPanel
            channel={selectedChannel}
            messages={messages}
            isLoading={messagesLoading}
            user={user}
            sendMessage={sendMessage}
            editMessage={editMessage}
            deleteMessage={deleteMessage}
            togglePin={togglePin}
            toggleReaction={toggleReaction}
            addAttachment={addAttachment}
            onOpenMembers={() => setShowMembersPanel(true)}
            onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
            isOnline={isOnline}
            typingUsers={typingUsers}
            broadcastTyping={broadcastTyping}
            stopTyping={stopTyping}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                <Hash className="w-7 h-7 text-muted-foreground/40" />
              </div>
              <p className="text-sm text-muted-foreground">
                Selectionne un canal pour commencer
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Channel settings modal */}
      {selectedChannel && (
        <ChannelSettingsModal
          channel={selectedChannel}
          open={showMembersPanel}
          onClose={() => setShowMembersPanel(false)}
          isOnline={isOnline}
          onMute={() => muteChannel.mutate(selectedChannel.id)}
          onUnmute={() => unmuteChannel.mutate(selectedChannel.id)}
          onArchive={() => archiveChannel.mutate(selectedChannel.id)}
          onUnarchive={() => unarchiveChannel.mutate(selectedChannel.id)}
          userRole={user?.user_metadata?.role}
        />
      )}
    </div>
  );
}
