"use client";

import { motion } from "framer-motion";
import { staggerContainer, fadeInUp, defaultTransition } from "@/lib/animations";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const revenueData = [
  { month: "Jan", value: 4200 },
  { month: "Fev", value: 5100 },
  { month: "Mar", value: 6800 },
  { month: "Avr", value: 5900 },
  { month: "Mai", value: 7200 },
  { month: "Juin", value: 8100 },
  { month: "Juil", value: 7600 },
  { month: "Aout", value: 6900 },
  { month: "Sep", value: 8400 },
  { month: "Oct", value: 9200 },
  { month: "Nov", value: 10100 },
  { month: "Dec", value: 11500 },
];

const completionData = [
  { name: "Module 1", completion: 92 },
  { name: "Module 2", completion: 78 },
  { name: "Module 3", completion: 65 },
  { name: "Module 4", completion: 54 },
  { name: "Module 5", completion: 41 },
];

const tagDistribution = [
  { name: "Standard", value: 45, color: "#71717A" },
  { name: "VIP", value: 15, color: "#F59E0B" },
  { name: "Nouveau", value: 20, color: "#22C55E" },
  { name: "A risque", value: 12, color: "#EF4444" },
  { name: "Perdu", value: 8, color: "#D4D4D8" },
];

export default function AnalyticsPage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeInUp} transition={defaultTransition}>
        <h1
          className="text-3xl font-semibold text-foreground font-bold"
        >
          Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Performance et metriques detaillees
        </p>
      </motion.div>

      {/* Overview stats */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {[
          { label: "Revenus total", value: "91 000 EUR" },
          { label: "Eleves total", value: "47" },
          { label: "Taux completion", value: "73%" },
          { label: "NPS moyen", value: "8.2" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-surface border border-border rounded-xl p-5 text-center"
          >
            <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
            <p
              className="text-2xl font-semibold text-foreground font-bold"
            >
              {stat.value}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Charts */}
      <motion.div
        variants={fadeInUp}
        transition={defaultTransition}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Revenue trend */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Evolution des revenus
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-color)", borderRadius: "10px", fontSize: "13px" }} />
                <Line type="monotone" dataKey="value" stroke="#AF0000" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completion by module */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Completion par module
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={completionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis type="number" domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} width={80} />
                <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-color)", borderRadius: "10px", fontSize: "13px" }} formatter={(v) => [`${v}%`, "Completion"]} />
                <Bar dataKey="completion" fill="#AF0000" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tag distribution */}
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">
            Repartition des eleves
          </h3>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tagDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {tagDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: "var(--surface)", border: "1px solid var(--border-color)", borderRadius: "10px", fontSize: "13px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-2">
            {tagDistribution.map((entry) => (
              <div key={entry.name} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs text-muted-foreground">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
