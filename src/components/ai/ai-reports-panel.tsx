"use client";

import { useState } from "react";
import {
  FileText,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAiReports, useMarkReportRead } from "@/hooks/use-ai-reports";
import type { AiReport, AiReportType } from "@/types/database";

const REPORT_TYPES: {
  value: AiReportType | "all";
  label: string;
  icon: typeof FileText;
}[] = [
  { value: "all", label: "Tous", icon: FileText },
  { value: "weekly_coaching", label: "Coaching", icon: FileText },
  { value: "monthly_performance", label: "Performance", icon: TrendingUp },
  { value: "client_risk", label: "Risques", icon: AlertTriangle },
];

const TYPE_CONFIG: Record<
  AiReportType,
  { icon: typeof FileText; color: string; bgColor: string }
> = {
  weekly_coaching: {
    icon: FileText,
    color: "text-blue-600",
    bgColor: "bg-blue-500/10",
  },
  monthly_performance: {
    icon: TrendingUp,
    color: "text-emerald-600",
    bgColor: "bg-emerald-500/10",
  },
  client_risk: {
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-500/10",
  },
};

function formatReportDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ReportItem({ report }: { report: AiReport }) {
  const [expanded, setExpanded] = useState(false);
  const markRead = useMarkReportRead();
  const config = TYPE_CONFIG[report.type];
  const Icon = config.icon;
  const isUnread = !report.read_at;

  const handleExpand = () => {
    if (!expanded && isUnread) {
      markRead.mutate(report.id);
    }
    setExpanded(!expanded);
  };

  return (
    <div
      className={cn(
        "border border-border rounded-xl overflow-hidden transition-colors",
        isUnread && "bg-muted/20",
      )}
    >
      <button
        onClick={handleExpand}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
            config.bgColor,
          )}
        >
          <Icon className={cn("w-4 h-4", config.color)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {isUnread && (
              <Circle className="w-2 h-2 fill-[#DC2626] text-[#DC2626] shrink-0" />
            )}
            <span className="text-sm font-medium text-foreground truncate">
              {report.title}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {formatReportDate(report.generated_at)}
          </span>
        </div>

        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-border">
          <div
            className="prose prose-sm max-w-none text-foreground pt-3 [&_h2]:text-sm [&_h2]:font-semibold [&_h2]:mt-3 [&_h2]:mb-1.5 [&_h3]:text-sm [&_h3]:font-medium [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:mt-1 [&_ul]:mb-2 [&_li]:text-sm [&_p]:text-sm [&_p]:leading-relaxed"
            dangerouslySetInnerHTML={{
              __html: report.content
                .replace(/\n/g, "<br />")
                .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                .replace(/^## (.*?)(<br \/>)/gm, "<h2>$1</h2>")
                .replace(/^### (.*?)(<br \/>)/gm, "<h3>$1</h3>")
                .replace(/^- (.*?)(<br \/>)/gm, "<li>$1</li>"),
            }}
          />
        </div>
      )}
    </div>
  );
}

interface AiReportsPanelProps {
  className?: string;
}

/**
 * Panneau listant les rapports IA periodiques.
 * Filtrable par type avec indicateur de non-lu.
 */
export function AiReportsPanel({ className }: AiReportsPanelProps) {
  const [activeTab, setActiveTab] = useState<AiReportType | "all">("all");
  const filterType = activeTab === "all" ? undefined : activeTab;
  const { data: reports, isLoading } = useAiReports(filterType);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter tabs */}
      <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg">
        {REPORT_TYPES.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
              activeTab === tab.value
                ? "bg-surface text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Reports list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-muted/30 animate-pulse"
            />
          ))}
        </div>
      ) : reports && reports.length > 0 ? (
        <div className="space-y-2">
          {reports.map((report) => (
            <ReportItem key={report.id} report={report} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="w-10 h-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm text-muted-foreground">
            Aucun rapport disponible
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Les rapports sont generes automatiquement chaque semaine
          </p>
        </div>
      )}
    </div>
  );
}
