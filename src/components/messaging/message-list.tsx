"use client";

import { useRef, useEffect, useCallback } from "react";
import { groupMessages, isSameDay } from "@/lib/messaging-utils";
import { DateSeparator } from "./date-separator";
import { MessageBubble } from "./message-bubble";
import type { EnrichedMessage } from "@/types/messaging";

interface MessageListProps {
  messages: EnrichedMessage[];
  isLoading: boolean;
  currentUserId: string;
  onReact: (messageId: string, emoji: string) => void;
  onReply: (msg: EnrichedMessage) => void;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onPin: (id: string, pinned: boolean) => void;
  onOpenThread?: (msg: EnrichedMessage) => void;
  searchQuery: string;
}

export function MessageList({
  messages,
  isLoading,
  currentUserId,
  onReact,
  onReply,
  onEdit,
  onDelete,
  onPin,
  onOpenThread,
  searchQuery,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevCountRef = useRef(0);
  const initialLoadRef = useRef(true);

  const scrollToBottom = useCallback((instant = false) => {
    endRef.current?.scrollIntoView({
      behavior: instant ? "instant" : "smooth",
    });
  }, []);

  // Scroll on new messages — instant on first load, smooth on subsequent
  useEffect(() => {
    if (messages.length === 0) return;

    if (initialLoadRef.current) {
      // First load: instant scroll, no animation
      initialLoadRef.current = false;
      requestAnimationFrame(() => scrollToBottom(true));
    } else if (messages.length > prevCountRef.current) {
      // New message: check if near bottom, then smooth scroll
      const container = containerRef.current;
      if (container) {
        const { scrollTop, scrollHeight, clientHeight } = container;
        const nearBottom = scrollHeight - scrollTop - clientHeight < 120;
        if (nearBottom) scrollToBottom(false);
      }
    }
    prevCountRef.current = messages.length;
  }, [messages.length, scrollToBottom]);

  // Reset initial load flag when channel changes (messages go empty then refill)
  useEffect(() => {
    if (messages.length === 0) {
      initialLoadRef.current = true;
      prevCountRef.current = 0;
    }
  }, [messages.length]);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-muted shrink-0 animate-shimmer" />
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="h-3 w-20 bg-muted rounded animate-shimmer" />
                <div className="h-2.5 w-12 bg-muted/60 rounded animate-shimmer" />
              </div>
              <div className="h-3.5 w-3/4 bg-muted rounded animate-shimmer" />
              {i % 2 === 0 && (
                <div className="h-3.5 w-1/2 bg-muted rounded animate-shimmer" />
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">
          {searchQuery
            ? "Aucun message ne correspond a la recherche"
            : "Aucun message. Ecris le premier !"}
        </p>
      </div>
    );
  }

  const groups = groupMessages(messages);

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto px-4 py-3 scroll-smooth"
    >
      {groups.map((group, gi) => {
        const prevGroup = groups[gi - 1];
        const showDateSep =
          gi === 0 || (prevGroup && !isSameDay(prevGroup.date, group.date));

        return (
          <div key={`${group.senderId}-${group.date}-${gi}`}>
            {showDateSep && <DateSeparator date={group.date} />}

            <div className="py-0.5">
              {group.messages.map((msg, mi) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  isFirstInGroup={mi === 0}
                  isOwn={msg.sender_id === currentUserId}
                  currentUserId={currentUserId}
                  onReact={onReact}
                  onReply={() => onReply(msg)}
                  onEdit={onEdit}
                  onDelete={() => onDelete(msg.id)}
                  onPin={() => onPin(msg.id, msg.is_pinned)}
                  onOpenThread={
                    onOpenThread ? () => onOpenThread(msg) : undefined
                  }
                />
              ))}
            </div>
          </div>
        );
      })}
      <div ref={endRef} />
    </div>
  );
}
