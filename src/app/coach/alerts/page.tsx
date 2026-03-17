"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  staggerContainer,
  fadeInUp,
  defaultTransition,
} from "@/lib/animations";
import {
  useCoachAlerts,
  useAllAlerts,
  useResolveAlert,
} from "@/hooks/use-coach-alerts";
import { ALERT_SEVERITY_CONFIG, ALERT_TYPE_CONFIG } from "@/types/coaching";
import type { AlertSeverity, AlertType } from "@/types/coaching";
import { Bell, CheckCircle, Filter } from "lucide-react";

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "a l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

export default function CoachAlertsPage() {
  const [showResolved, setShowResolved] = useState(false);
  const unresolvedQuery = useCoachAlerts();
  const allAlertsQuery = useAllAlerts();
  const resolveAlert = useResolveAlert();

  const activeQuery = showResolved ? allAlertsQuery : unresolvedQuery;
  const { data: alertsData, isLoading } = activeQuery;
  const alerts = alertsData ?? [];

  const bySeverity = {
    critical: alerts.filter((a) => a.severity === "critical" && !a.is_resolved),
    high: alerts.filter((a) => a.severity === "high" && !a.is_resolved),
    medium: alerts.filter((a) => a.severity === "medium" && !a.is_resolved),
    low: alerts.filter((a) => a.severity === "low" && !a.is_resolved),
  };

  const unresolved = alerts.filter((a) => !a.is_resolved);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Alertes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {unresolved.length} alerte(s) en cours
          </p>
        </div>
        <button
          onClick={() => setShowResolved(!showResolved)}
          className={`h-9 px-3 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
            showResolved
              ? "bg-primary text-white"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          {showResolved ? "Toutes" : "Non resolues"}
        </button>
      </motion.div>

      {/* Severity summary */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="grid grid-cols-4 gap-3"
      >
        {(["critical", "high", "medium", "low"] as AlertSeverity[]).map(
          (severity) => {
            const config = ALERT_SEVERITY_CONFIG[severity];
            const count = bySeverity[severity].length;
            return (
              <div
                key={severity}
                className="bg-surface border border-border rounded-xl p-4 text-center"
              >
                <p className="text-2xl font-semibold text-foreground">
                  {count}
                </p>
                <p
                  className={`text-xs font-medium ${config.color.split(" ")[1]}`}
                >
                  {config.label}
                </p>
              </div>
            );
          },
        )}
      </motion.div>

      {/* Alert list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <motion.div
          variants={fadeInUp}
          transition={defaultTransition}
          className="bg-surface border border-border rounded-xl p-12 text-center"
        >
          <Bell className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Aucune alerte</p>
        </motion.div>
      ) : (
        <motion.div
          variants={fadeInUp}
          transition={defaultTransition}
          className="space-y-2"
        >
          {alerts.map((alert) => {
            const severityConfig =
              ALERT_SEVERITY_CONFIG[alert.severity as AlertSeverity];
            const typeConfig = ALERT_TYPE_CONFIG[alert.alert_type as AlertType];

            return (
              <div
                key={alert.id}
                className={`flex items-center gap-4 p-4 bg-surface border border-border rounded-xl transition-colors ${
                  alert.is_resolved ? "opacity-50" : ""
                }`}
              >
                <span className="text-xl shrink-0">
                  {typeConfig?.icon ?? "⚠️"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-medium text-foreground">
                      {alert.title}
                    </p>
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${severityConfig.color}`}
                    >
                      {severityConfig.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {alert.client?.full_name ?? "Client"}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {timeAgo(alert.created_at)}
                    </span>
                  </div>
                  {alert.description && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.description}
                    </p>
                  )}
                </div>
                {!alert.is_resolved && (
                  <button
                    onClick={() => resolveAlert.mutate(alert.id)}
                    className="p-2 rounded-lg hover:bg-emerald-500/10 transition-colors text-emerald-500 shrink-0"
                    title="Marquer comme resolu"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
