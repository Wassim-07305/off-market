"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useFinancialDashboard } from "@/hooks/use-invoices";
import { formatCurrency } from "@/lib/utils";
import { useUserCurrency, useConvertCurrency } from "@/hooks/use-currency";
import { CurrencySelector } from "@/components/ui/currency-selector";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Repeat,
  Activity,
} from "lucide-react";

const CHART_COLORS = [
  "#AF0000",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#06b6d4",
  "#3b82f6",
];

export function FinancialDashboard() {
  const { data, isLoading } = useFinancialDashboard();
  const currency = useUserCurrency();
  const convert = useConvertCurrency();

  /** Convert from EUR (data source) to the user's display currency */
  const c = (amount: number) => convert(amount, "EUR", currency);
  const fmt = (amount: number) => formatCurrency(c(amount), currency);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-muted/50 animate-pulse rounded-[14px]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-muted/50 animate-pulse rounded-[14px]" />
          <div className="h-72 bg-muted/50 animate-pulse rounded-[14px]" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const kpis = [
    {
      label: "Revenu total",
      value: fmt(data.totalRevenue),
      icon: DollarSign,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      trend: data.revenueGrowth,
    },
    {
      label: "MRR",
      value: fmt(data.mrr),
      icon: Repeat,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      subtitle: `ARR: ${fmt(data.arr)}`,
    },
    {
      label: "LTV moyen / client",
      value: fmt(data.avgLTV),
      icon: Target,
      color: "text-violet-500",
      bgColor: "bg-violet-500/10",
    },
    {
      label: "Retention",
      value: `${data.retentionRate}%`,
      icon: Users,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      subtitle: `Churn: ${data.churnRate}%`,
    },
    {
      label: "Encaisse",
      value: fmt(data.cashCollected),
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Facture",
      value: fmt(data.cashInvoiced),
      icon: BarChart3,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Ratio encaissement",
      value:
        data.cashInvoiced > 0
          ? `${Math.round((data.cashCollected / data.cashInvoiced) * 100)}%`
          : "–",
      icon: Activity,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
    },
    {
      label: "Croissance",
      value:
        data.revenueGrowth >= 0
          ? `+${data.revenueGrowth}%`
          : `${data.revenueGrowth}%`,
      icon: data.revenueGrowth >= 0 ? TrendingUp : TrendingDown,
      color: data.revenueGrowth >= 0 ? "text-emerald-500" : "text-red-500",
      bgColor: data.revenueGrowth >= 0 ? "bg-emerald-500/10" : "bg-red-500/10",
      subtitle: "vs mois precedent",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Currency selector */}
      <div className="flex items-center justify-end">
        <div className="w-36">
          <CurrencySelector label="Devise" />
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="bg-white border border-border rounded-[14px] p-4"
            >
              <div className="flex items-center gap-3 mb-2.5">
                <div
                  className={`w-9 h-9 rounded-[10px] ${kpi.bgColor} flex items-center justify-center`}
                >
                  <Icon className={`w-4 h-4 ${kpi.color}`} />
                </div>
                {kpi.trend !== undefined && (
                  <span
                    className={`text-xs font-medium flex items-center gap-0.5 ${
                      kpi.trend >= 0 ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {kpi.trend >= 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {Math.abs(kpi.trend)}%
                  </span>
                )}
              </div>
              <p className="text-lg font-semibold text-foreground">
                {kpi.value}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{kpi.label}</p>
              {kpi.subtitle && (
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                  {kpi.subtitle}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue over time */}
        <div className="bg-white border border-border rounded-[14px] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Revenus 12 mois
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Facture vs encaisse
              </p>
            </div>
          </div>
          <div className="h-64">
            {data.monthlyData.some((m) => m.invoiced > 0 || m.collected > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.monthlyData}>
                  <defs>
                    <linearGradient
                      id="colorInvoiced"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorCollected"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v: number) => fmt(v)}
                    width={60}
                  />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      fmt(value),
                      name === "invoiced" ? "Facture" : "Encaisse",
                    ]}
                    contentStyle={{
                      background: "hsl(var(--surface))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="invoiced"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#colorInvoiced)"
                    name="invoiced"
                  />
                  <Area
                    type="monotone"
                    dataKey="collected"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorCollected)"
                    name="collected"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <BarChart3 className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">Aucune donnee</p>
              </div>
            )}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded bg-blue-500" />
              <span className="text-xs text-muted-foreground">Facture</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 rounded bg-emerald-500" />
              <span className="text-xs text-muted-foreground">Encaisse</span>
            </div>
          </div>
        </div>

        {/* Revenue by channel */}
        <div className="bg-white border border-border rounded-[14px] p-5">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground">
              Revenus par canal
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Repartition de l&apos;acquisition
            </p>
          </div>
          {data.revenueByChannel.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-40 h-40 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.revenueByChannel}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="percentage"
                    >
                      {data.revenueByChannel.map((_entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CHART_COLORS[index % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2.5">
                {data.revenueByChannel.map((channel, i) => (
                  <div
                    key={channel.channel}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            CHART_COLORS[i % CHART_COLORS.length],
                        }}
                      />
                      <span className="text-sm text-foreground">
                        {channel.channel}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-medium text-foreground">
                        {channel.percentage}%
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {fmt(channel.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-muted-foreground">
              <Target className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">Aucune donnee</p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly bar chart */}
      <div className="bg-white border border-border rounded-[14px] p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">
            Flux de tresorerie mensuel
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Encaissements mensuels
          </p>
        </div>
        <div className="h-48">
          {data.monthlyData.some((m) => m.collected > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyData}>
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => fmt(v)}
                  width={60}
                />
                <Tooltip
                  formatter={(value: number) => [fmt(value), "Encaisse"]}
                  contentStyle={{
                    background: "hsl(var(--surface))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="collected" fill="#AF0000" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <BarChart3 className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">Aucune donnee de tresorerie</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
