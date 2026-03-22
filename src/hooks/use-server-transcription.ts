"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

interface TranscriptionResult {
  text: string;
  segments?: Array<{ start: number; end: number; text: string }>;
  duration?: number;
}

interface TranscribeOptions {
  blob: Blob;
  callId?: string;
  fileName?: string;
}

export function useServerTranscription() {
  const transcribe = useMutation({
    mutationFn: async ({
      blob,
      callId,
      fileName,
    }: TranscribeOptions): Promise<TranscriptionResult> => {
      const formData = new FormData();
      formData.append(
        "file",
        new File([blob], fileName ?? "recording.webm", { type: blob.type }),
      );
      if (callId) {
        formData.append("call_id", callId);
      }

      const response = await fetch("/api/transcriptions/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.error ?? "Erreur lors de la transcription",
        );
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Transcription terminee avec succes");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erreur lors de la transcription");
    },
  });

  return {
    transcribe,
    isTranscribing: transcribe.isPending,
    transcriptionResult: transcribe.data ?? null,
    error: transcribe.error,
  };
}
