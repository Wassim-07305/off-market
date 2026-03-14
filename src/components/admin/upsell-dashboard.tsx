"use client";

import {
  TrendingUp,
  Users,
  CheckCircle,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useUpsellDashboard } from "@/hooks/use-upsell";
import { UPSELL_STATUS_CONFIG } from "@/types/upsell";
import type { UpsellTriggerStatus } from "@/types/upsell";
import { formatRelativeDate } from "@/lib/utils";

export function UpsellDashboard() {
  const { data, isLoading } = useUpsellDashboard();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-24" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Total upsells",
      value: data?.total ?? 0,
      icon: TrendingUp,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "En attente",
      value: data?.pending.length ?? 0,
      icon: Clock,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Convertis",
      value: data?.converted.length ?? 0,
      icon: CheckCircle,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Taux de conversion",
      value: `${(data?.conversionRate ?? 0).toFixed(1)}%`,
      icon: ArrowUpRight,
      color: "text-primary bg-primary/10",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Dashboard Upsell
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Vue d&apos;ensemble des upsells declenches et leur conversion.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold mt-1">{stat.value}</p>
                </div>
                <div className={cn("p-2.5 rounded-xl", stat.color)}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Triggers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upsells recents</CardTitle>
          <CardDescription>
            Derniers declenchements d&apos;upsell
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!data?.triggers.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucun upsell declenche pour le moment.
            </p>
          ) : (
            <div className="space-y-3">
              {data.triggers.slice(0, 10).map((trigger) => {
                const statusConfig =
                  UPSELL_STATUS_CONFIG[
                    trigger.status as UpsellTriggerStatus
                  ];
                return (
                  <div
                    key={trigger.id}
                    className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {trigger.client?.avatar_url ? (
                        <img
                          src={trigger.client.avatar_url}
                          alt=""
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">
                          {trigger.client?.full_name ?? "Client"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {trigger.rule?.offer_title ?? "Offre"} &middot;{" "}
                          {formatRelativeDate(trigger.triggered_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-xs px-2 py-1 rounded-full font-medium",
                          statusConfig?.bg,
                          statusConfig?.color,
                        )}
                      >
                        {statusConfig?.label ?? trigger.status}
                      </span>
                      {trigger.rule?.offer_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(trigger.rule!.offer_url!, "_blank")
                          }
                          icon={<ArrowUpRight className="h-3.5 w-3.5" />}
                        >
                          Voir
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
