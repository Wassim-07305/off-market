"use client";

import {
  FileText,
  Sparkles,
  Loader2,
  RefreshCw,
  Clock,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { cn, formatRelativeDate } from "@/lib/utils";
import {
  useCallDocuments,
  useGenerateTranscriptFusion,
} from "@/hooks/use-call-documents";

interface CallDocumentPanelProps {
  callId: string;
}

export function CallDocumentPanel({ callId }: CallDocumentPanelProps) {
  const { data: documents, isLoading } = useCallDocuments(callId);
  const generateFusion = useGenerateTranscriptFusion();
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const hasDocs = documents && documents.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-500" />
          Documents generes
          {hasDocs && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-600 text-[10px] font-bold">
              {documents.length}
            </span>
          )}
        </h4>
      </div>

      {/* Generate button */}
      <button
        onClick={() => generateFusion.mutate(callId)}
        disabled={generateFusion.isPending}
        className="w-full h-9 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium hover:from-indigo-500 hover:to-violet-500 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
      >
        {generateFusion.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generation en cours...
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            Generer le document de fusion
          </>
        )}
      </button>

      {generateFusion.isPending && (
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-3">
          <p className="text-xs text-indigo-600 dark:text-indigo-400">
            L'IA fusionne la transcription, les reponses workbook et les
            questions pre-appel pour generer un document complet. Cela peut
            prendre 15-30 secondes.
          </p>
        </div>
      )}

      {/* Document list */}
      {hasDocs && (
        <div className="space-y-3">
          {documents.map((doc) => {
            const isExpanded = expandedDoc === doc.id;
            return (
              <div
                key={doc.id}
                className="bg-surface border border-border rounded-xl overflow-hidden"
              >
                {/* Doc header */}
                <button
                  onClick={() =>
                    setExpandedDoc(isExpanded ? null : doc.id)
                  }
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
                >
                  <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {doc.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeDate(doc.created_at)}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-medium px-1.5 py-0.5 rounded-full capitalize",
                          doc.type === "transcript_fusion"
                            ? "bg-indigo-500/10 text-indigo-600"
                            : doc.type === "summary"
                              ? "bg-violet-500/10 text-violet-600"
                              : "bg-emerald-500/10 text-emerald-600",
                        )}
                      >
                        {doc.type === "transcript_fusion"
                          ? "Fusion"
                          : doc.type === "summary"
                            ? "Synthese"
                            : "Export"}
                      </span>
                      {doc.model && (
                        <span className="text-[10px] text-muted-foreground">
                          {doc.model}
                        </span>
                      )}
                    </div>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                </button>

                {/* Doc content */}
                {isExpanded && (
                  <div className="border-t border-border">
                    <div className="flex items-center justify-end gap-1 px-4 py-2 border-b border-border bg-muted/30">
                      {doc.content_markdown && (
                        <button
                          onClick={() => {
                            const blob = new Blob(
                              [doc.content_markdown!],
                              { type: "text/markdown" },
                            );
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `${doc.title}.md`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                        >
                          <Download className="w-3 h-3" />
                          Markdown
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const blob = new Blob([doc.content_html], {
                            type: "text/html",
                          });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `${doc.title}.html`;
                          a.click();
                          URL.revokeObjectURL(url);
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        HTML
                      </button>
                      <button
                        onClick={() => generateFusion.mutate(callId)}
                        disabled={generateFusion.isPending}
                        className="inline-flex items-center gap-1 px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                        title="Regenerer"
                      >
                        {generateFusion.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        Regenerer
                      </button>
                    </div>
                    <div className="p-4 max-h-[50vh] overflow-y-auto">
                      <div
                        className="prose prose-sm dark:prose-invert max-w-none text-foreground/90
                          [&_h2]:text-base [&_h2]:font-semibold [&_h2]:mt-4 [&_h2]:mb-2
                          [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1
                          [&_p]:text-sm [&_p]:leading-relaxed [&_p]:mb-2
                          [&_ul]:text-sm [&_ul]:space-y-1 [&_ul]:mb-3
                          [&_li]:text-sm
                          [&_strong]:text-foreground"
                        dangerouslySetInnerHTML={{
                          __html: doc.content_html,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!hasDocs && !generateFusion.isPending && (
        <p className="text-xs text-muted-foreground text-center py-2">
          Aucun document genere pour cet appel. Cliquez sur le bouton
          ci-dessus pour lancer la generation.
        </p>
      )}
    </div>
  );
}
