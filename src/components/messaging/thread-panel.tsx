"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, Send, MessageSquare } from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { formatMessageTime } from "@/lib/messaging-utils";
import { MessageContent } from "./message-content";
import { MessageReactions } from "./message-reactions";
import { useThreadMessages } from "@/hooks/use-messages";
import type { EnrichedMessage } from "@/types/messaging";
import type { User } from "@supabase/supabase-js";

interface ThreadPanelProps {
  parentMessage: EnrichedMessage;
  channelId: string;
  user: User | null;
  onClose: () => void;
  onSendReply: (content: string, replyTo: string) => Promise<void>;
  onReact: (messageId: string, emoji: string) => void;
}

export function ThreadPanel({
  parentMessage,
  channelId,
  user,
  onClose,
  onSendReply,
  onReact,
}: ThreadPanelProps) {
  const { replies, isLoading } = useThreadMessages(parentMessage.id);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [replies.length, scrollToBottom]);

  const handleSend = async () => {
    if (!replyText.trim() || sending) return;
    setSending(true);
    try {
      await onSendReply(replyText.trim(), parentMessage.id);
      setReplyText("");
      textareaRef.current?.focus();
    } finally {
      setSending(false);
    }
  };

  const parentSender = parentMessage.sender;

  return (
    <div className="w-80 lg:w-96 border-l border-border flex flex-col bg-surface h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">
            Fil de discussion
          </h3>
          <span className="text-xs text-muted-foreground">
            {replies.length} réponse{replies.length !== 1 ? "s" : ""}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {/* Parent message */}
        <div className="pb-3 border-b border-border">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              {parentSender?.avatar_url ? (
                <Image
                  src={parentSender.avatar_url}
                  alt=""
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <span className="text-xs font-semibold text-primary">
                  {parentSender ? getInitials(parentSender.full_name) : "?"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2 mb-0.5">
                <span className="text-[13px] font-semibold text-foreground">
                  {parentSender?.full_name ?? "Inconnu"}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {formatMessageTime(parentMessage.created_at)}
                </span>
              </div>
              <MessageContent message={parentMessage} />
              {parentMessage.reactions &&
                parentMessage.reactions.length > 0 && (
                  <MessageReactions
                    reactions={parentMessage.reactions}
                    currentUserId={user?.id ?? ""}
                    onToggle={(emoji) => onReact(parentMessage.id, emoji)}
                  />
                )}
            </div>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-muted animate-pulse" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Replies */}
        {replies.map((reply) => {
          const sender = reply.sender;
          return (
            <div key={reply.id} className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                {sender?.avatar_url ? (
                  <Image
                    src={sender.avatar_url}
                    alt=""
                    width={28}
                    height={28}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-[10px] font-semibold text-primary">
                    {sender ? getInitials(sender.full_name) : "?"}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-foreground">
                    {sender?.full_name ?? "Inconnu"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatMessageTime(reply.created_at)}
                  </span>
                  {reply.is_edited && (
                    <span className="text-[9px] text-muted-foreground italic">
                      (modifie)
                    </span>
                  )}
                </div>
                <div className="text-sm text-foreground/90">
                  <MessageContent message={reply} />
                </div>
                {reply.reactions && reply.reactions.length > 0 && (
                  <MessageReactions
                    reactions={reply.reactions}
                    currentUserId={user?.id ?? ""}
                    onToggle={(emoji) => onReact(reply.id, emoji)}
                  />
                )}
              </div>
            </div>
          );
        })}

        <div ref={endRef} />
      </div>

      {/* Reply input */}
      <div className="p-3 border-t border-border">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Repondre dans le fil..."
            rows={1}
            className="flex-1 px-3 py-2 bg-muted border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            onClick={handleSend}
            disabled={!replyText.trim() || sending}
            className="p-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
