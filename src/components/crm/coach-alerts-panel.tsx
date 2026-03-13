"use client";

import { useCoachAlerts } from "@/hooks/use-coach-alerts";
import { ALERT_TYPE_CONFIG, ALERT_SEVERITY_CONFIG } from "@/types/coaching";
import type { AlertSeverity, AlertType } from "@/types/coaching";
import { cn, formatDate, getInitials } from "@/lib/utils";
import { toast } from "sonner";
import {
  Bell,
  Check,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

interface CoachAlertsPanelProps {
  className?: string;
  collapsed?: boolean;
}

export function CoachAlertsPanel({
  className,
  collapsed: initialCollapsed = false,
}: CoachAlertsPanelProps) {
  const { alerts, isLoading, resolveAlert } = useCoachAlerts(false);
  const [collapsed, setCollapsed] = useState(initialCollapsed);

  const handleResolve = async (alertId: string) => {
    await resolveAlert.mutateAsync(alertId);
    toast.success("Alerte resolue");
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "bg-surface rounded-xl border border-border p-4",
          className,
        )}
      >
        <div className="h-5 w-32 bg-muted animate-shimmer rounded mb-3" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 bg-muted animate-shimmer rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (alerts.length === 0) {
    return null;
  }

  // Group by severity
  const criticalAlerts = alerts.filter(
    (a) =>
      (a.severity as AlertSeverity) === "critical" ||
      (a.severity as AlertSeverity) === "high",
  );
  const otherAlerts = alerts.filter(
    (a) =>
      (a.severity as AlertSeverity) !== "critical" &&
      (a.severity as AlertSeverity) !== "high",
  );

  return (
    <div
      className={cn(
        "bg-surface rounded-xl border border-border overflow-hidden",
        className,
      )}
    >
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-4 h-4 text-foreground" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center">
                {alerts.length > 9 ? "9+" : alerts.length}
              </span>
            )}
          </div>
          <span className="text-sm font-semibold text-foreground">
            Alertes coach
          </span>
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-mono">
            {alerts.length}
          </span>
        </div>
        {collapsed ? (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        )}
      </button>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-2">
          {/* Critical alerts first */}
          {criticalAlerts.map((alert) => {
            const typeConfig = ALERT_TYPE_CONFIG[alert.alert_type as AlertType];
            const severityConfig =
              ALERT_SEVERITY_CONFIG[alert.severity as AlertSeverity];

            return (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-red-500/5 border border-red-200"
              >
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-foreground truncate">
                      {alert.title}
                    </p>
                    <span
                      className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0",
                        severityConfig?.color,
                      )}
                    >
                      {severityConfig?.label}
                    </span>
                  </div>
                  {alert.client && (
                    <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1">
                      <span className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-[8px] text-primary font-medium">
                        {getInitials(alert.client.full_name)}
                      </span>
                      {alert.client.full_name}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {formatDate(alert.created_at, "relative")}
                  </p>
                </div>
                <button
                  onClick={() => handleResolve(alert.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-success hover:bg-success/10 transition-colors shrink-0"
                  title="Marquer comme resolu"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}

          {/* Other alerts */}
          {otherAlerts.map((alert) => {
            const typeConfig = ALERT_TYPE_CONFIG[alert.alert_type as AlertType];
            const severityConfig =
              ALERT_SEVERITY_CONFIG[alert.severity as AlertSeverity];

            return (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-border"
              >
                <span className="text-base shrink-0 mt-0.5">
                  {typeConfig?.icon ?? "📋"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-medium text-foreground truncate">
                      {alert.title}
                    </p>
                    <span
                      className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0",
                        severityConfig?.color,
                      )}
                    >
                      {severityConfig?.label}
                    </span>
                  </div>
                  {alert.client && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {alert.client.full_name}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground/60 mt-1">
                    {formatDate(alert.created_at, "relative")}
                  </p>
                </div>
                <button
                  onClick={() => handleResolve(alert.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-success hover:bg-success/10 transition-colors shrink-0"
                  title="Marquer comme resolu"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
