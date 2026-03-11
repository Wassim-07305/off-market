"use client";

import type { TranscriptEntry as TranscriptEntryType } from "@/types/calls";

interface TranscriptEntryProps {
  entry: TranscriptEntryType;
  callStartTime: number;
}

export function TranscriptEntryComponent({
  entry,
  callStartTime,
}: TranscriptEntryProps) {
  const relativeMs = entry.timestamp_ms - callStartTime;
  const totalSec = Math.max(0, Math.floor(relativeMs / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const timestamp = `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;

  return (
    <div className="flex gap-2 py-1.5 px-3 text-sm animate-fade-in">
      <span className="font-mono text-[11px] text-muted-foreground/60 shrink-0 pt-0.5 tabular-nums">
        {timestamp}
      </span>
      <div className="min-w-0">
        <span className="font-semibold text-foreground text-xs">
          {entry.speaker_name}
        </span>
        <span className="text-muted-foreground ml-1.5">{entry.text}</span>
      </div>
    </div>
  );
}
