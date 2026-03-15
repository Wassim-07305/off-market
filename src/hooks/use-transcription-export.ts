"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

export function useExportTranscriptionPdf(recordingId: string | null) {
  const [isExporting, setIsExporting] = useState(false);

  const exportPdf = useCallback(async () => {
    if (!recordingId) {
      toast.error("Aucun enregistrement selectionne");
      return;
    }

    setIsExporting(true);

    try {
      const response = await fetch(`/api/transcriptions/${recordingId}/pdf`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error ?? "Erreur lors de l'export");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);

      const disposition = response.headers.get("Content-Disposition");
      const fileNameMatch = disposition?.match(/filename="(.+?)"/);
      const fileName =
        fileNameMatch?.[1] ??
        `transcription-${new Date().toISOString().slice(0, 10)}.pdf`;

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Transcription exportee en PDF");
    } catch (err) {
      console.error("[TranscriptionExport] Error:", err);
      toast.error(
        err instanceof Error ? err.message : "Erreur lors de l'export PDF",
      );
    } finally {
      setIsExporting(false);
    }
  }, [recordingId]);

  return { exportPdf, isExporting };
}
