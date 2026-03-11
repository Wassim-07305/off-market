"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Mic, Square, Send, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface VoiceRecorderProps {
  onSend: (blob: Blob, duration: number) => Promise<void>;
}

function getSupportedMimeType(): string {
  const types = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

export function VoiceRecorder({ onSend }: VoiceRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [sending, setSending] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [levels, setLevels] = useState<number[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const mimeTypeRef = useRef<string>("");

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  const startRecording = useCallback(async () => {
    try {
      const mimeType = getSupportedMimeType();
      if (!mimeType) {
        toast.error(
          "L'enregistrement vocal n'est pas supporte par ce navigateur",
        );
        return;
      }
      mimeTypeRef.current = mimeType;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Analyser for waveform
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
        audioCtx.close();
      };

      mediaRecorder.start(100);
      setRecording(true);
      setElapsed(0);
      setLevels([]);

      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);

      // Animate levels
      const updateLevels = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length / 255;
        setLevels((prev) => [...prev.slice(-50), avg]);
        animFrameRef.current = requestAnimationFrame(updateLevels);
      };
      updateLevels();
    } catch {
      toast.error("Impossible d'acceder au microphone");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) clearInterval(timerRef.current);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setRecording(false);
  }, []);

  const cancelRecording = useCallback(() => {
    stopRecording();
    setAudioBlob(null);
    setElapsed(0);
    setLevels([]);
  }, [stopRecording]);

  const sendRecording = useCallback(async () => {
    if (!audioBlob) return;
    setSending(true);
    try {
      await onSend(audioBlob, elapsed);
    } finally {
      setSending(false);
      setAudioBlob(null);
      setElapsed(0);
      setLevels([]);
    }
  }, [audioBlob, elapsed, onSend]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Not recording and no recorded audio → show mic button
  if (!recording && !audioBlob) {
    return (
      <button
        onClick={startRecording}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
        title="Message vocal"
      >
        <Mic className="w-4 h-4" />
      </button>
    );
  }

  // Recording in progress
  if (recording) {
    return (
      <div className="flex items-center gap-2 flex-1">
        {/* Cancel */}
        <button
          onClick={cancelRecording}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Live waveform */}
        <div className="flex-1 flex items-center gap-px h-8 px-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0 mr-2" />
          <div className="flex-1 flex items-end gap-[2px] h-6">
            {levels.slice(-35).map((level, i) => (
              <div
                key={i}
                className="flex-1 rounded-full bg-primary/60 transition-all duration-75"
                style={{ height: `${Math.max(level * 100, 8)}%` }}
              />
            ))}
            {levels.length < 35 &&
              Array.from({ length: 35 - levels.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex-1 rounded-full bg-border"
                  style={{ height: "8%" }}
                />
              ))}
          </div>
        </div>

        {/* Timer */}
        <span className="text-xs font-mono text-muted-foreground w-10 text-right shrink-0">
          {formatTime(elapsed)}
        </span>

        {/* Stop */}
        <button
          onClick={stopRecording}
          className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors shrink-0"
        >
          <Square className="w-3 h-3 fill-current" />
        </button>
      </div>
    );
  }

  // Recorded audio ready to send
  return (
    <div className="flex items-center gap-2 flex-1">
      <button
        onClick={cancelRecording}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-primary/5 rounded-lg border border-primary/20">
        <Mic className="w-3.5 h-3.5 text-primary shrink-0" />
        <div className="flex-1 flex items-center gap-px h-5">
          {levels.slice(-40).map((level, i) => (
            <div
              key={i}
              className="flex-1 rounded-full bg-primary/40"
              style={{ height: `${Math.max(level * 100, 12)}%` }}
            />
          ))}
        </div>
        <span className="text-[11px] font-mono text-primary shrink-0">
          {formatTime(elapsed)}
        </span>
      </div>

      <button
        onClick={sendRecording}
        disabled={sending}
        className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors shrink-0 disabled:opacity-50"
      >
        {sending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Send className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}
