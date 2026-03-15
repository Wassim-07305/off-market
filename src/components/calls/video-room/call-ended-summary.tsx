"use client";

import { useState } from "react";
import { useCallStore } from "@/stores/call-store";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { useCallSummary } from "@/hooks/use-call-summary";
import {
  PhoneOff,
  Download,
  ArrowLeft,
  ScrollText,
  Sparkles,
  Loader2,
  FileText,
  RefreshCw,
  Clock,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

interface CallEndedSummaryProps {
  callId: string;
  callTitle: string;
  onDownloadTranscript: () => void;
}

export function CallEndedSummary({
  callId,
  callTitle,
  onDownloadTranscript,
}: CallEndedSummaryProps) {
  const { transcriptEntries, callStartTime } = useCallStore();
  const prefix = useRoutePrefix();
  const { summary, isLoading: summaryLoading, generateSummary, isGenerating } =
    useCallSummary(callId);
  const [showSummary, setShowSummary] = useState(false);

  const durationSeconds = callStartTime
    ? Math.floor((Date.now() - callStartTime) / 1000)
    : 0;
  const hours = Math.floor(durationSeconds / 3600);
  const minutes = Math.floor((durationSeconds % 3600) / 60);
  const seconds = durationSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, "0");
  const durationStr =
    hours > 0
      ? `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
      : `${pad(minutes)}:${pad(seconds)}`;

  return (
    <div className="flex-1 flex items-center justify-center bg-zinc-950 p-4">
      <div className="w-full max-w-md mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-white/5 flex items-center justify-center mx-auto">
            <PhoneOff className="w-6 h-6 text-zinc-400" />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white">Appel termine</h2>
            <p className="text-sm text-zinc-500 mt-1">{callTitle}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 text-zinc-400 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[11px] uppercase tracking-wide font-medium">
                Duree
              </span>
            </div>
            <span className="block font-mono text-xl text-white tabular-nums">
              {durationStr}
            </span>
          </div>
          {transcriptEntries.length > 0 && (
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-zinc-400 mb-1">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="text-[11px] uppercase tracking-wide font-medium">
                  Messages
                </span>
              </div>
              <span className="block font-mono text-xl text-white tabular-nums">
                {transcriptEntries.length}
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {/* Generate / View AI Summary */}
          {!showSummary && (
            <>
              {summary ? (
                <button
                  onClick={() => setShowSummary(true)}
                  className="w-full h-11 rounded-xl bg-emerald-600/90 text-white text-sm font-medium hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Voir la synthese IA
                </button>
              ) : (
                <button
                  onClick={() => generateSummary.mutate(callId)}
                  disabled={isGenerating || summaryLoading}
                  className="w-full h-11 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generation en cours...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generer la synthese IA
                    </>
                  )}
                </button>
              )}
            </>
          )}

          {/* Summary content */}
          {showSummary && summary && (
            <div className="bg-zinc-900/80 border border-white/5 rounded-xl p-4 max-h-[50vh] overflow-y-auto text-left space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-400" />
                  Synthese IA
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => generateSummary.mutate(callId)}
                    disabled={isGenerating}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
                    title="Regenerer"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    onClick={() => setShowSummary(false)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors text-xs"
                  >
                    Fermer
                  </button>
                </div>
              </div>
              <div className="prose prose-invert prose-sm max-w-none text-zinc-300 text-xs leading-relaxed whitespace-pre-wrap">
                {summary.content}
              </div>
              <div className="flex items-center gap-3 pt-2 border-t border-zinc-800 text-[11px] text-zinc-600">
                {summary.sources.has_transcript && <span>Transcript</span>}
                {summary.sources.has_pre_call && (
                  <span>Questions pre-appel</span>
                )}
                {summary.sources.has_session_notes && (
                  <span>Notes session</span>
                )}
                {summary.sources.has_call_notes && (
                  <span>Notes post-appel</span>
                )}
              </div>
            </div>
          )}

          {transcriptEntries.length > 0 && (
            <button
              onClick={onDownloadTranscript}
              className="w-full h-11 rounded-xl bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-700 transition-all flex items-center justify-center gap-2 border border-white/5"
            >
              <Download className="w-4 h-4" />
              Telecharger la transcription
            </button>
          )}

          {transcriptEntries.length > 0 && !showSummary && (
            <div className="bg-zinc-900/60 border border-white/5 rounded-xl p-3 max-h-40 overflow-y-auto text-left">
              {transcriptEntries.slice(-5).map((entry, i) => (
                <div key={i} className="text-xs py-1">
                  <span className="text-zinc-500 font-medium">
                    {entry.speaker_name}:
                  </span>
                  <span className="text-zinc-300 ml-1">{entry.text}</span>
                </div>
              ))}
              {transcriptEntries.length > 5 && (
                <p className="text-[11px] text-zinc-600 mt-1 flex items-center gap-1">
                  <ScrollText className="w-3 h-3" />+
                  {transcriptEntries.length - 5} autres lignes
                </p>
              )}
            </div>
          )}

          <Link
            href={`${prefix}/calls`}
            className="w-full h-11 rounded-xl bg-zinc-900/50 text-zinc-300 text-sm font-medium hover:bg-zinc-800 hover:text-white transition-all flex items-center justify-center gap-2 border border-white/5"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux appels
          </Link>
        </div>
      </div>
    </div>
  );
}
