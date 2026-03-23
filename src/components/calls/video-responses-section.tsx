"use client";

import { useState } from "react";
import { useVideoResponses } from "@/hooks/use-video-responses";
import { VideoResponseRecorder } from "./video-response-recorder";
import { VideoResponsePlayer } from "./video-response-player";
import type { VideoResponseRelatedType } from "@/types/database";
import { Video, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoResponsesSectionProps {
  relatedType: VideoResponseRelatedType;
  relatedId: string;
  recipientId: string;
  className?: string;
}

export function VideoResponsesSection({
  relatedType,
  relatedId,
  recipientId,
  className,
}: VideoResponsesSectionProps) {
  const [showRecorder, setShowRecorder] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const { data: videos, isLoading } = useVideoResponses(relatedType, relatedId);

  const unviewedCount = videos?.filter((v) => !v.viewed_at).length ?? 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Section header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
        >
          <Video className="w-4 h-4" />
          Réponses video
          {unviewedCount > 0 && (
            <span className="text-[10px] font-bold text-white bg-[#DC2626] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {unviewedCount}
            </span>
          )}
          {expanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>

        {!showRecorder && (
          <button
            onClick={() => setShowRecorder(true)}
            className="h-8 px-3 rounded-lg text-xs font-medium text-white flex items-center gap-1.5 transition-all active:scale-[0.97]"
            style={{ backgroundColor: "#DC2626" }}
          >
            <Video className="w-3.5 h-3.5" />
            Envoyer une video
          </button>
        )}
      </div>

      {expanded && (
        <div className="space-y-4">
          {/* Recorder */}
          {showRecorder && (
            <VideoResponseRecorder
              recipientId={recipientId}
              relatedType={relatedType}
              relatedId={relatedId}
              onClose={() => setShowRecorder(false)}
              onSent={() => setShowRecorder(false)}
            />
          )}

          {/* Loading */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-surface rounded-2xl border border-border p-4"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full bg-muted animate-shimmer" />
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-24 bg-muted rounded animate-shimmer" />
                      <div className="h-3 w-16 bg-muted rounded animate-shimmer" />
                    </div>
                  </div>
                  <div className="aspect-video bg-muted rounded-xl animate-shimmer" />
                </div>
              ))}
            </div>
          )}

          {/* Video list */}
          {!isLoading && videos && videos.length > 0 && (
            <div className="space-y-3">
              {videos.map((video) => (
                <VideoResponsePlayer
                  key={video.id}
                  video={video}
                  onReply={() => setShowRecorder(true)}
                />
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && (!videos || videos.length === 0) && !showRecorder && (
            <div className="text-center py-8 bg-surface rounded-2xl border border-border">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2">
                <Video className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Aucune réponse vidéo pour le moment
              </p>
              <button
                onClick={() => setShowRecorder(true)}
                className="mt-3 h-8 px-3 rounded-lg text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
              >
                Envoyer la première video
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
