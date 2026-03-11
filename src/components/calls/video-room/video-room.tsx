"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCalls, useCallById } from "@/hooks/use-calls";
import { useWebRTC } from "@/hooks/use-webrtc";
import { useTranscription } from "@/hooks/use-transcription";
import { useSupabase } from "@/hooks/use-supabase";
import { useCallStore } from "@/stores/call-store";
import { VideoGrid } from "./video-grid";
import { CallControls } from "./call-controls";
import { CallTimer } from "./call-timer";
import { ConnectionStatus } from "./connection-status";
import { TranscriptPanel } from "./transcript-panel";
import { CallEndedSummary } from "./call-ended-summary";
import { Loader2, Mic, MicOff, Video, VideoOff } from "lucide-react";

interface VideoRoomProps {
  callId: string;
}

export function VideoRoom({ callId }: VideoRoomProps) {
  const { user, profile } = useAuth();
  const { data: call, isLoading } = useCallById(callId);
  const { updateRoomStatus, saveTranscript } = useCalls();
  const supabase = useSupabase();
  const store = useCallStore();

  const [showTranscript, setShowTranscript] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  // Reset call store when mounting (cleans up stale "ended" state from previous calls)
  useEffect(() => {
    store.resetCall();
  }, [callId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Preview lobby state
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [previewMic, setPreviewMic] = useState(true);
  const [previewCamera, setPreviewCamera] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewAudioLevel, setPreviewAudioLevel] = useState(0);
  // Callback ref: sets srcObject every time the video element mounts/remounts
  const previewVideoRef = useCallback(
    (el: HTMLVideoElement | null) => {
      if (el && previewStream) {
        el.srcObject = previewStream;
      }
    },
    [previewStream],
  );
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number>(0);

  const myName = profile?.full_name ?? "Utilisateur";

  // Request preview media on mount
  useEffect(() => {
    let cancelled = false;

    async function getPreview() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        setPreviewStream(stream);

        // Audio analyser for mic level indicator
        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        audioCtxRef.current = audioCtx;
        analyserRef.current = analyser;
      } catch {
        // Try audio-only
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          });
          if (cancelled) {
            stream.getTracks().forEach((t) => t.stop());
            return;
          }
          setPreviewStream(stream);
          setPreviewCamera(false);
          setPreviewError("Camera indisponible, audio uniquement");
        } catch {
          if (!cancelled)
            setPreviewError("Impossible d'acceder au micro et a la camera");
        }
      }
    }
    getPreview();

    return () => {
      cancelled = true;
    };
  }, []);

  // Audio level meter
  useEffect(() => {
    if (!analyserRef.current || !previewMic) {
      setPreviewAudioLevel(0);
      return;
    }
    const analyser = analyserRef.current;
    const data = new Uint8Array(analyser.frequencyBinCount);

    function tick() {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      setPreviewAudioLevel(Math.min(avg / 80, 1)); // normalize 0..1
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [previewMic]);

  // Toggle preview mic
  const togglePreviewMic = useCallback(() => {
    previewStream?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setPreviewMic((v) => !v);
  }, [previewStream]);

  // Toggle preview camera
  const togglePreviewCamera = useCallback(() => {
    previewStream?.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setPreviewCamera((v) => !v);
  }, [previewStream]);

  // Cleanup preview when joining or unmounting
  const cleanupPreview = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    audioCtxRef.current?.close();
    audioCtxRef.current = null;
    analyserRef.current = null;
    previewStream?.getTracks().forEach((t) => t.stop());
    setPreviewStream(null);
  }, [previewStream]);

  useEffect(() => {
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      previewStream?.getTracks().forEach((t) => t.stop());
      cancelAnimationFrame(rafRef.current);
      audioCtxRef.current?.close();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
  } = useWebRTC({ callId });

  const {
    isSupported: isTranscriptionSupported,
    startTranscription,
    stopTranscription,
  } = useTranscription({
    speakerId: user?.id ?? "",
    speakerName: myName,
    onEntry: (entry) => broadcastTranscript(entry),
  });

  // Join the call
  const handleJoin = useCallback(async () => {
    if (!call || !user) return;

    // Stop preview stream before WebRTC takes over
    cleanupPreview();

    // Carry over preview toggles to the call store
    const s = useCallStore.getState();
    if (!previewMic) s.toggleMic();
    if (!previewCamera) s.toggleCamera();

    setHasJoined(true);

    // Update room status
    updateRoomStatus.mutate({
      id: callId,
      room_status: "waiting",
    });

    // Notify the other participant via one-shot broadcast
    const peerId =
      call.assigned_to === user.id ? call.client_id : call.assigned_to;
    if (peerId) {
      const notifyChannel = supabase.channel(`call-notify-${peerId}`, {
        config: { broadcast: { self: false } },
      });
      notifyChannel.subscribe((status) => {
        if (status === "SUBSCRIBED") {
          notifyChannel.send({
            type: "broadcast",
            event: "incoming-call",
            payload: { callId, callerName: myName },
          });
          setTimeout(() => supabase.removeChannel(notifyChannel), 2000);
        }
      });
    }

    await joinCall();
  }, [
    call,
    user,
    callId,
    myName,
    joinCall,
    updateRoomStatus,
    supabase,
    cleanupPreview,
    previewMic,
    previewCamera,
  ]);

  // Leave / hang up
  const handleHangUp = useCallback(async () => {
    const s = useCallStore.getState();

    // Save transcript if any
    if (s.transcriptEntries.length > 0) {
      const durationSeconds = s.callStartTime
        ? Math.floor((Date.now() - s.callStartTime) / 1000)
        : undefined;

      saveTranscript.mutate({
        call_id: callId,
        content: s.transcriptEntries,
        duration_seconds: durationSeconds,
      });
    }

    // Update room status
    updateRoomStatus.mutate({
      id: callId,
      room_status: "ended",
      ended_at: new Date().toISOString(),
      actual_duration_seconds: s.callStartTime
        ? Math.floor((Date.now() - s.callStartTime) / 1000)
        : undefined,
    });

    stopTranscription();
    leaveCall();
  }, [callId, saveTranscript, updateRoomStatus, stopTranscription, leaveCall]);

  // Toggle transcription
  const handleToggleTranscript = useCallback(() => {
    if (useCallStore.getState().isTranscribing) {
      stopTranscription();
      setShowTranscript(false);
    } else {
      startTranscription();
      setShowTranscript(true);
    }
  }, [startTranscription, stopTranscription]);

  // Toggle screen share
  const handleToggleScreenShare = useCallback(() => {
    if (useCallStore.getState().isScreenSharing) {
      stopScreenShare();
    } else {
      startScreenShare();
    }
  }, [startScreenShare, stopScreenShare]);

  // Cleanup on unmount / beforeunload
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const { phase } = useCallStore.getState();
      if (phase === "connected" || phase === "connecting") {
        e.preventDefault();
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Download transcript as TXT
  const handleDownloadTranscript = () => {
    const s = useCallStore.getState();
    const callStart = s.callStartTime ?? Date.now();
    const lines = s.transcriptEntries.map((e) => {
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

  // Pre-join lobby with camera/mic preview
  if (!hasJoined) {
    const hasVideoTrack =
      previewStream?.getVideoTracks().some((t) => t.enabled) && previewCamera;

    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950 p-4">
        <div className="flex flex-col items-center gap-6 w-full max-w-lg">
          {/* Title */}
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white">{call.title}</h2>
            <p className="text-sm text-zinc-400 mt-1">
              {call.client?.full_name
                ? `Avec ${call.client.full_name}`
                : call.assigned_profile?.full_name
                  ? `Avec ${call.assigned_profile.full_name}`
                  : ""}
            </p>
          </div>

          {/* Video preview */}
          <div className="relative w-full aspect-video bg-zinc-900 rounded-2xl overflow-hidden">
            {hasVideoTrack ? (
              <video
                ref={previewVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-2xl font-bold text-white uppercase">
                  {myName.charAt(0)}
                </div>
                <span className="text-sm text-zinc-500 mt-3">
                  {previewError ?? "Camera desactivee"}
                </span>
              </div>
            )}

            {/* Mic level indicator (bottom left) */}
            {previewMic && (
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
                <Mic className="w-3.5 h-3.5 text-green-400" />
                <div className="flex items-end gap-px h-3">
                  {[0.15, 0.3, 0.5, 0.7, 0.9].map((threshold, i) => (
                    <div
                      key={i}
                      className="w-1 rounded-full transition-all duration-75"
                      style={{
                        height: `${40 + i * 15}%`,
                        backgroundColor:
                          previewAudioLevel >= threshold
                            ? "#4ade80"
                            : "#3f3f46",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Name tag (bottom right) */}
            <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-sm rounded-lg px-2.5 py-1">
              <span className="text-xs text-white font-medium">Vous</span>
            </div>
          </div>

          {/* Preview controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePreviewMic}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 ${
                previewMic
                  ? "bg-zinc-800 text-white hover:bg-zinc-700"
                  : "bg-red-600/20 text-red-400 hover:bg-red-600/30"
              }`}
              title={previewMic ? "Couper le micro" : "Activer le micro"}
            >
              {previewMic ? (
                <Mic className="w-5 h-5" />
              ) : (
                <MicOff className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={togglePreviewCamera}
              disabled={!previewStream?.getVideoTracks().length}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none ${
                previewCamera
                  ? "bg-zinc-800 text-white hover:bg-zinc-700"
                  : "bg-red-600/20 text-red-400 hover:bg-red-600/30"
              }`}
              title={previewCamera ? "Couper la camera" : "Activer la camera"}
            >
              {previewCamera ? (
                <Video className="w-5 h-5" />
              ) : (
                <VideoOff className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={handleJoin}
              className="h-12 px-8 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-all active:scale-[0.97] flex items-center gap-2 ml-2"
            >
              Rejoindre
            </button>
          </div>

          {!isTranscriptionSupported && (
            <p className="text-[11px] text-yellow-500/70 text-center">
              La transcription en direct n&apos;est pas disponible sur votre
              navigateur. Utilisez Chrome, Edge ou Safari pour cette
              fonctionnalite.
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
            <span className="text-xs text-zinc-400 hidden sm:inline">
              {call.title}
            </span>
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
