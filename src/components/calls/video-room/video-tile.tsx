"use client";

import { useRef, useEffect } from "react";
import { MicOff, VideoOff } from "lucide-react";

interface VideoTileProps {
  stream: MediaStream | null;
  name: string;
  isMuted?: boolean;
  isCameraOff?: boolean;
  isLocal?: boolean;
  isScreenShare?: boolean;
}

export function VideoTile({
  stream,
  name,
  isMuted,
  isCameraOff,
  isLocal,
  isScreenShare,
}: VideoTileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasVideo = stream?.getVideoTracks().some((t) => t.enabled) && !isCameraOff;

  return (
    <div className="relative bg-zinc-900 rounded-2xl overflow-hidden flex items-center justify-center aspect-video">
      {/* Video element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal}
        className={`w-full h-full object-cover ${isLocal && !isScreenShare ? "scale-x-[-1]" : ""} ${!hasVideo ? "hidden" : ""}`}
      />

      {/* Camera off placeholder */}
      {!hasVideo && (
        <div className="flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center text-xl font-bold text-white uppercase">
            {name.charAt(0)}
          </div>
          <span className="text-sm text-zinc-400">{name}</span>
        </div>
      )}

      {/* Name tag */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-lg px-2.5 py-1">
        <span className="text-xs text-white font-medium truncate max-w-[120px]">
          {isLocal ? "Vous" : name}
        </span>
        {isMuted && <MicOff className="w-3 h-3 text-red-400" />}
        {isCameraOff && <VideoOff className="w-3 h-3 text-yellow-400" />}
      </div>
    </div>
  );
}
