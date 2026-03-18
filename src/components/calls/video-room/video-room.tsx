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
import { CallChatPanel } from "./call-chat-panel";
import { SessionNotesPanel } from "./session-notes-panel";
import { CallEndedSummary } from "./call-ended-summary";
import {
  Loader2,
  Mic,
  MicOff,
  Video,
  VideoOff,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  PreCallQuestions,
  PreCallResponsesView,
} from "@/components/calls/pre-call-questions";

interface VideoRoomProps {
  callId: string;
}

export function VideoRoom({ callId }: VideoRoomProps) {
  const { user, profile } = useAuth();
  const { data: call, isLoading } = useCallById(callId);
  const { updateRoomStatus, saveTranscript } = useCalls();
  const supabase = useSupabase();
  const phase = useCallStore((s) => s.phase);
  const resetCall = useCallStore((s) => s.resetCall);

  const [showTranscript, setShowTranscript] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showPreCallResponses, setShowPreCallResponses] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [preCallCompleted, setPreCallCompleted] = useState(false);
  const [showHangUpConfirm, setShowHangUpConfirm] = useState(false);

  // Reset call store when mounting (cleans up stale "ended" state from previous calls)
  useEffect(() => {
    resetCall();
  }, [callId, resetCall]);

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

  const router = useRouter();
  const myName = profile?.full_name ?? "Utilisateur";

  // Error callback from WebRTC — show toast
  const handleWebRTCError = useCallback((message: string) => {
    toast.error(message, { duration: 5000 });
  }, []);

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
        // Resume AudioContext on mobile (required after user gesture)
        if (audioCtx.state === "suspended") {
          await audioCtx.resume();
        }
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
          if (!cancelled) {
            setPreviewError("Impossible d'acceder au micro et a la camera");
            toast.error(
              "Verifiez les permissions de votre navigateur pour le micro et la camera.",
              { duration: 6000 },
            );
          }
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
    // Resume AudioContext on user gesture (mobile)
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume();
    }
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
    cameraStream,
  } = useWebRTC({ callId, onError: handleWebRTCError });

  const {
    isSupported: isTranscriptionSupported,
    startTranscription,
    stopTranscription,
  } = useTranscription({
    speakerId: user?.id ?? "",
    speakerName: myName,
    onEntry: (entry) => broadcastTranscript(entry),
  });

  // Save transcript helper (used for hangup and beforeunload)
  const saveTranscriptNow = useCallback(() => {
    const s = useCallStore.getState();
    if (s.transcriptEntries.length === 0) return;

    const durationSeconds = s.callStartTime
      ? Math.floor((Date.now() - s.callStartTime) / 1000)
      : undefined;

    saveTranscript.mutate({
      call_id: callId,
      content: s.transcriptEntries,
      duration_seconds: durationSeconds,
    });
  }, [callId, saveTranscript]);

  // Join the call
  const handleJoin = useCallback(async () => {
    if (!call || !user || isJoining) return;

    setIsJoining(true);

    // Stop preview stream before WebRTC takes over
    cleanupPreview();

    // Reset store in case of a previous failed attempt
    resetCall();

    // Carry over preview toggles to the call store
    const s = useCallStore.getState();
    if (!previewMic) s.toggleMic();
    if (!previewCamera) s.toggleCamera();

    // Join the call (getUserMedia + WebRTC + signaling) — wait for completion
    // so the UI only transitions when media is ready
    await joinCall();

    // If setup failed (phase set to "ended"), don't transition
    const phase = useCallStore.getState().phase;
    if (phase === "ended") {
      setIsJoining(false);
      return;
    }

    // Transition to the in-call view
    setHasJoined(true);
    setIsJoining(false);

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
    isJoining,
    resetCall,
  ]);

  // Actual hang-up logic (after confirmation)
  const executeHangUp = useCallback(() => {
    setShowHangUpConfirm(false);

    // Save transcript
    saveTranscriptNow();

    // Update room status
    const s = useCallStore.getState();
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
  }, [
    callId,
    saveTranscriptNow,
    updateRoomStatus,
    stopTranscription,
    leaveCall,
  ]);

  // Leave / hang up — shows confirmation dialog
  const handleHangUp = useCallback(() => {
    const s = useCallStore.getState();
    // If call lasted > 5 seconds and remote was ever connected, show confirmation
    if (s.callStartTime && Date.now() - s.callStartTime > 5000) {
      setShowHangUpConfirm(true);
    } else {
      executeHangUp();
    }
  }, [executeHangUp]);

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

  // Save transcript on beforeunload + warn user
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const { phase, transcriptEntries } = useCallStore.getState();
      if (phase === "connected" || phase === "connecting") {
        e.preventDefault();
        // Save transcript as a last resort
        if (transcriptEntries.length > 0) {
          saveTranscriptNow();
        }
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveTranscriptNow]);

  // Show reconnection toast when phase changes to reconnecting
  useEffect(() => {
    if (phase === "reconnecting" && hasJoined) {
      toast.warning("Reconnexion en cours...", {
        id: "reconnecting-toast",
        duration: Infinity,
      });
    } else if (phase === "connected" && hasJoined) {
      toast.dismiss("reconnecting-toast");
    }
  }, [phase, hasJoined]);

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
  if (phase === "ended" && hasJoined) {
    return (
      <CallEndedSummary
        callId={callId}
        callTitle={call.title}
        onDownloadTranscript={handleDownloadTranscript}
      />
    );
  }

  // Determine if the current user is staff (coach/admin) — they skip pre-call questions
  const isStaffUser = profile?.role === "admin" || profile?.role === "coach";

  // Pre-join lobby with camera/mic preview
  if (!hasJoined) {
    // Non-staff users must complete pre-call questions before seeing the lobby
    const showPreCallGate = !isStaffUser && !preCallCompleted;

    if (showPreCallGate) {
      return (
        <div className="flex-1 flex items-center justify-center bg-zinc-950 p-4 overflow-y-auto relative">
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <PreCallQuestions
            callId={callId}
            callTitle={call.title}
            onCompleted={() => setPreCallCompleted(true)}
          />
        </div>
      );
    }

    const hasVideoTrack =
      previewStream?.getVideoTracks().some((t) => t.enabled) && previewCamera;

    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-950 p-4 relative">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-4 flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

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

          {/* Pre-call responses summary for staff in the lobby */}
          {isStaffUser && (
            <div className="w-full">
              <PreCallResponsesView callId={callId} />
            </div>
          )}

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
              disabled={isJoining}
              className="h-12 px-8 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-all active:scale-[0.97] flex items-center gap-2 ml-2 disabled:opacity-70 disabled:pointer-events-none"
            >
              {isJoining ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connexion...
                </>
              ) : (
                "Rejoindre"
              )}
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
          cameraStream={cameraStream}
          localName={myName}
        />

        {/* Controls */}
        <CallControls
          onToggleMic={toggleMic}
          onToggleCamera={toggleCamera}
          onToggleScreenShare={handleToggleScreenShare}
          onToggleTranscript={handleToggleTranscript}
          onToggleNotes={() => setShowNotes((v) => !v)}
          onToggleChat={() => setShowChat((v) => !v)}
          showChat={showChat}
          onTogglePreCallResponses={
            isStaffUser ? () => setShowPreCallResponses((v) => !v) : undefined
          }
          onHangUp={handleHangUp}
          showTranscript={showTranscript}
          showNotes={showNotes}
          showPreCallResponses={showPreCallResponses}
          isTranscriptionSupported={isTranscriptionSupported}
        />
      </div>

      {/* Transcript panel (slides in from right) */}
      {showTranscript && (
        <TranscriptPanel onClose={() => setShowTranscript(false)} />
      )}

      {/* Chat panel */}
      {showChat && (
        <CallChatPanel callId={callId} onClose={() => setShowChat(false)} />
      )}

      {/* Session notes panel */}
      {showNotes && (
        <SessionNotesPanel
          callId={callId}
          clientName={call.client?.full_name ?? undefined}
          onClose={() => setShowNotes(false)}
        />
      )}

      {/* Pre-call responses panel (staff only, slides in from right) */}
      {showPreCallResponses && isStaffUser && (
        <div className="w-80 lg:w-96 bg-zinc-900/95 border-l border-white/5 flex flex-col h-full">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="text-amber-400">&#9997;</span>
              Reponses pre-appel
            </h3>
            <button
              onClick={() => setShowPreCallResponses(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              &times;
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <PreCallResponsesView callId={callId} />
          </div>
        </div>
      )}

      {/* Hang-up confirmation dialog */}
      {showHangUpConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-white/10 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-600/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">
                Quitter l&apos;appel ?
              </h3>
            </div>
            <p className="text-sm text-zinc-400 mb-6">
              Etes-vous sur de vouloir raccrocher ? L&apos;appel sera termine
              pour tous les participants.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowHangUpConfirm(false)}
                className="flex-1 h-10 rounded-xl bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={executeHangUp}
                className="flex-1 h-10 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Raccrocher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
