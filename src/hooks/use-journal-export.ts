"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";

interface ExportOptions {
  from: string;
  to: string;
  userId?: string;
}

export function useExportJournalPdf() {
  const [isExporting, setIsExporting] = useState(false);

  const exportPdf = useCallback(async (options: ExportOptions) => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        from: options.from,
        to: options.to,
      });
      if (options.userId) {
        params.set("userId", options.userId);
      }

      const response = await fetch(`/api/journal/export?${params.toString()}`);

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.error ?? "Erreur lors de l'export");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `journal-${options.from}-${options.to}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Journal exporte en PDF");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur lors de l'export";
      toast.error(message);
    } finally {
      setIsExporting(false);
    }
  }, []);

  return { exportPdf, isExporting };
}
