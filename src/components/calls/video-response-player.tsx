"use client";

import { useRef, useCallback } from "react";
import { useMarkVideoViewed } from "@/hooks/use-video-responses";
import type { VideoResponse } from "@/types/database";
import { Video, Eye, Clock, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatRelativeDate } from "@/lib/utils";

interface VideoResponsePlayerProps {
  video: VideoResponse;
  onReply?: () => void;
}

export function VideoResponsePlayer({ video, onReply }: VideoResponsePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const markViewed = useMarkVideoViewed();
  const hasBeenViewed = !!video.viewed_at;

  const handlePlay = useCallback(() => {
    if (!hasBeenViewed) {
      markViewed.mutate(video.id);
    }
  }, [hasBeenViewed, markViewed, video.id]);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return null;
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const senderName = video.sender?.full_name ?? "Utilisateur";
  const senderAvatar = video.sender?.avatar_url;
  const duration = formatDuration(video.duration);

  return (
    <div
      className={cn(
        "bg-surface rounded-2xl border overflow-hidden transition-all",
        hasBeenViewed ? "border-border" : "border-primary/30 ring-1 ring-primary/10",
      )}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Header with sender info */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="relative">
          {senderAvatar ? (
            <img
              src={senderAvatar}
              alt={senderName}
              className="w-9 h-9 rounded-full object-cover"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {senderName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {!hasBeenViewed && (
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#DC2626] border-2 border-surface" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{senderName}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatRelativeDate(video.created_at)}</span>
            {duration && (
              <>
                <span className="text-muted-foreground/30">|</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {duration}
                </span>
              </>
            )}
          </div>
        </div>
        {!hasBeenViewed && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#DC2626] bg-[#DC2626]/10 px-2 py-0.5 rounded-full">
            Nouveau
          </span>
        )}
        {hasBeenViewed && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Eye className="w-3 h-3" />
            Vu
          </span>
        )}
      </div>

      {/* Video player */}
      <div className="relative aspect-video bg-black">
        <video
          ref={videoRef}
          src={video.video_url}
          poster={video.thumbnail_url ?? undefined}
          controls
          playsInline
          onPlay={handlePlay}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Message + actions */}
      <div className="px-4 py-3 space-y-3">
        {video.message && (
          <div className="flex items-start gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-sm text-foreground leading-relaxed">{video.message}</p>
          </div>
        )}

        {onReply && (
          <button
            onClick={onReply}
            className="h-9 px-4 rounded-xl text-sm font-medium text-white flex items-center gap-2 transition-all active:scale-[0.97] w-full justify-center"
            style={{ backgroundColor: "#DC2626" }}
          >
            <Video className="w-4 h-4" />
            Repondre par video
          </button>
        )}
      </div>
    </div>
  );
}
