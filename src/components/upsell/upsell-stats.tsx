"use client";

import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Clock, TrendingUp, Award } from "lucide-react";

interface UpsellStatsProps {
  stats: {
    total: number;
    detected: number;
    proposed: number;
    accepted: number;
    declined: number;
    conversionRate: number;
    totalRevenue: number;
    averageLTV: number;
    averageDaysToUpsell: number;
    byMonth: Array<{
      month: string;
      accepted: number;
      proposed: number;
      declined: number;
    }>;
    topOffers: Array<{ name: string; count: number }>;
  };
  isLoading: boolean;
}

const PIE_COLORS = ["#22c55e", "#f59e0b", "#ef4444", "#6b7280"];

export function UpsellStats({ stats, isLoading }: UpsellStatsProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-64 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  const pieData = [
    { name: "Acceptees", value: stats.accepted },
    { name: "Proposees", value: stats.proposed },
    { name: "Declinees", value: stats.declined },
    { name: "Detectees", value: stats.detected },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Taux de conversion
            </span>
          </div>
          <p className="text-3xl font-semibold text-foreground">
            {stats.conversionRate}%
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.accepted} acceptees sur {stats.accepted + stats.declined}{" "}
            resolues
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Temps moyen
            </span>
          </div>
          <p className="text-3xl font-semibold text-foreground">
            {stats.averageDaysToUpsell}j
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Entre detection et acceptation
          </p>
        </div>

        <div className="bg-surface border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Revenue total
            </span>
          </div>
          <p className="text-3xl font-semibold text-foreground">
            {formatCurrency(stats.totalRevenue)}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            LTV moyenne : {formatCurrency(stats.averageLTV)}
          </p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart - Evolution par mois */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Evolution des upsells par mois
          </h3>
          {stats.byMonth.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Pas assez de donnees pour afficher le graphique
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    tickLine={false}
                    axisLine={{ stroke: "#e5e7eb" }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    tickLine={false}
                    axisLine={{ stroke: "#e5e7eb" }}
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <Bar
                    dataKey="accepted"
                    name="Acceptees"
                    fill="#22c55e"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="proposed"
                    name="En cours"
                    fill="#f59e0b"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="declined"
                    name="Declinees"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Pie chart - Repartition par statut */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Repartition par statut
          </h3>
          {pieData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Aucune donnee disponible
            </p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 8,
                      border: "1px solid #e5e7eb",
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Top offers */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Top offres les plus acceptees
        </h3>
        {stats.topOffers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            Aucune offre acceptee pour le moment
          </p>
        ) : (
          <div className="space-y-3">
            {stats.topOffers.map((offer, i) => {
              const maxCount = stats.topOffers[0]?.count ?? 1;
              const widthPercent = Math.max((offer.count / maxCount) * 100, 8);

              return (
                <div key={offer.name} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground w-6 text-right">
                    #{i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {offer.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {offer.count} upsell{offer.count > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          i === 0
                            ? "bg-emerald-500"
                            : i === 1
                              ? "bg-blue-500"
                              : "bg-amber-500",
                        )}
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
