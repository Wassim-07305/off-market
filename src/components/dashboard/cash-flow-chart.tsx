"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useCashFlow } from "@/hooks/use-cash-flow";
import { formatCurrency } from "@/lib/utils";
import { Receipt, TrendingUp } from "lucide-react";

export function CashFlowChart() {
  const { data: chartData, isLoading } = useCashFlow();

  const hasData = (chartData ?? []).some(
    (d) => d.invoiced > 0 || d.collected > 0,
  );

  const totalInvoiced = (chartData ?? []).reduce(
    (sum, d) => sum + d.invoiced,
    0,
  );
  const totalCollected = (chartData ?? []).reduce(
    (sum, d) => sum + d.collected,
    0,
  );

  return (
    <div
      className="bg-surface rounded-2xl p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-2">
            <Receipt className="w-4 h-4 text-muted-foreground" />
            Facture vs Encaisse
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            12 derniers mois
          </p>
        </div>
        {hasData && (
          <div className="text-right">
            <p className="text-xs text-muted-foreground">
              Taux encaissement
            </p>
            <p className="text-lg font-display font-bold text-foreground tracking-tight">
              {totalInvoiced > 0
                ? Math.round((totalCollected / totalInvoiced) * 100)
                : 0}
              %
            </p>
          </div>
        )}
      </div>

      <div className="h-64">
        {isLoading ? (
          <div className="h-full animate-shimmer rounded-xl" />
        ) : !hasData ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
            <TrendingUp className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-sm">Aucune donnee de facturation</p>
            <p className="text-xs mt-1 text-muted-foreground/60">
              Les donnees apparaitront ici quand des factures seront creees
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barGap={2}>
              <XAxis
                dataKey="month"
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
                tickFormatter={(v: number) =>
                  v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
                }
                width={40}
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
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any, name: any) => [
                  formatCurrency(Number(value)),
                  name === "invoiced" ? "Facture" : "Encaisse",
                ]}
              />
              <Legend
                verticalAlign="top"
                height={36}
                formatter={(value: string) =>
                  value === "invoiced" ? "Facture" : "Encaisse"
                }
                wrapperStyle={{ fontSize: "12px" }}
              />
              <Bar
                dataKey="invoiced"
                fill="#6366f1"
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
              />
              <Bar
                dataKey="collected"
                fill="#10b981"
                radius={[4, 4, 0, 0]}
                maxBarSize={24}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
