"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";
import { toast } from "sonner";

function getSupportedMimeType(): string {
  const types = [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "audio/webm;codecs=opus",
    "audio/webm",
  ];
  for (const type of types) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "";
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export interface CallRecordingState {
  isRecording: boolean;
  duration: number;
  durationFormatted: string;
  recordingBlob: Blob | null;
  recordingUrl: string | null;
  isSaving: boolean;
}

export function useCallRecording(callId: string | null) {
  const supabase = useSupabase();
  const { user } = useAuth();

  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mimeTypeRef = useRef<string>("");
  const startTimeRef = useRef<number>(0);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = useCallback(
    (stream: MediaStream) => {
      if (!stream || isRecording) return;

      const mimeType = getSupportedMimeType();
      if (!mimeType) {
        toast.error(
          "L'enregistrement n'est pas supporte par ce navigateur. Utilisez Chrome ou Edge.",
        );
        return;
      }

      mimeTypeRef.current = mimeType;
      chunksRef.current = [];

      try {
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 2_500_000,
        });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunksRef.current.push(e.data);
          }
        };

        mediaRecorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          setRecordingBlob(blob);
        };

        mediaRecorder.onerror = () => {
          toast.error("Erreur lors de l'enregistrement");
          setIsRecording(false);
          if (timerRef.current) clearInterval(timerRef.current);
        };

        // Record in 1-second chunks for more reliable data capture
        mediaRecorder.start(1000);
        setIsRecording(true);
        setDuration(0);
        setRecordingBlob(null);
        setRecordingUrl(null);
        startTimeRef.current = Date.now();

        timerRef.current = setInterval(() => {
          setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
        }, 1000);

        toast.success("Enregistrement demarre");
      } catch {
        toast.error("Impossible de demarrer l'enregistrement");
      }
    },
    [isRecording],
  );

  const stopRecording = useCallback((): Blob | null => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      setIsRecording(false);
      return null;
    }

    // Return a promise-like pattern: stop and let onstop build the blob
    recorder.stop();
    setIsRecording(false);

    // Build blob synchronously from accumulated chunks
    const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
    if (blob.size > 0) {
      setRecordingBlob(blob);
      return blob;
    }

    return null;
  }, []);

  const saveRecording = useCallback(async () => {
    if (!recordingBlob || !callId || !user) {
      toast.error("Aucun enregistrement a sauvegarder");
      return null;
    }

    setIsSaving(true);

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const extension = mimeTypeRef.current.includes("video") ? "webm" : "webm";
      const fileName = `${callId}/${timestamp}.${extension}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("call-recordings")
        .upload(fileName, recordingBlob, {
          contentType: mimeTypeRef.current || "video/webm",
          cacheControl: "3600",
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("call-recordings")
        .getPublicUrl(fileName);

      // Save metadata to database
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: dbError } = await (supabase as any)
        .from("call_recordings")
        .insert({
          call_id: callId,
          recorded_by: user.id,
          storage_path: fileName,
          duration_seconds: duration,
          file_size_bytes: recordingBlob.size,
          mime_type: mimeTypeRef.current || "video/webm",
        })
        .select("id")
        .single();

      if (dbError) throw dbError;

      const url = urlData?.publicUrl ?? null;
      setRecordingUrl(url);
      toast.success("Enregistrement sauvegarde avec succes");

      return { id: data?.id, url };
    } catch (err) {
      console.error("[CallRecording] Save error:", err);
      toast.error("Erreur lors de la sauvegarde de l'enregistrement");
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [recordingBlob, callId, user, supabase, duration]);

  const downloadRecording = useCallback(() => {
    if (!recordingBlob) {
      toast.error("Aucun enregistrement a telecharger");
      return;
    }

    const extension = mimeTypeRef.current.includes("video") ? "webm" : "webm";
    const fileName = `enregistrement-${callId ?? "appel"}-${new Date().toISOString().slice(0, 10)}.${extension}`;

    const url = URL.createObjectURL(recordingBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Telechargement demarre");
  }, [recordingBlob, callId]);

  const resetRecording = useCallback(() => {
    setRecordingBlob(null);
    setRecordingUrl(null);
    setDuration(0);
    setIsRecording(false);
    chunksRef.current = [];
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    isRecording,
    duration,
    durationFormatted: formatDuration(duration),
    recordingBlob,
    recordingUrl,
    isSaving,
    startRecording,
    stopRecording,
    saveRecording,
    downloadRecording,
    resetRecording,
  };
}
