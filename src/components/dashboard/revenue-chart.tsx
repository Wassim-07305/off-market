"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// Static data for now — will be replaced with real queries
const monthlyData = [
  { month: "Jan", revenue: 4200 },
  { month: "Fev", revenue: 5100 },
  { month: "Mar", revenue: 6800 },
  { month: "Avr", revenue: 5900 },
  { month: "Mai", revenue: 7200 },
  { month: "Juin", revenue: 8100 },
  { month: "Juil", revenue: 7600 },
  { month: "Aout", revenue: 6900 },
  { month: "Sep", revenue: 8400 },
  { month: "Oct", revenue: 9200 },
  { month: "Nov", revenue: 10100 },
  { month: "Dec", revenue: 11500 },
];

export function RevenueChart() {
  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Revenus</h3>
          <p className="text-xs text-muted-foreground">12 derniers mois</p>
        </div>
        <span
          className="text-2xl font-semibold text-foreground"
          style={{ fontFamily: "Instrument Serif, serif" }}
        >
          91 000 EUR
        </span>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border-color)",
                borderRadius: "10px",
                fontSize: "13px",
              }}
              formatter={(value) => [`${Number(value).toLocaleString("fr-FR")} EUR`, "Revenus"]}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#AF0000"
              strokeWidth={2.5}
              dot={false}
              activeDot={{
                r: 5,
                fill: "#AF0000",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
