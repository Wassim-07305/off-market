"use client";

import { useCallback } from "react";
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Database,
  Users,
  MessageSquare,
  Phone,
  FileText,
  Clock,
  Loader2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  useHealthCheck,
  useUsageMetrics,
  useMonitoringAuditLogs,
} from "@/hooks/use-monitoring";
import { formatRelativeDate, cn } from "@/lib/utils";

// ── Status helpers ──

function statusColor(status: "ok" | "degraded" | "down") {
  switch (status) {
    case "ok":
      return "text-emerald-500";
    case "degraded":
      return "text-amber-500";
    case "down":
      return "text-red-500";
  }
}

function statusBg(status: "ok" | "degraded" | "down") {
  switch (status) {
    case "ok":
      return "bg-emerald-500/10";
    case "degraded":
      return "bg-amber-500/10";
    case "down":
      return "bg-red-500/10";
  }
}

function statusLabel(status: "ok" | "degraded" | "down") {
  switch (status) {
    case "ok":
      return "Opérationnel";
    case "degraded":
      return "Dégradé";
    case "down":
      return "Hors service";
  }
}

function StatusIcon({ status }: { status: "ok" | "degraded" | "down" }) {
  switch (status) {
    case "ok":
      return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    case "degraded":
      return <AlertTriangle className="h-5 w-5 text-amber-500" />;
    case "down":
      return <XCircle className="h-5 w-5 text-red-500" />;
  }
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}j ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

// ── Page ──

export default function MonitoringPage() {
  const queryClient = useQueryClient();
  const { data: health, isLoading: healthLoading, dataUpdatedAt } = useHealthCheck();
  const { data: metrics, isLoading: metricsLoading } = useUsageMetrics();
  const { data: auditLogs, isLoading: logsLoading } = useMonitoringAuditLogs(20);

  const handleRefresh = useCallback(async () => {
    try {
      await queryClient.invalidateQueries({ queryKey: ["health-check"] });
      toast.success("Vérification effectuée");
    } catch {
      toast.error("Erreur lors de la vérification");
    }
  }, [queryClient]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Activity className="h-6 w-6" />
          Monitoring
        </h1>
        <p className="text-muted-foreground mt-1">
          Santé et performance de la plateforme
        </p>
      </div>

      {/* Section 1 — Statut système */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Statut système</CardTitle>
              <CardDescription>
                État actuel de la plateforme
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={healthLoading}
            >
              <RefreshCw
                className={cn("h-4 w-4 mr-2", healthLoading && "animate-spin")}
              />
              Vérifier maintenant
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {healthLoading && !health ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : health ? (
            <div className="space-y-6">
              {/* Main status indicator */}
              <div
                className={cn(
                  "flex items-center gap-4 rounded-lg p-4",
                  statusBg(health.status),
                )}
              >
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full",
                    statusBg(health.status),
                  )}
                >
                  <StatusIcon status={health.status} />
                </div>
                <div>
                  <p className={cn("text-lg font-semibold", statusColor(health.status))}>
                    {statusLabel(health.status)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Version {health.version}
                  </p>
                </div>
                <Badge
                  variant={health.status === "ok" ? "default" : "destructive"}
                  className="ml-auto"
                >
                  {health.status.toUpperCase()}
                </Badge>
              </div>

              {/* Details grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Database latency */}
                <div className="rounded-lg border border-border p-4 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Database className="h-4 w-4" />
                    Base de données
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusIcon status={health.checks.database.status} />
                    <span className="text-xl font-semibold">
                      {health.checks.database.latency_ms}ms
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">Latence</p>
                </div>

                {/* Uptime */}
                <div className="rounded-lg border border-border p-4 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Uptime
                  </div>
                  <p className="text-xl font-semibold">
                    {formatUptime(health.uptime_seconds)}
                  </p>
                  <p className="text-xs text-muted-foreground">Durée de fonctionnement</p>
                </div>

                {/* Last check */}
                <div className="rounded-lg border border-border p-4 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <RefreshCw className="h-4 w-4" />
                    Dernière vérification
                  </div>
                  <p className="text-xl font-semibold">
                    {dataUpdatedAt
                      ? formatRelativeDate(new Date(dataUpdatedAt))
                      : "—"}
                  </p>
                  <p className="text-xs text-muted-foreground">Actualisation auto. 60s</p>
                </div>

                {/* Timestamp */}
                <div className="rounded-lg border border-border p-4 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    Horodatage
                  </div>
                  <p className="text-sm font-semibold">
                    {new Date(health.timestamp).toLocaleString("fr-FR")}
                  </p>
                  <p className="text-xs text-muted-foreground">Heure serveur</p>
                </div>
              </div>

              {/* Error details if any */}
              {health.checks.database.error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                  <p className="text-sm font-medium text-red-500">
                    Erreur base de données
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {health.checks.database.error}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground py-4">
              Impossible de récupérer le statut
            </p>
          )}
        </CardContent>
      </Card>

      {/* Section 2 — Métriques d'usage */}
      <Card>
        <CardHeader>
          <CardTitle>Métriques d&apos;usage</CardTitle>
          <CardDescription>
            Activité récente de la plateforme
          </CardDescription>
        </CardHeader>
        <CardContent>
          {metricsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : metrics ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                icon={Users}
                label="Utilisateurs actifs"
                value={metrics.activeUsers24h}
                description="Dernières 24h"
              />
              <MetricCard
                icon={MessageSquare}
                label="Messages envoyés"
                value={metrics.messagesToday}
                description="Aujourd'hui"
              />
              <MetricCard
                icon={Phone}
                label="Appels planifiés"
                value={metrics.callsThisWeek}
                description="Cette semaine"
              />
              <MetricCard
                icon={FileText}
                label="Formulaires soumis"
                value={metrics.formSubmissionsThisWeek}
                description="Cette semaine"
              />
            </div>
          ) : (
            <p className="text-muted-foreground py-4">
              Impossible de charger les métriques
            </p>
          )}
        </CardContent>
      </Card>

      {/* Section 3 — Logs récents */}
      <Card>
        <CardHeader>
          <CardTitle>Logs récents</CardTitle>
          <CardDescription>
            Dernières entrées du journal d&apos;audit
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : auditLogs && auditLogs.length > 0 ? (
            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-3 rounded-lg border border-border p-3 text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {log.action}
                      </Badge>
                      <span className="text-muted-foreground text-xs">
                        {formatRelativeDate(log.created_at)}
                      </span>
                    </div>
                    <p className="text-muted-foreground mt-1 truncate">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {(log as any).user?.full_name ?? (log as any).user?.email ?? "Système"}
                      {log.entity_type && ` — ${log.entity_type}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground py-4">
              Aucun log disponible
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ── Metric Card component ──

function MetricCard({
  icon: Icon,
  label,
  value,
  description,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border p-4 space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        {label}
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
