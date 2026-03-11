"use client";

import { cn } from "@/lib/utils";
import type { MessageReaction } from "@/types/database";

interface MessageReactionsProps {
  reactions: MessageReaction[];
  currentUserId: string;
  onToggle: (emoji: string) => void;
}

export function MessageReactions({
  reactions,
  currentUserId,
  onToggle,
}: MessageReactionsProps) {
  // Group reactions by emoji
  const grouped = reactions.reduce<
    Record<string, { count: number; hasMe: boolean }>
  >((acc, r) => {
    if (!acc[r.emoji]) acc[r.emoji] = { count: 0, hasMe: false };
    acc[r.emoji].count++;
    if (r.profile_id === currentUserId) acc[r.emoji].hasMe = true;
    return acc;
  }, {});

  return (
    <div className="flex flex-wrap items-center gap-1 mt-1">
      {Object.entries(grouped).map(([emoji, { count, hasMe }]) => (
        <button
          key={emoji}
          onClick={() => onToggle(emoji)}
          className={cn(
            "inline-flex items-center gap-1 h-6 px-1.5 rounded-full text-xs border transition-all duration-150 active:scale-90",
            hasMe
              ? "bg-primary/10 border-primary/30 text-primary hover:bg-primary/15"
              : "bg-muted/40 border-border/40 text-muted-foreground hover:bg-muted hover:border-border",
          )}
        >
          <span>{emoji}</span>
          <span className="font-medium">{count}</span>
        </button>
      ))}
    </div>
  );
}
