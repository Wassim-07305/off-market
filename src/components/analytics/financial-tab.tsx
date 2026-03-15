"use client";

import { formatCurrency } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/stat-card";
import {
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  FileText,
  Download,
  Heart,
  Percent,
  Users,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { useFinancialReport, exportToCSV } from "@/hooks/use-reports";
import type { DateRange } from "@/types/analytics";

interface FinancialTabProps {
  range: DateRange;
}

const INVOICE_STATUS_COLORS: Record<string, string> = {
  paid: "#22c55e",
  sent: "#3b82f6",
  overdue: "#ef4444",
  draft: "#a1a1aa",
  cancelled: "#71717a",
};

const INVOICE_STATUS_LABELS: Record<string, string> = {
  paid: "Payees",
  sent: "Envoyees",
  overdue: "En retard",
  draft: "Brouillons",
  cancelled: "Annulees",
};

export function FinancialTab({ range }: FinancialTabProps) {
  const { data, isLoading } = useFinancialReport(range);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface rounded-2xl p-6 animate-shimmer"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="h-3 w-20 bg-muted rounded-lg mb-3" />
              <div className="h-8 w-24 bg-muted rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const pieData = Object.entries(data.invoiceStatus)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: INVOICE_STATUS_LABELS[status] ?? status,
      value: count,
      color: INVOICE_STATUS_COLORS[status] ?? "#a1a1aa",
    }));

  const handleExportRevenue = () => {
    exportToCSV(
      "revenus.csv",
      ["Mois", "Revenus (EUR)", "Nb factures"],
      data.revenueByMonth.map((m) => [
        m.label,
        String(m.revenue),
        String(m.invoiceCount),
      ]),
    );
  };

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Revenus total"
          value={formatCurrency(data.totalRevenue)}
          change={data.revenueTrend}
          changeLabel="vs periode"
          icon={DollarSign}
        />
        <StatCard
          title="MRR"
          value={formatCurrency(data.mrr)}
          icon={TrendingUp}
        />
        <StatCard
          title="En attente"
          value={formatCurrency(data.pendingAmount)}
          icon={Clock}
        />
        <StatCard
          title="En retard"
          value={formatCurrency(data.overdueAmount)}
          icon={AlertTriangle}
        />
      </div>

      {/* Revenue chart + Invoice status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue over time */}
        <div
          className="lg:col-span-2 bg-surface rounded-2xl p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[13px] font-semibold text-foreground">
                Evolution des revenus
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                ARR estim&eacute; : {formatCurrency(data.arr)}
              </p>
            </div>
            <button
              onClick={handleExportRevenue}
              className="h-8 px-3 rounded-xl border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              CSV
            </button>
          </div>
          <div className="h-72">
            {data.revenueByMonth.every((m) => m.revenue === 0) ? (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                <TrendingUp className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm">Aucune donnee de revenus</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueByMonth}>
                  <defs>
                    <linearGradient
                      id="finRevenueGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor="var(--primary)"
                        stopOpacity={0.15}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--primary)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "var(--muted-foreground)",
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                    }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "var(--muted-foreground)",
                      fontSize: 11,
                      fontFamily: "var(--font-mono)",
                    }}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    width={45}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--surface)",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "13px",
                      boxShadow: "var(--shadow-elevated)",
                      padding: "8px 12px",
                    }}
                    formatter={(v) => [
                      `${Number(v).toLocaleString("fr-FR")} EUR`,
                      "Revenus",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    fill="url(#finRevenueGrad)"
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "var(--primary)",
                      stroke: "var(--surface)",
                      strokeWidth: 2,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Invoice status pie */}
        <div
          className="bg-surface rounded-2xl p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h3 className="text-[13px] font-semibold text-foreground mb-4">
            Statut des factures
          </h3>
          {pieData.length === 0 ? (
            <div className="h-52 flex flex-col items-center justify-center text-muted-foreground">
              <FileText className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">Aucune facture</p>
            </div>
          ) : (
            <>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--surface)",
                        border: "none",
                        borderRadius: "12px",
                        fontSize: "13px",
                        boxShadow: "var(--shadow-elevated)",
                        padding: "8px 12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-3 mt-2">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-[11px] text-muted-foreground">
                      {entry.name} ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* LTV, Collection rate, Active clients */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          className="bg-surface rounded-2xl p-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <Heart className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
              LTV moyen
            </p>
          </div>
          <p className="text-xl font-display font-bold text-foreground">
            {formatCurrency(data.ltv)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Revenu total / clients payants
          </p>
        </div>
        <div
          className="bg-surface rounded-2xl p-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Percent className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
              Taux de recouvrement
            </p>
          </div>
          <p className="text-xl font-display font-bold text-foreground">
            {data.collectionRate}%
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Montant encaisse / facture
          </p>
        </div>
        <div
          className="bg-surface rounded-2xl p-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
              <Users className="w-4 h-4 text-violet-600" />
            </div>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
              Clients actifs
            </p>
          </div>
          <p className="text-xl font-display font-bold text-foreground">
            {data.activeClients}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Actifs ces 30 derniers jours
          </p>
        </div>
      </div>

      {/* Bottom stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          className="bg-surface rounded-2xl p-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
            Valeur moyenne / facture
          </p>
          <p className="text-xl font-display font-bold text-foreground">
            {formatCurrency(data.avgDealValue)}
          </p>
        </div>
        <div
          className="bg-surface rounded-2xl p-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
            Factures payees
          </p>
          <p className="text-xl font-display font-bold text-foreground">
            {data.invoiceStatus.paid}
          </p>
        </div>
        <div
          className="bg-surface rounded-2xl p-5"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-1">
            Factures en retard
          </p>
          <p className="text-xl font-display font-bold text-error">
            {data.invoiceStatus.overdue}
          </p>
        </div>
      </div>
    </div>
  );
}
