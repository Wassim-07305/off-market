"use client";

import { VideoTile } from "./video-tile";
import { useCallStore } from "@/stores/call-store";

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  localName: string;
}

export function VideoGrid({ localStream, remoteStream, localName }: VideoGridProps) {
  const { isMicOn, isCameraOn, isScreenSharing, remoteUserName, isRemoteConnected } =
    useCallStore();

  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 p-4 min-h-0">
      {/* Local video */}
      <VideoTile
        stream={localStream}
        name={localName}
        isMuted={!isMicOn}
        isCameraOff={!isCameraOn}
        isLocal
        isScreenShare={isScreenSharing}
      />

      {/* Remote video */}
      {isRemoteConnected ? (
        <VideoTile
          stream={remoteStream}
          name={remoteUserName ?? "Participant"}
        />
      ) : (
        <div className="bg-zinc-900 rounded-2xl flex flex-col items-center justify-center aspect-video">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
            <div className="w-3 h-3 bg-zinc-600 rounded-full animate-pulse" />
          </div>
          <p className="text-sm text-zinc-500">En attente du participant...</p>
        </div>
      )}
    </div>
  );
}
