"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const weeklyData = [
  { day: "Lun", messages: 24, lessons: 8, logins: 15 },
  { day: "Mar", messages: 31, lessons: 12, logins: 18 },
  { day: "Mer", messages: 18, lessons: 6, logins: 12 },
  { day: "Jeu", messages: 42, lessons: 14, logins: 22 },
  { day: "Ven", messages: 35, lessons: 11, logins: 19 },
  { day: "Sam", messages: 12, lessons: 4, logins: 8 },
  { day: "Dim", messages: 8, lessons: 2, logins: 5 },
];

export function EngagementChart() {
  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Engagement</h3>
          <p className="text-xs text-muted-foreground">Cette semaine</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
            <span className="text-xs text-muted-foreground">Messages</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-success" />
            <span className="text-xs text-muted-foreground">Lecons</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-info" />
            <span className="text-xs text-muted-foreground">Connexions</span>
          </div>
        </div>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--surface)",
                border: "1px solid var(--border-color)",
                borderRadius: "10px",
                fontSize: "13px",
              }}
            />
            <Bar dataKey="messages" fill="#AF0000" radius={[4, 4, 0, 0]} barSize={16} />
            <Bar dataKey="lessons" fill="#22C55E" radius={[4, 4, 0, 0]} barSize={16} />
            <Bar dataKey="logins" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
