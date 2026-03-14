"use client";

import { useCallSummary } from "@/hooks/use-call-summary";
import { generateCallSummaryPDF } from "@/lib/pdf";
import {
  Sparkles,
  Loader2,
  RefreshCw,
  Download,
  CheckCircle2,
  FileText,
  Clock,
} from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";

interface CallSummaryPanelProps {
  callId: string;
  callTitle?: string;
  clientName?: string;
  callDate?: string;
}

export function CallSummaryPanel({
  callId,
  callTitle,
  clientName,
  callDate,
}: CallSummaryPanelProps) {
  const { summary, isLoading, generateSummary, isGenerating } =
    useCallSummary(callId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // No summary yet — show generate button
  if (!summary) {
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-500" />
          Synthese IA
        </h4>
        <p className="text-xs text-muted-foreground">
          Generez automatiquement un document de synthese en fusionnant la
          transcription, les questions pre-appel et vos notes.
        </p>
        <button
          onClick={() => generateSummary.mutate(callId)}
          disabled={isGenerating}
          className="w-full h-9 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-medium hover:from-violet-500 hover:to-indigo-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generation en cours...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generer la synthese
            </>
          )}
        </button>
      </div>
    );
  }

  // Summary exists — show it
  const sourcesLabels: string[] = [];
  if (summary.sources.has_transcript) sourcesLabels.push("Transcription");
  if (summary.sources.has_pre_call) sourcesLabels.push("Questions pre-appel");
  if (summary.sources.has_session_notes) sourcesLabels.push("Notes session");
  if (summary.sources.has_call_notes) sourcesLabels.push("Notes post-appel");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-500" />
          Synthese IA
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
        </h4>
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              generateCallSummaryPDF({
                content: summary.content,
                callTitle: callTitle ?? "Appel",
                clientName: clientName ?? "",
                callDate: callDate ?? summary.created_at,
              })
            }
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Exporter en PDF"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => generateSummary.mutate(callId)}
            disabled={isGenerating}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title="Regenerer"
          >
            {isGenerating ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Sources badges */}
      <div className="flex flex-wrap gap-1.5">
        {sourcesLabels.map((label) => (
          <span
            key={label}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[11px] font-medium"
          >
            <FileText className="w-3 h-3" />
            {label}
          </span>
        ))}
      </div>

      {/* Content */}
      <div className="bg-muted/50 rounded-lg p-3 max-h-[40vh] overflow-y-auto">
        <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap text-foreground/90">
          {summary.content}
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatRelativeDate(summary.created_at)}
        </span>
        {summary.generation_time_ms && (
          <span>
            Genere en {(summary.generation_time_ms / 1000).toFixed(1)}s
          </span>
        )}
        {summary.tokens_used && <span>{summary.tokens_used} tokens</span>}
      </div>
    </div>
  );
}
