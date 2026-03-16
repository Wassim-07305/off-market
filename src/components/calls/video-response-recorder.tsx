"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSendVideoResponse } from "@/hooks/use-video-responses";
import type { VideoResponseRelatedType } from "@/types/database";
import { Video, Square, Send, X, RotateCcw, Loader2, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface VideoResponseRecorderProps {
  recipientId: string;
  relatedType: VideoResponseRelatedType;
  relatedId?: string;
  onClose: () => void;
  onSent?: () => void;
}

const MAX_DURATION = 300; // 5 minutes

export function VideoResponseRecorder({
  recipientId,
  relatedType,
  relatedId,
  onClose,
  onSent,
}: VideoResponseRecorderProps) {
  const [state, setState] = useState<
    "idle" | "recording" | "preview" | "sending"
  >("idle");
  const [elapsed, setElapsed] = useState(0);
  const [message, setMessage] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const sendVideo = useSendVideoResponse();

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      if (timerRef.current) clearInterval(timerRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const mimeType = MediaRecorder.isTypeSupported(
        "video/webm;codecs=vp9,opus",
      )
        ? "video/webm;codecs=vp9,opus"
        : "video/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(1000);
      setState("recording");
      setElapsed(0);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          if (prev >= MAX_DURATION - 1) {
            stopRecording();
            return MAX_DURATION;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      toast.error("Impossible d'acceder a la camera. Verifie les permissions.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const recorder = recorderRef.current;
    const stream = streamRef.current;

    if (recorder && recorder.state !== "inactive") {
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setState("preview");

        if (previewVideoRef.current) {
          previewVideoRef.current.src = url;
        }
      };
      recorder.stop();
    }

    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const handleRetake = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    chunksRef.current = [];
    setElapsed(0);
    setState("idle");
  }, [previewUrl]);

  const handleSend = useCallback(async () => {
    if (chunksRef.current.length === 0) return;

    setState("sending");
    setUploadProgress(0);

    const blob = new Blob(chunksRef.current, { type: "video/webm" });

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 10, 90));
    }, 300);

    try {
      await sendVideo.mutateAsync({
        videoBlob: blob,
        recipientId,
        relatedType,
        relatedId,
        message: message || undefined,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
      onSent?.();
      onClose();
    } catch {
      clearInterval(progressInterval);
      setState("preview");
    }
  }, [
    recipientId,
    relatedType,
    relatedId,
    message,
    sendVideo,
    onSent,
    onClose,
  ]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className="bg-surface rounded-2xl border border-border overflow-hidden"
      style={{ boxShadow: "var(--shadow-elevated)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Video className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">
            Reponse video
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Video area */}
      <div className="relative aspect-video bg-black">
        {/* Live camera feed */}
        {(state === "idle" || state === "recording") && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
            style={{ transform: "scaleX(-1)" }}
          />
        )}

        {/* Preview */}
        {(state === "preview" || state === "sending") && previewUrl && (
          <video
            ref={previewVideoRef}
            src={previewUrl}
            controls
            playsInline
            className="w-full h-full object-cover"
          />
        )}

        {/* Idle state overlay */}
        {state === "idle" && !streamRef.current && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3">
              <Video className="w-7 h-7 text-white/70" />
            </div>
            <p className="text-white/60 text-sm">
              Clique pour lancer la camera
            </p>
          </div>
        )}

        {/* Recording indicator */}
        {state === "recording" && (
          <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-[#DC2626] animate-pulse" />
            <span className="text-white text-xs font-mono font-medium">
              {formatTime(elapsed)} / {formatTime(MAX_DURATION)}
            </span>
          </div>
        )}

        {/* Audio level indicator */}
        {state === "recording" && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-black/60 backdrop-blur-sm">
            <Mic className="w-3 h-3 text-white/70" />
            <div className="flex gap-0.5">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-0.5 bg-white/60 rounded-full animate-pulse"
                  style={{
                    height: `${6 + Math.random() * 8}px`,
                    animationDelay: `${i * 150}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Upload progress */}
        {state === "sending" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
            <Loader2 className="w-8 h-8 text-white animate-spin mb-3" />
            <p className="text-white text-sm font-medium mb-2">
              Envoi en cours...
            </p>
            <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${uploadProgress}%`,
                  backgroundColor: "#DC2626",
                }}
              />
            </div>
            <span className="text-white/60 text-xs mt-1">
              {uploadProgress}%
            </span>
          </div>
        )}
      </div>

      {/* Message input (preview state) */}
      {(state === "preview" || state === "sending") && (
        <div className="px-4 py-3 border-t border-border">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ajouter un message (optionnel)..."
            disabled={state === "sending"}
            className="w-full h-9 px-3 bg-muted/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow disabled:opacity-50"
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 px-4 py-4 border-t border-border">
        {state === "idle" && (
          <button
            onClick={startRecording}
            className={cn(
              "h-10 px-5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all active:scale-[0.97]",
              "text-white",
            )}
            style={{ backgroundColor: "#DC2626" }}
          >
            <Video className="w-4 h-4" />
            Demarrer l&apos;enregistrement
          </button>
        )}

        {state === "recording" && (
          <button
            onClick={stopRecording}
            className="h-12 w-12 rounded-full flex items-center justify-center text-white transition-all active:scale-[0.95]"
            style={{ backgroundColor: "#DC2626" }}
          >
            <Square className="w-5 h-5 fill-current" />
          </button>
        )}

        {state === "preview" && (
          <>
            <button
              onClick={handleRetake}
              className="h-10 px-4 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Recommencer
            </button>
            <button
              onClick={handleSend}
              className="h-10 px-5 rounded-xl text-sm font-medium text-white flex items-center gap-2 transition-all active:scale-[0.97]"
              style={{ backgroundColor: "#DC2626" }}
            >
              <Send className="w-4 h-4" />
              Envoyer
            </button>
          </>
        )}
      </div>
    </div>
  );
}
