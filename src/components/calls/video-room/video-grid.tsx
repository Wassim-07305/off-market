"use client";

import { VideoTile } from "./video-tile";
import { useCallStore } from "@/stores/call-store";

interface VideoGridProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  cameraStream: MediaStream | null;
  localName: string;
}

export function VideoGrid({
  localStream,
  remoteStream,
  cameraStream,
  localName,
}: VideoGridProps) {
  const {
    isMicOn,
    isCameraOn,
    isScreenSharing,
    remoteUserName,
    isRemoteConnected,
  } = useCallStore();

  // When screen sharing: show screen share as main, camera as PiP overlay
  if (isScreenSharing) {
    return (
      <div className="flex-1 relative p-4 min-h-0">
        {/* Main: screen share + remote side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full">
          {/* Screen share (local) */}
          <VideoTile
            stream={localStream}
            name={`${localName} (ecran)`}
            isMuted={!isMicOn}
            isLocal
            isScreenShare
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
              <p className="text-sm text-zinc-500">
                En attente du participant...
              </p>
            </div>
          )}
        </div>

        {/* PiP: camera overlay (bottom right, like Discord) */}
        {cameraStream && isCameraOn && (
          <div className="absolute bottom-6 right-6 w-40 h-28 rounded-xl overflow-hidden shadow-2xl border-2 border-zinc-700/50 z-10">
            <VideoTile
              stream={cameraStream}
              name=""
              isMuted={!isMicOn}
              isCameraOff={false}
              isLocal
              compact
            />
          </div>
        )}
      </div>
    );
  }

  // Normal mode: side by side
  return (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 p-4 min-h-0">
      {/* Local video */}
      <VideoTile
        stream={localStream}
        name={localName}
        isMuted={!isMicOn}
        isCameraOff={!isCameraOn}
        isLocal
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
