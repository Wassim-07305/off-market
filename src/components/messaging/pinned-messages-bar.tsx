"use client";

import { useState } from "react";
import { Pin, ChevronDown, ChevronUp, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatMessageTime } from "@/lib/messaging-utils";
import type { EnrichedMessage } from "@/types/messaging";

interface PinnedMessagesBarProps {
  pinnedMessages: EnrichedMessage[];
  onJumpToMessage?: (messageId: string) => void;
  onUnpin?: (messageId: string) => void;
}

export function PinnedMessagesBar({
  pinnedMessages,
  onJumpToMessage,
  onUnpin,
}: PinnedMessagesBarProps) {
  const [expanded, setExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (pinnedMessages.length === 0) return null;

  const currentPin = pinnedMessages[currentIndex];

  const navigatePin = (direction: "prev" | "next") => {
    if (direction === "next") {
      setCurrentIndex((i) => (i + 1) % pinnedMessages.length);
    } else {
      setCurrentIndex(
        (i) => (i - 1 + pinnedMessages.length) % pinnedMessages.length,
      );
    }
  };

  return (
    <div className="border-b border-border/40 bg-amber-50/50 dark:bg-amber-950/10">
      {/* Collapsed: single pin preview */}
      <div
        className="flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-amber-50/80 dark:hover:bg-amber-950/20 transition-colors"
        onClick={() => {
          if (pinnedMessages.length === 1) {
            onJumpToMessage?.(currentPin.id);
          } else {
            setExpanded(!expanded);
          }
        }}
      >
        <Pin className="w-3.5 h-3.5 text-amber-600 fill-amber-600 shrink-0" />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-500">
              {currentPin.sender?.full_name ?? "Inconnu"}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {formatMessageTime(currentPin.created_at)}
            </span>
          </div>
          <p className="text-xs text-foreground/80 truncate">
            {currentPin.content_type === "image"
              ? "Image"
              : currentPin.content_type === "audio"
                ? "Message vocal"
                : currentPin.content_type === "file"
                  ? "Fichier"
                  : currentPin.content.slice(0, 100)}
          </p>
        </div>

        {pinnedMessages.length > 1 && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigatePin("prev");
              }}
              className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronUp className="w-3 h-3" />
            </button>
            <span className="text-[10px] text-muted-foreground font-mono min-w-[28px] text-center">
              {currentIndex + 1}/{pinnedMessages.length}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigatePin("next");
              }}
              className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        )}

        {pinnedMessages.length > 1 &&
          (expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          ))}
      </div>

      {/* Expanded: all pins */}
      {expanded && pinnedMessages.length > 1 && (
        <div className="border-t border-amber-200/40 dark:border-amber-800/20 max-h-48 overflow-y-auto">
          {pinnedMessages.map((pin) => (
            <div
              key={pin.id}
              className="flex items-center gap-2 px-4 py-2 hover:bg-amber-50/80 dark:hover:bg-amber-950/20 transition-colors cursor-pointer"
              onClick={() => onJumpToMessage?.(pin.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-500">
                    {pin.sender?.full_name ?? "Inconnu"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formatMessageTime(pin.created_at)}
                  </span>
                </div>
                <p className="text-xs text-foreground/80 truncate">
                  {pin.content?.slice(0, 100) ?? "..."}
                </p>
              </div>
              {onUnpin && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUnpin(pin.id);
                  }}
                  className="w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  title="Desepingler"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
