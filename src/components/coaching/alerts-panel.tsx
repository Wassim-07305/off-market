"use client";

import { useState } from "react";
import {
  Bell,
  BellOff,
  CheckCircle2,
  Eye,
  AlertTriangle,
  AlertCircle,
  Info,
  Flame,
  RefreshCw,
  Loader2,
} from "lucide-react";
import {
  useCoachAlerts,
  useMarkAlertRead,
  useResolveAlert,
  useGenerateAlerts,
  type AlertSeverity,
  type AlertType,
} from "@/hooks/use-coach-alerts";
import { cn } from "@/lib/utils";

// ── Severity config ────────────────────────────────────────────────────────

const SEVERITY_CONFIG: Record<
  AlertSeverity,
  { label: string; color: string; bg: string; border: string; icon: typeof AlertCircle }
> = {
  critical: {
    label: "Critique",
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    icon: Flame,
  },
  high: {
    label: "Haute",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    icon: AlertTriangle,
  },
  medium: {
    label: "Moyenne",
    color: "text-yellow-700",
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    icon: AlertCircle,
  },
  low: {
    label: "Basse",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: Info,
  },
};

const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  no_checkin: "Pas de check-in",
  revenue_drop: "Baisse de revenu",
  inactive_7d: "Inactif 7j",
  inactive_14d: "Inactif 14j",
  low_mood: "Moral bas",
  flag_change: "Changement de flag",
  session_missed: "Session manquee",
};

// ── Component ──────────────────────────────────────────────────────────────

export function AlertsPanel() {
  const { data: alerts, isLoading } = useCoachAlerts();
  const markRead = useMarkAlertRead();
  const resolveAlert = useResolveAlert();
  const generateAlerts = useGenerateAlerts();
  const [filter, setFilter] = useState<AlertSeverity | "all">("all");

  const filteredAlerts =
    filter === "all"
      ? alerts ?? []
      : (alerts ?? []).filter((a) => a.severity === filter);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-500/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-sm font-display font-semibold text-foreground">
              Alertes coach
            </h3>
            <p className="text-xs text-muted-foreground">
              {(alerts ?? []).length} alerte(s) non lue(s)
            </p>
          </div>
        </div>
        <button
          onClick={() => generateAlerts.mutate()}
          disabled={generateAlerts.isPending}
          className="h-8 px-3 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          {generateAlerts.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <RefreshCw className="w-3.5 h-3.5" />
          )}
          Analyser
        </button>
      </div>

      {/* Severity filter */}
      <div className="flex gap-1.5">
        {(["all", "critical", "high", "medium", "low"] as const).map((sev) => {
          const count =
            sev === "all"
              ? (alerts ?? []).length
              : (alerts ?? []).filter((a) => a.severity === sev).length;
          return (
            <button
              key={sev}
              onClick={() => setFilter(sev)}
              className={cn(
                "h-7 px-2.5 rounded-lg text-[11px] font-medium transition-colors",
                filter === sev
                  ? "bg-foreground text-background"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted",
              )}
            >
              {sev === "all" ? "Toutes" : SEVERITY_CONFIG[sev].label} ({count})
            </button>
          );
        })}
      </div>

      {/* Alert list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-3">
            <BellOff className="w-5 h-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-muted-foreground">
            Aucune alerte
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Tous vos clients sont sur la bonne voie
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAlerts.map((alert) => {
            const config = SEVERITY_CONFIG[alert.severity];
            const Icon = config.icon;
            return (
              <div
                key={alert.id}
                className={cn(
                  "rounded-xl border p-4 transition-colors",
                  config.bg,
                  config.border,
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                      config.bg,
                    )}
                  >
                    <Icon className={cn("w-4 h-4", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded",
                          config.bg,
                          config.color,
                        )}
                      >
                        {config.label}
                      </span>
                      <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                        {ALERT_TYPE_LABELS[alert.alert_type]}
                      </span>
                    </div>
                    <p className="text-sm text-foreground font-medium">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {alert.client && (
                        <span className="text-xs text-muted-foreground">
                          {alert.client.full_name}
                        </span>
                      )}
                      <span className="text-[10px] text-muted-foreground">
                        {formatDate(alert.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-3 ml-11">
                  <button
                    onClick={() => markRead.mutate(alert.id)}
                    disabled={markRead.isPending}
                    className="h-7 px-2.5 rounded-lg bg-white/80 border border-border/50 text-xs text-muted-foreground hover:text-foreground hover:bg-white transition-colors flex items-center gap-1.5"
                  >
                    <Eye className="w-3 h-3" />
                    Marquer lu
                  </button>
                  <button
                    onClick={() => resolveAlert.mutate(alert.id)}
                    disabled={resolveAlert.isPending}
                    className="h-7 px-2.5 rounded-lg bg-white/80 border border-border/50 text-xs text-green-700 hover:bg-green-50 transition-colors flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Resoudre
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
