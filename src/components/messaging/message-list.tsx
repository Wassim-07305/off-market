"use client";

import { useRef, useEffect } from "react";
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
  searchQuery,
}: MessageListProps) {
  const endRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 animate-pulse">
            <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <div className="h-3 w-20 bg-muted rounded" />
                <div className="h-2.5 w-12 bg-muted/60 rounded" />
              </div>
              <div className="h-3.5 w-3/4 bg-muted rounded" />
              {i % 2 === 0 && <div className="h-3.5 w-1/2 bg-muted rounded" />}
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
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-3">
      {groups.map((group, gi) => {
        const prevGroup = groups[gi - 1];
        const showDateSep =
          gi === 0 ||
          (prevGroup && !isSameDay(prevGroup.date, group.date));

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
