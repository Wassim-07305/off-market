"use client";

import { formatFileSize } from "@/lib/messaging-utils";
import { FileText, Download, Play, Pause, FileArchive, FileSpreadsheet, FileImage } from "lucide-react";
import { useState, useRef, useEffect, useCallback } from "react";
import { ImageLightbox } from "./image-lightbox";
import type { EnrichedMessage } from "@/types/messaging";

interface MessageContentProps {
  message: EnrichedMessage;
}

export function MessageContent({ message }: MessageContentProps) {
  switch (message.content_type) {
    case "image":
      return <ImageContent message={message} />;
    case "video":
      return <VideoContent message={message} />;
    case "audio":
      return <AudioContent message={message} />;
    case "file":
      return <FileContent message={message} />;
    case "text":
    default:
      return <TextContent content={message.content} />;
  }
}

/**
 * Render text with @mention highlighting, bold, italic, code, strikethrough, and links.
 */
function TextContent({ content }: { content: string }) {
  const imageMatch = content.match(/!\[.*?\]\((.*?)\)/);
  if (imageMatch) {
    return <InlineImage url={imageMatch[1]} />;
  }

  return (
    <p className="text-[14px] text-foreground leading-relaxed whitespace-pre-wrap break-words">
      {renderRichText(content)}
    </p>
  );
}

function renderRichText(text: string): React.ReactNode[] {
  const pattern = /(@[\w\s]+?)(?=\s|$)|(\*\*(.+?)\*\*)|(_(.+?)_)|(~~(.+?)~~)|(`(.+?)`)|(\[(.+?)\]\((.+?)\))|(https?:\/\/[^\s]+)/g;

  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIdx) {
      parts.push(text.slice(lastIdx, match.index));
    }

    if (match[1]) {
      parts.push(
        <span key={match.index} className="px-0.5 py-px rounded bg-primary/10 text-primary font-medium text-[13px]">
          {match[1]}
        </span>
      );
    } else if (match[2]) {
      parts.push(<strong key={match.index} className="font-semibold">{match[3]}</strong>);
    } else if (match[4]) {
      parts.push(<em key={match.index}>{match[5]}</em>);
    } else if (match[6]) {
      parts.push(<del key={match.index} className="text-muted-foreground">{match[7]}</del>);
    } else if (match[8]) {
      parts.push(
        <code key={match.index} className="px-1 py-0.5 rounded bg-muted text-[13px] font-mono text-foreground">{match[9]}</code>
      );
    } else if (match[10]) {
      parts.push(
        <a key={match.index} href={match[12]} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">
          {match[11]}
        </a>
      );
    } else if (match[13]) {
      parts.push(
        <a key={match.index} href={match[13]} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:text-primary/80">
          {match[13]}
        </a>
      );
    }

    lastIdx = match.index + match[0].length;
  }

  if (lastIdx < text.length) {
    parts.push(text.slice(lastIdx));
  }

  return parts.length > 0 ? parts : [text];
}

function InlineImage({ url }: { url: string }) {
  const [showLightbox, setShowLightbox] = useState(false);
  return (
    <>
      <img
        src={url}
        alt="image"
        className="mt-1 max-w-xs max-h-64 rounded-xl border border-border/40 object-cover cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => setShowLightbox(true)}
      />
      {showLightbox && <ImageLightbox src={url} onClose={() => setShowLightbox(false)} />}
    </>
  );
}

function ImageContent({ message }: { message: EnrichedMessage }) {
  const url = message.attachments?.[0]?.file_url ?? message.content.match(/\((.*?)\)/)?.[1] ?? message.content;
  const [showLightbox, setShowLightbox] = useState(false);

  return (
    <>
      <img
        src={url}
        alt={message.attachments?.[0]?.file_name ?? "image"}
        className="mt-1 max-w-sm max-h-72 rounded-xl border border-border/40 object-cover cursor-pointer hover:opacity-90 transition-opacity"
        onClick={() => setShowLightbox(true)}
      />
      {showLightbox && (
        <ImageLightbox src={url} alt={message.attachments?.[0]?.file_name} onClose={() => setShowLightbox(false)} />
      )}
    </>
  );
}

function VideoContent({ message }: { message: EnrichedMessage }) {
  const url = message.attachments?.[0]?.file_url ?? message.content;
  return (
    <div className="mt-1 max-w-sm">
      <video src={url} controls className="w-full rounded-xl border border-border/40" />
    </div>
  );
}

// Pre-compute bar heights once (deterministic waveform shape)
const WAVEFORM_BARS = Array.from({ length: 30 }, (_, i) => Math.max(Math.sin(i * 0.6 + 1) * 0.5 + 0.5, 0.15) * 100);

function AudioContent({ message }: { message: EnrichedMessage }) {
  const url = message.attachments?.[0]?.file_url ?? message.content;
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const rafRef = useRef<number>(0);

  // 60fps progress update via requestAnimationFrame
  const tick = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    const dur = isFinite(el.duration) ? el.duration : duration;
    if (dur > 0) {
      setProgress(el.currentTime / dur);
      setCurrentTime(el.currentTime);
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [duration]);

  useEffect(() => {
    if (playing) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafRef.current);
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, tick]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = audioRef.current;
    const dur = el && isFinite(el.duration) ? el.duration : duration;
    if (!el || !dur) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    el.currentTime = pct * dur;
    setProgress(pct);
    setCurrentTime(pct * dur);
  };

  const formatTime = (s: number) => {
    if (!s || !isFinite(s)) return "0:00";
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="mt-1 flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-primary/5 to-primary/[0.02] rounded-xl max-w-xs border border-primary/10">
      <audio
        ref={audioRef}
        src={url}
        preload="metadata"
        onLoadedMetadata={() => {
          const el = audioRef.current;
          if (el && isFinite(el.duration)) setDuration(el.duration);
        }}
        onDurationChange={() => {
          const el = audioRef.current;
          if (el && isFinite(el.duration)) setDuration(el.duration);
        }}
        onEnded={() => { setPlaying(false); setProgress(0); setCurrentTime(0); }}
      />
      <button
        onClick={togglePlay}
        className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shrink-0 hover:bg-primary/90 transition-all active:scale-95"
      >
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
      </button>

      {/* Waveform — dual-layer with GPU-accelerated clipPath for smooth sweep */}
      <div className="flex-1 relative h-7 cursor-pointer" onClick={handleSeek}>
        {/* Background layer (inactive bars) */}
        <div className="absolute inset-0 flex items-center gap-px">
          {WAVEFORM_BARS.map((h, i) => (
            <div key={i} className="flex-1 rounded-full bg-border" style={{ height: `${h}%` }} />
          ))}
        </div>
        {/* Foreground layer (active bars) — clipped to progress */}
        <div
          className="absolute inset-0 flex items-center gap-px"
          style={{ clipPath: `inset(0 ${100 - progress * 100}% 0 0)` }}
        >
          {WAVEFORM_BARS.map((h, i) => (
            <div key={i} className="flex-1 rounded-full bg-primary" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>

      <span className="text-[11px] text-muted-foreground font-mono shrink-0 w-9 text-right">
        {formatTime(playing ? currentTime : duration)}
      </span>
    </div>
  );
}

function FileContent({ message }: { message: EnrichedMessage }) {
  const attachment = message.attachments?.[0];
  const linkMatch = message.content.match(/\[(.*?)\]\((.*?)\)/);
  const fileName = attachment?.file_name ?? linkMatch?.[1] ?? message.content;
  const fileUrl = attachment?.file_url ?? linkMatch?.[2] ?? "#";
  const fileSize = attachment?.file_size;
  const fileType = attachment?.file_type ?? "";

  const FileIcon = fileType.includes("zip") || fileType.includes("rar")
    ? FileArchive
    : fileType.includes("sheet") || fileType.includes("csv") || fileType.includes("excel")
      ? FileSpreadsheet
      : fileType.includes("image")
        ? FileImage
        : FileText;

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1 inline-flex items-center gap-3 px-3.5 py-2.5 rounded-xl border border-border/40 bg-muted/30 hover:bg-muted/60 transition-colors max-w-xs group"
    >
      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <FileIcon className="w-4 h-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
        {fileSize && <p className="text-[11px] text-muted-foreground">{formatFileSize(fileSize)}</p>}
      </div>
      <Download className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
    </a>
  );
}
