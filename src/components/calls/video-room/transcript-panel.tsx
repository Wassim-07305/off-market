"use client";

import { useRef, useEffect } from "react";
import { useCallStore } from "@/stores/call-store";
import { TranscriptEntryComponent } from "./transcript-entry";
import { ScrollText, X, Download } from "lucide-react";

interface TranscriptPanelProps {
  onClose: () => void;
}

export function TranscriptPanel({ onClose }: TranscriptPanelProps) {
  const entries = useCallStore((s) => s.transcriptEntries);
  const callStartTime = useCallStore((s) => s.callStartTime) ?? Date.now();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new entries
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [entries.length]);

  const handleDownload = () => {
    const lines = entries.map((e) => {
      const relSec = Math.floor((e.timestamp_ms - callStartTime) / 1000);
      const min = Math.floor(relSec / 60);
      const sec = relSec % 60;
      return `[${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}] ${e.speaker_name}: ${e.text}`;
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-80 bg-surface border-l border-border/40 flex flex-col h-full animate-slide-in-right">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Transcription</h3>
          <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
            {entries.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {entries.length > 0 && (
            <button
              onClick={handleDownload}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Telecharger"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Entries */}
      <div className="flex-1 overflow-y-auto py-2">
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground/50">
            <ScrollText className="w-8 h-8 mb-2" />
            <p className="text-xs">En attente de parole...</p>
          </div>
        ) : (
          entries.map((entry, i) => (
            <TranscriptEntryComponent
              key={i}
              entry={entry}
              callStartTime={callStartTime}
            />
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
