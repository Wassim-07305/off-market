"use client";

import { formatFileSize } from "@/lib/messaging-utils";
import { FileText, Download, Play, Pause, FileArchive, FileSpreadsheet, FileImage } from "lucide-react";
import { useState, useRef } from "react";
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

function AudioContent({ message }: { message: EnrichedMessage }) {
  const url = message.attachments?.[0]?.file_url ?? message.content;
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = pct * duration;
    setProgress(pct);
  };

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="mt-1 flex items-center gap-3 px-3 py-2.5 bg-gradient-to-r from-primary/5 to-primary/[0.02] rounded-xl max-w-xs border border-primary/10">
      <audio
        ref={audioRef}
        src={url}
        onTimeUpdate={() => {
          if (audioRef.current) setProgress(audioRef.current.currentTime / (audioRef.current.duration || 1));
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) setDuration(audioRef.current.duration);
        }}
        onEnded={() => { setPlaying(false); setProgress(0); }}
      />
      <button
        onClick={togglePlay}
        className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shrink-0 hover:bg-primary/90 transition-all active:scale-95"
      >
        {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
      </button>

      <div className="flex-1 flex items-center gap-px h-7 cursor-pointer" onClick={handleSeek}>
        {Array.from({ length: 30 }).map((_, i) => {
          const barProgress = i / 30;
          const h = Math.sin(i * 0.6 + 1) * 0.5 + 0.5;
          return (
            <div
              key={i}
              className="flex-1 rounded-full transition-colors duration-100"
              style={{
                height: `${Math.max(h * 100, 15)}%`,
                backgroundColor: barProgress <= progress ? "var(--primary)" : "var(--border)",
              }}
            />
          );
        })}
      </div>

      <span className="text-[11px] text-muted-foreground font-mono shrink-0 w-9 text-right">
        {formatTime(playing ? (audioRef.current?.currentTime ?? 0) : duration)}
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
