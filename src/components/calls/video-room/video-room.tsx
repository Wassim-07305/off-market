"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useCalls, useCallById } from "@/hooks/use-calls";
import { useCreateWherebyRoom } from "@/hooks/use-whereby";
import { useTranscription } from "@/hooks/use-transcription";
import { useSupabase } from "@/hooks/use-supabase";
import { useCallStore } from "@/stores/call-store";
import { CallControls } from "./call-controls";
import { CallTimer } from "./call-timer";
import { TranscriptPanel } from "./transcript-panel";
import { SessionNotesPanel } from "./session-notes-panel";
import { CallEndedSummary } from "./call-ended-summary";
import { Loader2, Mic, MicOff, Video, VideoOff } from "lucide-react";
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
  const createRoom = useCreateWherebyRoom();
  const supabase = useSupabase();
  const store = useCallStore();

  const [showTranscript, setShowTranscript] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [showPreCallResponses, setShowPreCallResponses] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);
  const [preCallCompleted, setPreCallCompleted] = useState(false);
  const [wherebyUrl, setWherebyUrl] = useState<string | null>(null);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const wherebyRef = useRef<HTMLIFrameElement | null>(null);

  // Preview lobby state
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [previewMic, setPreviewMic] = useState(true);
  const [previewCamera, setPreviewCamera] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewAudioLevel, setPreviewAudioLevel] = useState(0);
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

  // Reset call store when mounting
  useEffect(() => {
    store.resetCall();
  }, [callId]); // eslint-disable-line react-hooks/exhaustive-deps

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

        const audioCtx = new AudioContext();
        const source = audioCtx.createMediaStreamSource(stream);
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        audioCtxRef.current = audioCtx;
        analyserRef.current = analyser;
      } catch {
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
      setPreviewAudioLevel(Math.min(avg / 80, 1));
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [previewMic]);

  const togglePreviewMic = useCallback(() => {
    previewStream?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setPreviewMic((v) => !v);
  }, [previewStream]);

  const togglePreviewCamera = useCallback(() => {
    previewStream?.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
    setPreviewCamera((v) => !v);
  }, [previewStream]);

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

  // Transcription (browser Speech API — works independently of Whereby)
  const {
    isSupported: isTranscriptionSupported,
    startTranscription,
    stopTranscription,
  } = useTranscription({
    speakerId: user?.id ?? "",
    speakerName: myName,
    onEntry: () => {
      // Transcript entries are added to the store by useTranscription
    },
  });

  // Join the call — create or reuse Whereby room
  const handleJoin = useCallback(async () => {
    if (!call || !user) return;

    cleanupPreview();
    setHasJoined(true);
    setCreatingRoom(true);

    // Update room status
    updateRoomStatus.mutate({
      id: callId,
      room_status: "waiting",
      started_at: new Date().toISOString(),
    });

    // Check if call already has a Whereby room URL
    const existingRoomUrl =
      (call as Record<string, unknown>).whereby_room_url as string | null;
    const existingHostUrl =
      (call as Record<string, unknown>).whereby_host_url as string | null;

    const isStaff = profile?.role === "admin" || profile?.role === "coach";

    if (existingRoomUrl) {
      // Reuse existing room
      const url = isStaff && existingHostUrl ? existingHostUrl : existingRoomUrl;
      setWherebyUrl(buildWherebyUrl(url, myName, !previewMic, !previewCamera));
      setCreatingRoom(false);
    } else {
      // Create new Whereby room
      try {
        const result = await createRoom.mutateAsync({
          callId,
          callTitle: call.title,
        });
        const url = isStaff ? result.hostRoomUrl : result.roomUrl;
        setWherebyUrl(buildWherebyUrl(url, myName, !previewMic, !previewCamera));
      } catch {
        // Fall back — room creation failed
        setHasJoined(false);
      } finally {
        setCreatingRoom(false);
      }
    }

    // Notify the other participant
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

    // Mark as connected
    useCallStore.getState().setPhase("connected");
    useCallStore.getState().setCallStartTime(Date.now());
  }, [
    call,
    user,
    callId,
    myName,
    profile,
    createRoom,
    updateRoomStatus,
    supabase,
    cleanupPreview,
    previewMic,
    previewCamera,
  ]);

  // Leave / hang up
  const handleHangUp = useCallback(() => {
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
    setWherebyUrl(null);
    useCallStore.getState().setPhase("ended");
  }, [callId, saveTranscript, updateRoomStatus, stopTranscription]);

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

  // Whereby handles screen share natively — just toggle in store for UI state
  const handleToggleScreenShare = useCallback(() => {
    // Screen sharing is handled directly by Whereby UI
    // This button is kept for visual consistency but Whereby manages it
  }, []);

  // Cleanup on unmount
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

  // Download transcript
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

  // Toggle mic/camera via Whereby postMessage
  const toggleWherebyMic = useCallback(() => {
    wherebyRef.current?.contentWindow?.postMessage(
      { type: "whereby:toggle_microphone" },
      "*",
    );
    useCallStore.getState().toggleMic();
  }, []);

  const toggleWherebyCamera = useCallback(() => {
    wherebyRef.current?.contentWindow?.postMessage(
      { type: "whereby:toggle_camera" },
      "*",
    );
    useCallStore.getState().toggleCamera();
  }, []);

  // Listen for Whereby events via postMessage
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (typeof event.data !== "object" || !event.data.type) return;

      switch (event.data.type) {
        case "whereby:participant_joined":
          useCallStore.getState().setRemoteConnected(true);
          useCallStore.getState().setPhase("connected");
          updateRoomStatus.mutate({
            id: callId,
            room_status: "active",
          });
          break;
        case "whereby:participant_left":
          // Don't end immediately — other participant may rejoin
          useCallStore.getState().setRemoteConnected(false);
          break;
        case "whereby:meeting_end":
          handleHangUp();
          break;
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [callId, updateRoomStatus, handleHangUp]);

  // --- RENDER ---

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
        callId={callId}
        callTitle={call.title}
        onDownloadTranscript={handleDownloadTranscript}
      />
    );
  }

  const isStaffUser = profile?.role === "admin" || profile?.role === "coach";

  // Pre-join lobby
  if (!hasJoined) {
    const showPreCallGate = !isStaffUser && !preCallCompleted;

    if (showPreCallGate) {
      return (
        <div className="flex-1 flex items-center justify-center bg-zinc-950 p-4 overflow-y-auto">
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
      <div className="flex-1 flex items-center justify-center bg-zinc-950 p-4">
        <div className="flex flex-col items-center gap-6 w-full max-w-lg">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white">{call.title}</h2>
            <p className="text-sm text-zinc-400 mt-1">
              {call.client?.full_name
                ? `Avec ${call.client.full_name}`
                : call.assigned_profile?.full_name
                  ? `Avec ${call.assigned_profile.full_name}`
                  : ""}
            </p>
            <p className="text-xs text-zinc-500 mt-2 flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Appel video via Whereby
            </p>
          </div>

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
              disabled={creatingRoom}
              className="h-12 px-8 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-all active:scale-[0.97] flex items-center gap-2 ml-2 disabled:opacity-60"
            >
              {creatingRoom ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Preparation...
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

  // In-call view — Whereby iframe + side panels
  return (
    <div className="flex-1 flex bg-zinc-950 h-full">
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-950/80 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-400 font-medium">
                En cours
              </span>
            </div>
            <span className="text-xs text-zinc-400 hidden sm:inline">
              {call.title}
            </span>
          </div>
          <CallTimer />
        </div>

        {/* Whereby iframe */}
        <div className="flex-1 min-h-0">
          {wherebyUrl ? (
            <iframe
              ref={wherebyRef}
              src={wherebyUrl}
              allow="camera; microphone; autoplay; display-capture; compute-pressure"
              className="w-full h-full border-0"
              title="Appel video Whereby"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-zinc-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Controls — transcription, notes, pre-call responses, hang up */}
        <CallControls
          onToggleMic={toggleWherebyMic}
          onToggleCamera={toggleWherebyCamera}
          onToggleScreenShare={handleToggleScreenShare}
          onToggleTranscript={handleToggleTranscript}
          onToggleNotes={() => setShowNotes((v) => !v)}
          onTogglePreCallResponses={
            isStaffUser
              ? () => setShowPreCallResponses((v) => !v)
              : undefined
          }
          onHangUp={handleHangUp}
          showTranscript={showTranscript}
          showNotes={showNotes}
          showPreCallResponses={showPreCallResponses}
          isTranscriptionSupported={isTranscriptionSupported}
        />
      </div>

      {/* Transcript panel */}
      {showTranscript && (
        <TranscriptPanel onClose={() => setShowTranscript(false)} />
      )}

      {/* Session notes panel */}
      {showNotes && (
        <SessionNotesPanel
          callId={callId}
          clientName={call.client?.full_name ?? undefined}
          onClose={() => setShowNotes(false)}
        />
      )}

      {/* Pre-call responses panel (staff only) */}
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
    </div>
  );
}

// Build Whereby embed URL with display name and initial media state
function buildWherebyUrl(
  baseUrl: string,
  displayName: string,
  micOff: boolean,
  cameraOff: boolean,
): string {
  const url = new URL(baseUrl);
  // Embed params
  url.searchParams.set("displayName", displayName);
  url.searchParams.set("minimal", "true"); // Hide Whereby UI chrome (we have our own controls)
  url.searchParams.set("screenshare", "on");
  url.searchParams.set("chat", "off"); // We have our own messaging
  url.searchParams.set("leaveButton", "off"); // We have our own hang up
  url.searchParams.set("precallReview", "off"); // We have our own lobby
  url.searchParams.set("logo", "off");
  url.searchParams.set("background", "off");
  url.searchParams.set("lang", "fr");
  if (micOff) url.searchParams.set("audio", "off");
  if (cameraOff) url.searchParams.set("video", "off");
  return url.toString();
}
