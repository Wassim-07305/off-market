"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { cn, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  AlertTriangle,
  Bug,
  CheckCircle2,
  Trash2,
  RefreshCw,
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Globe,
  Smartphone,
  Clock,
  User,
  Code,
  Filter,
  CheckSquare,
  Square,
  Archive,
  FileDown,
} from "lucide-react";

interface ErrorLog {
  id: string;
  message: string;
  stack: string | null;
  component_stack: string | null;
  page: string | null;
  route: string | null;
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  source: string;
  severity: string;
  user_agent: string | null;
  viewport: string | null;
  metadata: Record<string, unknown>;
  resolved: boolean;
  resolved_at: string | null;
  created_at: string;
}

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  "error-boundary": { label: "React Crash", color: "text-red-500 bg-red-500/10" },
  "unhandled-error": { label: "JS Error", color: "text-orange-500 bg-orange-500/10" },
  "unhandled-rejection": { label: "Promise", color: "text-amber-500 bg-amber-500/10" },
  "api-error": { label: "API", color: "text-blue-500 bg-blue-500/10" },
  manual: { label: "Manuel", color: "text-zinc-500 bg-zinc-500/10" },
};

const SEVERITY_COLORS: Record<string, string> = {
  warning: "text-amber-500",
  error: "text-orange-500",
  critical: "text-red-500",
};

export default function ErrorLogsPage() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filterSource, setFilterSource] = useState<string | null>(null);
  const [showResolved, setShowResolved] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Fetch errors
  const { data: errors = [], isLoading, refetch } = useQuery({
    queryKey: ["error-logs", showResolved, filterSource],
    queryFn: async () => {
      let query = supabase
        .from("error_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);

      if (!showResolved) {
        query = query.eq("resolved", false);
      }
      if (filterSource) {
        query = query.eq("source", filterSource);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as ErrorLog[];
    },
  });

  // Resolve mutation
  const resolve = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("error_logs")
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Erreur(s) marquee(s) comme resolue(s)");
      queryClient.invalidateQueries({ queryKey: ["error-logs"] });
      setSelectedIds(new Set());
    },
  });

  // Delete mutation
  const deleteErrors = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("error_logs")
        .delete()
        .in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Erreur(s) supprimee(s)");
      queryClient.invalidateQueries({ queryKey: ["error-logs"] });
      setSelectedIds(new Set());
    },
  });

  // Filter by search
  const filtered = useMemo(() => {
    if (!search.trim()) return errors;
    const q = search.toLowerCase();
    return errors.filter(
      (e) =>
        e.message.toLowerCase().includes(q) ||
        e.page?.toLowerCase().includes(q) ||
        e.user_email?.toLowerCase().includes(q) ||
        e.source.toLowerCase().includes(q),
    );
  }, [errors, search]);

  // Group by page for summary
  const pageGroups = useMemo(() => {
    const groups = new Map<string, number>();
    for (const e of errors) {
      const page = e.page || "Inconnue";
      groups.set(page, (groups.get(page) ?? 0) + 1);
    }
    return Array.from(groups.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
  }, [errors]);

  const sourceGroups = useMemo(() => {
    const groups = new Map<string, number>();
    for (const e of errors) {
      groups.set(e.source, (groups.get(e.source) ?? 0) + 1);
    }
    return groups;
  }, [errors]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((e) => e.id)));
    }
  };

  const unresolvedCount = errors.filter((e) => !e.resolved).length;

  const exportMarkdown = () => {
    const unresolved = errors.filter((e) => !e.resolved);
    if (unresolved.length === 0) {
      toast.success("Aucune erreur non resolue a exporter");
      return;
    }

    // Dedup: group identical errors (same message + page)
    const dedupKey = (e: ErrorLog) => `${e.message}::${e.page}`;
    const dedupMap = new Map<string, { error: ErrorLog; count: number }>();
    for (const e of unresolved) {
      const key = dedupKey(e);
      const existing = dedupMap.get(key);
      if (existing) {
        existing.count++;
        // Keep the most recent one
        if (e.created_at > existing.error.created_at) existing.error = e;
      } else {
        dedupMap.set(key, { error: e, count: 1 });
      }
    }
    const deduped = Array.from(dedupMap.values());

    // Group by page
    const byPage = new Map<string, typeof deduped>();
    for (const d of deduped) {
      const page = d.error.page || "Inconnue";
      const list = byPage.get(page) ?? [];
      list.push(d);
      byPage.set(page, list);
    }

    // Count by severity
    const criticals = deduped.filter((d) => d.error.severity === "critical").length;
    const errs = deduped.filter((d) => d.error.severity === "error").length;
    const warnings = deduped.filter((d) => d.error.severity === "warning").length;

    let md = `# Error Report\n\n`;
    md += `> Genere le ${new Date().toLocaleString("fr-FR")}\n\n`;
    md += `## Résumé\n\n`;
    md += `| Metrique | Valeur |\n|---|---|\n`;
    md += `| Erreurs uniques | ${deduped.length} |\n`;
    md += `| Total (avec doublons) | ${unresolved.length} |\n`;
    md += `| Critiques | ${criticals} |\n`;
    md += `| Erreurs | ${errs} |\n`;
    md += `| Warnings | ${warnings} |\n`;
    md += `| Pages touchées | ${byPage.size} |\n\n`;

    // Quick fix list
    md += `## Liste rapide\n\n`;
    for (const d of deduped) {
      const e = d.error;
      const countStr = d.count > 1 ? ` (x${d.count})` : "";
      md += `- **${e.severity.toUpperCase()}** \`${e.page ?? "?"}\` — ${e.message.slice(0, 120)}${countStr}\n`;
    }
    md += `\n`;

    // Detailed errors
    md += `## Détails\n\n`;
    for (const [page, items] of byPage) {
      md += `### Page: \`${page}\`\n\n`;
      for (const { error: e, count } of items) {
        const countStr = count > 1 ? ` (x${count})` : "";
        md += `#### ${e.source.toUpperCase()} | ${e.severity}${countStr}\n\n`;
        md += `**Message:** \`${e.message}\`\n\n`;
        if (e.route && e.route !== e.page) md += `**Route:** \`${e.route}\`\n\n`;
        if (e.user_email) md += `**User:** ${e.user_email} (${e.user_role ?? "?"})\n\n`;
        if (e.viewport) md += `**Viewport:** ${e.viewport}\n\n`;

        // Extract probable file from stack trace
        if (e.stack) {
          const srcMatch = e.stack.match(/at\s+\w+\s+\(?(src\/[^:)]+)/);
          if (srcMatch) {
            md += `**Fichier probable:** \`${srcMatch[1]}\`\n\n`;
          }
          md += `<details><summary>Stack trace</summary>\n\n\`\`\`\n${e.stack}\n\`\`\`\n</details>\n\n`;
        }
        if (e.component_stack) {
          md += `<details><summary>Component stack</summary>\n\n\`\`\`\n${e.component_stack}\n\`\`\`\n</details>\n\n`;
        }
        if (e.metadata && Object.keys(e.metadata).length > 0) {
          md += `**Metadata:**\n\`\`\`json\n${JSON.stringify(e.metadata, null, 2)}\n\`\`\`\n\n`;
        }
        md += `---\n\n`;
      }
    }

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `error-report-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${deduped.length} erreur(s) unique(s) exportee(s)`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight flex items-center gap-2">
            <Bug className="w-6 h-6 text-red-500" />
            Error Logs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unresolvedCount} erreur{unresolvedCount !== 1 ? "s" : ""} non
            resolue{unresolvedCount !== 1 ? "s" : ""} — {errors.length} au total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportMarkdown}
            className="h-9 px-3 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center gap-1.5"
          >
            <FileDown className="w-3.5 h-3.5" />
            Exporter .md
          </button>
          <button
            onClick={() => refetch()}
            className="h-9 px-3 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Rafraichir
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {Object.entries(SOURCE_LABELS).map(([key, { label, color }]) => {
          const count = sourceGroups.get(key) ?? 0;
          return (
            <button
              key={key}
              onClick={() => setFilterSource(filterSource === key ? null : key)}
              className={cn(
                "bg-surface rounded-xl p-3 border transition-all text-left",
                filterSource === key
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border hover:border-primary/30",
              )}
            >
              <span className={cn("text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded-md", color)}>
                {label}
              </span>
              <p className="text-2xl font-bold font-mono tabular-nums text-foreground mt-1">
                {count}
              </p>
            </button>
          );
        })}
      </div>

      {/* Top pages with errors */}
      {pageGroups.length > 0 && (
        <div className="bg-surface rounded-xl border border-border p-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Pages les plus touchees
          </h3>
          <div className="flex flex-wrap gap-2">
            {pageGroups.map(([page, count]) => (
              <button
                key={page}
                onClick={() => setSearch(page)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted hover:bg-muted/80 text-xs transition-colors"
              >
                <Globe className="w-3 h-3 text-muted-foreground" />
                <span className="text-foreground font-medium">{page}</span>
                <span className="text-muted-foreground font-mono">({count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search + filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher une erreur, page, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-border bg-surface text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowResolved(!showResolved)}
          className={cn(
            "h-10 px-3 rounded-xl border text-sm font-medium transition-all flex items-center gap-1.5",
            showResolved
              ? "border-primary bg-primary/5 text-primary"
              : "border-border text-muted-foreground hover:text-foreground",
          )}
        >
          <Archive className="w-4 h-4" />
          {showResolved ? "Toutes" : "Non resolues"}
        </button>
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <span className="text-sm font-medium text-foreground">
            {selectedIds.size} selectionnee{selectedIds.size > 1 ? "s" : ""}
          </span>
          <button
            onClick={() => resolve.mutate(Array.from(selectedIds))}
            disabled={resolve.isPending}
            className="h-8 px-3 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Resoudre
          </button>
          <button
            onClick={() => deleteErrors.mutate(Array.from(selectedIds))}
            disabled={deleteErrors.isPending}
            className="h-8 px-3 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-colors flex items-center gap-1.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Supprimer
          </button>
        </div>
      )}

      {/* Error list */}
      <div className="space-y-2">
        {/* Select all header */}
        {filtered.length > 0 && (
          <div className="flex items-center gap-2 px-2">
            <button onClick={selectAll} className="text-muted-foreground hover:text-foreground">
              {selectedIds.size === filtered.length ? (
                <CheckSquare className="w-4 h-4" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>
            <span className="text-xs text-muted-foreground">
              {filtered.length} erreur{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-surface rounded-xl border border-border p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-muted rounded" />
                <div className="h-4 w-64 bg-muted rounded" />
                <div className="ml-auto h-4 w-20 bg-muted rounded" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground">Aucune erreur</p>
            <p className="text-xs text-muted-foreground mt-1">
              {search ? "Aucun resultat pour cette recherche" : "Tout fonctionne correctement"}
            </p>
          </div>
        ) : (
          filtered.map((err) => (
            <ErrorRow
              key={err.id}
              error={err}
              isExpanded={expandedId === err.id}
              isSelected={selectedIds.has(err.id)}
              onToggleExpand={() => setExpandedId(expandedId === err.id ? null : err.id)}
              onToggleSelect={() => toggleSelect(err.id)}
              onResolve={() => resolve.mutate([err.id])}
              onDelete={() => deleteErrors.mutate([err.id])}
            />
          ))
        )}
      </div>
    </div>
  );
}

// ─── Error Row ──────────────────────────────────────────────

function ErrorRow({
  error,
  isExpanded,
  isSelected,
  onToggleExpand,
  onToggleSelect,
  onResolve,
  onDelete,
}: {
  error: ErrorLog;
  isExpanded: boolean;
  isSelected: boolean;
  onToggleExpand: () => void;
  onToggleSelect: () => void;
  onResolve: () => void;
  onDelete: () => void;
}) {
  const source = SOURCE_LABELS[error.source] ?? { label: error.source, color: "text-zinc-500 bg-zinc-500/10" };
  const severityColor = SEVERITY_COLORS[error.severity] ?? "text-zinc-500";
  const timeAgo = getTimeAgo(error.created_at);

  return (
    <div
      className={cn(
        "bg-surface rounded-xl border transition-all",
        error.resolved ? "border-border/50 opacity-60" : "border-border",
        isSelected && "ring-2 ring-primary/20 border-primary/30",
      )}
    >
      {/* Summary row */}
      <div className="flex items-start gap-2 p-3 cursor-pointer" onClick={onToggleExpand}>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
          className="mt-0.5 text-muted-foreground hover:text-foreground shrink-0"
        >
          {isSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4" />}
        </button>

        <div className="mt-0.5 shrink-0">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn("text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded-md shrink-0", source.color)}>
              {source.label}
            </span>
            <AlertTriangle className={cn("w-3.5 h-3.5 shrink-0", severityColor)} />
            {error.resolved && (
              <span className="text-[10px] uppercase tracking-wide font-semibold px-1.5 py-0.5 rounded-md text-emerald-500 bg-emerald-500/10">
                Resolue
              </span>
            )}
          </div>
          <p className="text-sm text-foreground font-medium mt-1 line-clamp-2 break-all">
            {error.message}
          </p>
          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
            {error.page && (
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {error.page}
              </span>
            )}
            {error.user_email && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {error.user_email}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {!error.resolved && (
            <button
              onClick={(e) => { e.stopPropagation(); onResolve(); }}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
              title="Marquer comme resolue"
            >
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="border-t border-border px-4 py-3 space-y-3 text-xs">
          {/* Metadata grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Detail label="Page" value={error.page} />
            <Detail label="Route" value={error.route} />
            <Detail label="Source" value={error.source} />
            <Detail label="Severite" value={error.severity} />
            <Detail label="User" value={error.user_email} />
            <Detail label="Role" value={error.user_role} />
            <Detail label="Viewport" value={error.viewport} />
            <Detail label="Date" value={formatDate(error.created_at)} />
          </div>

          {/* Stack trace */}
          {error.stack && (
            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                <Code className="w-3 h-3" />
                Stack Trace
              </p>
              <pre className="bg-zinc-950 text-zinc-300 rounded-lg p-3 overflow-x-auto text-[11px] leading-relaxed max-h-48 overflow-y-auto font-mono whitespace-pre-wrap break-all">
                {error.stack}
              </pre>
            </div>
          )}

          {/* Component stack */}
          {error.component_stack && (
            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-1">
                Component Stack
              </p>
              <pre className="bg-zinc-950 text-zinc-300 rounded-lg p-3 overflow-x-auto text-[11px] leading-relaxed max-h-32 overflow-y-auto font-mono whitespace-pre-wrap break-all">
                {error.component_stack}
              </pre>
            </div>
          )}

          {/* Extra metadata */}
          {error.metadata && Object.keys(error.metadata).length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-1">
                Metadata
              </p>
              <pre className="bg-zinc-950 text-zinc-300 rounded-lg p-3 overflow-x-auto text-[11px] leading-relaxed max-h-32 overflow-y-auto font-mono">
                {JSON.stringify(error.metadata, null, 2)}
              </pre>
            </div>
          )}

          {/* User agent */}
          {error.user_agent && (
            <div>
              <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                <Smartphone className="w-3 h-3" />
                User Agent
              </p>
              <p className="text-muted-foreground break-all">{error.user_agent}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide font-semibold text-muted-foreground">{label}</p>
      <p className="text-foreground font-medium mt-0.5 break-all">{value}</p>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "A l'instant";
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}j`;
}
