"use client";

import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  UserMinus,
  CreditCard,
  HeartPulse,
  Clock,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

export interface AlertItem {
  id: string;
  type: "inactive" | "at_risk" | "late_payment" | "health_drop" | "overdue";
  title: string;
  description?: string;
  severity: "critical" | "warning" | "info";
  href?: string;
}

const ALERT_ICONS: Record<string, LucideIcon> = {
  inactive: UserMinus,
  at_risk: HeartPulse,
  late_payment: CreditCard,
  health_drop: AlertTriangle,
  overdue: Clock,
};

const SEVERITY_STYLES: Record<
  string,
  { bg: string; border: string; text: string; dot: string }
> = {
  critical: {
    bg: "bg-red-500/5",
    border: "border-red-500/20",
    text: "text-red-600 dark:text-red-400",
    dot: "bg-red-500",
  },
  warning: {
    bg: "bg-amber-500/5",
    border: "border-amber-500/20",
    text: "text-amber-600 dark:text-amber-400",
    dot: "bg-amber-500",
  },
  info: {
    bg: "bg-blue-500/5",
    border: "border-blue-500/20",
    text: "text-blue-600 dark:text-blue-400",
    dot: "bg-blue-500",
  },
};

interface AlertsWidgetProps {
  alerts: AlertItem[];
  title?: string;
  maxDisplay?: number;
  className?: string;
}

export function AlertsWidget({
  alerts,
  title = "Alertes",
  maxDisplay = 6,
  className,
}: AlertsWidgetProps) {
  if (alerts.length === 0) return null;

  const displayed = alerts.slice(0, maxDisplay);

  return (
    <div
      className={cn("bg-surface rounded-2xl p-6", className)}
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          {title}
        </h3>
        <span className="text-xs text-muted-foreground font-mono">
          {alerts.length}
        </span>
      </div>

      <div className="space-y-2 max-h-[320px] overflow-y-auto">
        {displayed.map((alert) => {
          const Icon = ALERT_ICONS[alert.type] ?? AlertTriangle;
          const severity =
            SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.warning;

          const content = (
            <div
              className={cn(
                "flex items-start gap-3 p-3 rounded-xl border transition-colors",
                severity.bg,
                severity.border,
                alert.href && "hover:brightness-95 cursor-pointer",
              )}
            >
              <div
                className={cn(
                  "w-2 h-2 rounded-full mt-1.5 shrink-0",
                  severity.dot,
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Icon className={cn("w-3.5 h-3.5 shrink-0", severity.text)} />
                  <p className="text-[13px] font-medium text-foreground truncate">
                    {alert.title}
                  </p>
                </div>
                {alert.description && (
                  <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                    {alert.description}
                  </p>
                )}
              </div>
            </div>
          );

          if (alert.href) {
            return (
              <Link key={alert.id} href={alert.href}>
                {content}
              </Link>
            );
          }

          return <div key={alert.id}>{content}</div>;
        })}
      </div>

      {alerts.length > maxDisplay && (
        <p className="text-[11px] text-muted-foreground text-center mt-3">
          +{alerts.length - maxDisplay} autre
          {alerts.length - maxDisplay > 1 ? "s" : ""} alerte
          {alerts.length - maxDisplay > 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
