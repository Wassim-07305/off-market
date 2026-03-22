"use client";

import { useCallback, useState } from "react";
import {
  Circle,
  Square,
  Save,
  Download,
  RotateCcw,
  Loader2,
  FileAudio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallRecording } from "@/hooks/use-call-recording";
import { useServerTranscription } from "@/hooks/use-server-transcription";

interface RecordingControlsProps {
  callId: string;
  stream: MediaStream | null;
}

export function RecordingControls({ callId, stream }: RecordingControlsProps) {
  const {
    isRecording,
    durationFormatted,
    recordingBlob,
    isSaving,
    startRecording,
    stopRecording,
    saveRecording,
    downloadRecording,
    resetRecording,
  } = useCallRecording(callId);

  const { transcribe, isTranscribing, transcriptionResult } =
    useServerTranscription();
  const [showTranscriptionResult, setShowTranscriptionResult] = useState(false);

  const handleTranscribe = useCallback(() => {
    if (!recordingBlob) return;
    transcribe.mutate(
      { blob: recordingBlob, callId },
      { onSuccess: () => setShowTranscriptionResult(true) },
    );
  }, [recordingBlob, callId, transcribe]);

  const handleStart = useCallback(() => {
    if (!stream) return;
    startRecording(stream);
  }, [stream, startRecording]);

  const handleStop = useCallback(() => {
    stopRecording();
  }, [stopRecording]);

  // Not recording and no recorded blob: show record button
  if (!isRecording && !recordingBlob) {
    return (
      <button
        onClick={handleStart}
        disabled={!stream}
        title="Enregistrer l'appel"
        className={cn(
          "w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90",
          "bg-surface/10 text-white hover:bg-surface/20",
          "disabled:opacity-30 disabled:pointer-events-none",
        )}
      >
        <Circle className="w-5 h-5 fill-red-500 text-red-500" />
      </button>
    );
  }

  // Recording in progress: show pulsing indicator + timer + stop button
  if (isRecording) {
    return (
      <div className="flex items-center gap-2">
        {/* Consent notice */}
        <div className="flex items-center gap-2 bg-red-600/20 backdrop-blur-sm rounded-full px-3 py-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
          <span className="text-[11px] font-medium text-red-300 whitespace-nowrap">
            Enregistrement en cours
          </span>
          <span className="text-[11px] font-mono text-red-200/80 tabular-nums">
            {durationFormatted}
          </span>
        </div>

        {/* Stop button */}
        <button
          onClick={handleStop}
          title="Arreter l'enregistrement"
          className={cn(
            "w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90",
            "bg-red-600/20 text-red-400 hover:bg-red-600/30",
          )}
        >
          <Square className="w-4 h-4 fill-current" />
        </button>
      </div>
    );
  }

  // Recording stopped, blob available: show save/download/reset/transcribe actions
  return (
    <div className="relative flex items-center gap-2">
      <div className="flex items-center gap-1.5 bg-surface/10 backdrop-blur-sm rounded-full px-3 py-1.5">
        <span className="text-[11px] font-medium text-zinc-300 whitespace-nowrap">
          Enregistrement pret
        </span>
        <span className="text-[11px] font-mono text-zinc-400 tabular-nums">
          {durationFormatted}
        </span>
      </div>

      {/* Save to cloud */}
      <button
        onClick={saveRecording}
        disabled={isSaving}
        title="Sauvegarder l'enregistrement"
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90",
          "bg-green-600/20 text-green-400 hover:bg-green-600/30",
          "disabled:opacity-50 disabled:pointer-events-none",
        )}
      >
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Save className="w-4 h-4" />
        )}
      </button>

      {/* Transcribe server-side */}
      <button
        onClick={handleTranscribe}
        disabled={isTranscribing || !!transcriptionResult}
        title={
          transcriptionResult
            ? "Transcription effectuee"
            : "Transcrire l'enregistrement (Whisper)"
        }
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90",
          transcriptionResult
            ? "bg-blue-600/20 text-blue-300 opacity-70"
            : "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30",
          "disabled:pointer-events-none",
          isTranscribing && "opacity-50",
        )}
      >
        {isTranscribing ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <FileAudio className="w-4 h-4" />
        )}
      </button>

      {/* Download locally */}
      <button
        onClick={downloadRecording}
        title="Telecharger l'enregistrement"
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90",
          "bg-surface/10 text-white hover:bg-surface/20",
        )}
      >
        <Download className="w-4 h-4" />
      </button>

      {/* Reset / discard */}
      <button
        onClick={resetRecording}
        title="Supprimer l'enregistrement"
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90",
          "bg-surface/10 text-zinc-400 hover:bg-surface/20 hover:text-white",
        )}
      >
        <RotateCcw className="w-4 h-4" />
      </button>

      {/* Transcription result popup */}
      {showTranscriptionResult && transcriptionResult && (
        <div className="absolute bottom-full mb-2 left-0 right-0 mx-auto w-80 bg-zinc-900 border border-white/10 rounded-xl p-3 shadow-2xl z-50">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <FileAudio className="w-3.5 h-3.5 text-blue-400" />
              Transcription Whisper
            </span>
            <button
              onClick={() => setShowTranscriptionResult(false)}
              className="text-zinc-500 hover:text-white text-xs px-1.5 py-0.5 rounded hover:bg-zinc-800 transition-colors"
            >
              Fermer
            </button>
          </div>
          <p className="text-xs text-zinc-300 max-h-32 overflow-y-auto leading-relaxed whitespace-pre-wrap">
            {transcriptionResult.text}
          </p>
          {transcriptionResult.duration && (
            <p className="text-[10px] text-zinc-600 mt-2">
              Duree audio : {Math.round(transcriptionResult.duration)}s
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Compact consent banner shown to all participants when recording is active.
 * Place this in the video room top bar.
 */
export function RecordingConsentBanner({
  isRecording,
}: {
  isRecording: boolean;
}) {
  if (!isRecording) return null;

  return (
    <div className="flex items-center gap-2 bg-red-600/15 border border-red-500/20 rounded-lg px-3 py-1.5">
      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
      <span className="text-[11px] font-medium text-red-300">
        Cet appel est enregistre
      </span>
    </div>
  );
}
