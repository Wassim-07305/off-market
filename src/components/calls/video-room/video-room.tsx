"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCalls, useCallById } from "@/hooks/use-calls";
import { useWebRTC } from "@/hooks/use-webrtc";
import { useTranscription } from "@/hooks/use-transcription";
import { useCallNotifications } from "@/hooks/use-call-notifications";
import { useCallStore } from "@/stores/call-store";
import { VideoGrid } from "./video-grid";
import { CallControls } from "./call-controls";
import { CallTimer } from "./call-timer";
import { ConnectionStatus } from "./connection-status";
import { TranscriptPanel } from "./transcript-panel";
import { CallEndedSummary } from "./call-ended-summary";
import { Loader2 } from "lucide-react";

interface VideoRoomProps {
  callId: string;
}

export function VideoRoom({ callId }: VideoRoomProps) {
  const { user, profile } = useAuth();
  const { data: call, isLoading } = useCallById(callId);
  const { updateRoomStatus, saveTranscript } = useCalls();
  const { notifyPeer } = useCallNotifications();
  const store = useCallStore();

  const [showTranscript, setShowTranscript] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const myName = profile?.full_name ?? "Utilisateur";

  const {
    localStream,
    remoteStream,
    joinCall,
    leaveCall,
    toggleMic,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
    broadcastTranscript,
  } = useWebRTC({ callId, enabled: hasJoined });

  const { isSupported: isTranscriptionSupported, startTranscription, stopTranscription } =
    useTranscription({
      speakerId: user?.id ?? "",
      speakerName: myName,
      onEntry: (entry) => broadcastTranscript(entry),
    });

  // Join the call
  const handleJoin = useCallback(async () => {
    if (!call || !user) return;

    setHasJoined(true);

    // Update room status
    updateRoomStatus.mutate({
      id: callId,
      room_status: "waiting",
    });

    // Notify the other participant
    const peerId = call.assigned_to === user.id ? call.client_id : call.assigned_to;
    if (peerId) {
      notifyPeer(peerId, callId, myName);
    }

    await joinCall();
  }, [call, user, callId, myName, joinCall, updateRoomStatus, notifyPeer]);

  // Leave / hang up
  const handleHangUp = useCallback(async () => {
    // Save transcript if any
    if (store.transcriptEntries.length > 0) {
      const durationSeconds = store.callStartTime
        ? Math.floor((Date.now() - store.callStartTime) / 1000)
        : undefined;

      saveTranscript.mutate({
        call_id: callId,
        content: store.transcriptEntries,
        duration_seconds: durationSeconds,
      });
    }

    // Update room status
    updateRoomStatus.mutate({
      id: callId,
      room_status: "ended",
      ended_at: new Date().toISOString(),
      actual_duration_seconds: store.callStartTime
        ? Math.floor((Date.now() - store.callStartTime) / 1000)
        : undefined,
    });

    stopTranscription();
    leaveCall();
  }, [callId, store.transcriptEntries, store.callStartTime, saveTranscript, updateRoomStatus, stopTranscription, leaveCall]);

  // Toggle transcription
  const handleToggleTranscript = useCallback(() => {
    if (store.isTranscribing) {
      stopTranscription();
      setShowTranscript(false);
    } else {
      startTranscription();
      setShowTranscript(true);
    }
  }, [store.isTranscribing, startTranscription, stopTranscription]);

  // Toggle screen share
  const handleToggleScreenShare = useCallback(() => {
    if (store.isScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  }, [store.isScreenSharing, startScreenShare, stopScreenShare]);

  // Cleanup on unmount / beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (store.phase === "connected" || store.phase === "connecting") {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [store.phase]);

  // Download transcript as TXT
  const handleDownloadTranscript = () => {
    const callStart = store.callStartTime ?? Date.now();
    const lines = store.transcriptEntries.map((e) => {
      const relSec = Math.floor((e.timestamp_ms - callStart) / 1000);
      const min = Math.floor(relSec / 60);
      const sec = relSec % 60;
      return `[${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}] ${e.speaker_name}: ${e.text}`;
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `transcript-${call?.title ?? callId}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950">
        <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
      </div>
    );
  }

  if (!call) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950">
        <p className="text-zinc-400">Appel introuvable</p>
      </div>
    );
  }

  // Ended state
  if (store.phase === "ended" && hasJoined) {
    return (
      <CallEndedSummary
        callTitle={call.title}
        onDownloadTranscript={handleDownloadTranscript}
      />
    );
  }

  // Pre-join lobby
  if (!hasJoined) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950">
        <div className="text-center space-y-6 max-w-sm mx-auto px-4">
          <div>
            <h2 className="text-xl font-semibold text-white">{call.title}</h2>
            <p className="text-sm text-zinc-400 mt-1">
              {call.client?.full_name && `Avec ${call.client.full_name}`}
            </p>
          </div>

          <button
            onClick={handleJoin}
            className="h-12 px-8 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-all active:scale-[0.97] flex items-center gap-2 mx-auto"
          >
            Rejoindre l&apos;appel
          </button>

          {!isTranscriptionSupported && (
            <p className="text-[11px] text-yellow-500/70">
              La transcription en direct n&apos;est pas disponible sur votre navigateur.
              Utilisez Chrome, Edge ou Safari pour cette fonctionnalite.
            </p>
          )}
        </div>
      </div>
    );
  }

  // In-call view
  return (
    <div className="flex-1 flex bg-zinc-950 h-full">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-950/80 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-3">
            <ConnectionStatus />
            <span className="text-xs text-zinc-400 hidden sm:inline">{call.title}</span>
          </div>
          <CallTimer />
        </div>

        {/* Video grid */}
        <VideoGrid
          localStream={localStream}
          remoteStream={remoteStream}
          localName={myName}
        />

        {/* Controls */}
        <CallControls
          onToggleMic={toggleMic}
          onToggleCamera={toggleCamera}
          onToggleScreenShare={handleToggleScreenShare}
          onToggleTranscript={handleToggleTranscript}
          onHangUp={handleHangUp}
          showTranscript={showTranscript}
          isTranscriptionSupported={isTranscriptionSupported}
        />
      </div>

      {/* Transcript panel (slides in from right) */}
      {showTranscript && (
        <TranscriptPanel onClose={() => setShowTranscript(false)} />
      )}
    </div>
  );
}
