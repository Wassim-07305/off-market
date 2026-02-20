"use client";

import { useState, useRef, useEffect } from "react";
import { useChannels } from "@/hooks/use-channels";
import { useMessages } from "@/hooks/use-messages";
import { useAuth } from "@/hooks/use-auth";
import { getInitials, formatDate, cn } from "@/lib/utils";
import {
  Hash,
  Lock,
  User,
  Plus,
  Send,
  Search,
  Users,
  Smile,
  Paperclip,
} from "lucide-react";
import { toast } from "sonner";

export default function MessagingPage() {
  const { channels, isLoading: channelsLoading, createChannel } = useChannels();
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(null);
  const { messages, isLoading: messagesLoading, sendMessage, markAsRead } = useMessages(selectedChannelId);
  const { user, profile } = useAuth();
  const [newMessage, setNewMessage] = useState("");
  const [showNewChannel, setShowNewChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedChannel = channels.find((c) => c.id === selectedChannelId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (selectedChannelId) markAsRead();
  }, [selectedChannelId]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    await sendMessage.mutateAsync({ content: newMessage });
    setNewMessage("");
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) return;
    await createChannel.mutateAsync({
      name: newChannelName,
      type: "public",
      memberIds: user ? [user.id] : [],
    });
    setNewChannelName("");
    setShowNewChannel(false);
    toast.success("Canal cree");
  };

  const getChannelIcon = (type: string) => {
    if (type === "private") return Lock;
    if (type === "dm") return User;
    return Hash;
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] bg-surface border border-border rounded-xl overflow-hidden">
      {/* Channel list */}
      <div className="w-64 border-r border-border flex flex-col shrink-0 hidden sm:flex">
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-semibold text-foreground">Canaux</h2>
            <button
              onClick={() => setShowNewChannel(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {showNewChannel && (
            <div className="flex gap-1.5 mb-2">
              <input
                autoFocus
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                placeholder="Nom du canal"
                className="flex-1 h-8 px-2.5 bg-muted border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                onKeyDown={(e) => e.key === "Enter" && handleCreateChannel()}
              />
              <button
                onClick={handleCreateChannel}
                className="h-8 px-2 bg-primary text-white rounded-lg text-xs"
              >
                OK
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-1.5">
          {channelsLoading ? (
            <div className="space-y-1 p-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-9 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : channels.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              Aucun canal
            </p>
          ) : (
            channels.map((channel) => {
              const Icon = getChannelIcon(channel.type);
              const isActive = channel.id === selectedChannelId;
              return (
                <button
                  key={channel.id}
                  onClick={() => setSelectedChannelId(channel.id)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 h-9 rounded-lg text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{channel.name}</span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {!selectedChannel ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Hash className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                Selectionne un canal pour commencer
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Channel header */}
            <div className="h-14 border-b border-border flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = getChannelIcon(selectedChannel.type);
                  return <Icon className="w-4 h-4 text-muted-foreground" />;
                })()}
                <h3 className="text-sm font-semibold text-foreground">
                  {selectedChannel.name}
                </h3>
              </div>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Search className="w-4 h-4" />
                </button>
                <button className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Users className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-start gap-3 animate-pulse">
                      <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-3 w-24 bg-muted rounded" />
                        <div className="h-3 w-56 bg-muted rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm text-muted-foreground">
                    Aucun message dans ce canal. Ecris le premier !
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.sender_id === user?.id;
                  const sender = msg.sender as { id: string; full_name: string; avatar_url: string | null; role: string } | null;
                  return (
                    <div key={msg.id} className="flex items-start gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-medium shrink-0">
                        {sender ? getInitials(sender.full_name) : "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline gap-2">
                          <span
                            className={cn(
                              "text-sm font-semibold",
                              sender?.role === "admin" || sender?.role === "coach"
                                ? "text-primary"
                                : "text-foreground"
                            )}
                          >
                            {sender?.full_name ?? "Inconnu"}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(msg.created_at, "relative")}
                          </span>
                        </div>
                        <p className="text-sm text-foreground mt-0.5 whitespace-pre-wrap break-words">
                          {msg.content}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-border p-3">
              <div className="flex items-end gap-2">
                <div className="flex-1 bg-muted border border-border rounded-xl px-4 py-2.5 flex items-end gap-2">
                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={`Message #${selectedChannel.name}`}
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button className="w-7 h-7 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                      <Smile className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <button
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                  className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white hover:bg-primary-hover transition-all active:scale-[0.95] disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
