"use client";

import { useState } from "react";
import { useAiPeriodicReport } from "@/hooks/use-ai-periodic-reports";
import {
  Sparkles,
  Loader2,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  BookOpen,
  MessageSquare,
  CalendarCheck,
  Phone,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

export function AiPeriodicReport() {
  const { report, stats, isLoading, isFetching, isError, refetch, isEligible } =
    useAiPeriodicReport();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isEligible) return null;

  return (
    <div
      className="bg-surface rounded-2xl overflow-hidden"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-[13px] font-semibold text-foreground">
              Rapport IA hebdomadaire
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Analyse des 7 derniers jours
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors disabled:opacity-40"
            title="Regenerer le rapport"
          >
            <RefreshCw
              className={cn("w-3.5 h-3.5", isFetching && "animate-spin")}
            />
          </button>
          <button
            onClick={() => setIsExpanded((v) => !v)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-5">
          {/* Loading */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mb-3" />
              <p className="text-sm">Generation du rapport en cours...</p>
              <p className="text-xs mt-1 text-muted-foreground/60">
                Analyse des donnees de la semaine
              </p>
            </div>
          )}

          {/* Error */}
          {isError && !isLoading && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-3">
                Impossible de generer le rapport
              </p>
              <button
                onClick={() => refetch()}
                className="text-xs text-primary hover:underline"
              >
                Reessayer
              </button>
            </div>
          )}

          {/* Stats summary */}
          {stats && !isLoading && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-5">
              <StatMini
                icon={BookOpen}
                label="Journal"
                value={stats.journalEntries}
              />
              <StatMini
                icon={CalendarCheck}
                label="Check-ins"
                value={stats.checkins}
              />
              <StatMini
                icon={MessageSquare}
                label="Messages"
                value={stats.messages}
              />
              <StatMini icon={Phone} label="Appels" value={stats.calls} />
              <StatMini
                icon={Users}
                label="Actifs"
                value={stats.activeStudents}
              />
            </div>
          )}

          {/* Report content */}
          {report && !isLoading && (
            <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0 [&_p]:my-1.5 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0.5 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1 [&_h3]:text-xs [&_h3]:font-medium [&_h3]:mt-2 [&_h3]:mb-1 text-sm leading-relaxed">
              <ReactMarkdown>{report}</ReactMarkdown>
            </div>
          )}

          {/* Empty state */}
          {!report && !isLoading && !isError && (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="w-6 h-6 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Aucun rapport disponible</p>
              <button
                onClick={() => refetch()}
                className="text-xs text-primary hover:underline mt-2"
              >
                Generer un rapport
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatMini({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1 p-2.5 bg-muted/30 rounded-xl">
      <Icon className="w-3.5 h-3.5 text-muted-foreground" />
      <span className="text-lg font-bold text-foreground tabular-nums">
        {value}
      </span>
      <span className="text-[10px] text-muted-foreground">{label}</span>
    </div>
  );
}
