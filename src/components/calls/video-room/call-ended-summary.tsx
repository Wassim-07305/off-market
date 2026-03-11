"use client";

import { useCallStore } from "@/stores/call-store";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { PhoneOff, Download, ArrowLeft, ScrollText } from "lucide-react";
import Link from "next/link";

interface CallEndedSummaryProps {
  callTitle: string;
  onDownloadTranscript: () => void;
}

export function CallEndedSummary({
  callTitle,
  onDownloadTranscript,
}: CallEndedSummaryProps) {
  const { transcriptEntries, callStartTime } = useCallStore();
  const prefix = useRoutePrefix();

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
    <div className="flex-1 flex items-center justify-center bg-zinc-950">
      <div className="text-center space-y-6 max-w-sm mx-auto px-4">
        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto">
          <PhoneOff className="w-7 h-7 text-zinc-400" />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white">Appel termine</h2>
          <p className="text-sm text-zinc-400 mt-1">{callTitle}</p>
        </div>

        <div className="flex items-center justify-center gap-6 text-sm text-zinc-400">
          <div>
            <span className="block font-mono text-lg text-white tabular-nums">
              {durationStr}
            </span>
            <span className="text-xs">Duree</span>
          </div>
          {transcriptEntries.length > 0 && (
            <div>
              <span className="block font-mono text-lg text-white tabular-nums">
                {transcriptEntries.length}
              </span>
              <span className="text-xs">Transcriptions</span>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          {transcriptEntries.length > 0 && (
            <button
              onClick={onDownloadTranscript}
              className="w-full h-10 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Telecharger la transcription
            </button>
          )}

          {transcriptEntries.length > 0 && (
            <div className="bg-zinc-900 rounded-xl p-3 max-h-40 overflow-y-auto text-left">
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
            className="w-full h-10 rounded-xl bg-zinc-800 text-white text-sm font-medium hover:bg-zinc-700 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux appels
          </Link>
        </div>
      </div>
    </div>
  );
}
