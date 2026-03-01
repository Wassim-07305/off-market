"use client";

import { formatDateSeparator } from "@/lib/messaging-utils";

interface DateSeparatorProps {
  date: string;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 h-px bg-border/50" />
      <span className="text-[11px] font-medium text-muted-foreground bg-surface px-2.5 py-0.5 rounded-full border border-border/40">
        {formatDateSeparator(date)}
      </span>
      <div className="flex-1 h-px bg-border/50" />
    </div>
  );
}
