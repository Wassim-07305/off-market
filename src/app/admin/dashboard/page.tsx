"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useAdminDashboard } from "@/hooks/use-admin-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ConversionFunnel } from "@/components/dashboard/conversion-funnel";
import { KpiGoalsWidget } from "@/components/dashboard/kpi-goals";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { PeriodComparison } from "@/components/dashboard/period-comparison";
import { LTVRanking } from "@/components/dashboard/ltv-ranking";
import { AiPeriodicReport } from "@/components/dashboard/ai-periodic-report";
import { formatCurrency, cn } from "@/lib/utils";
import {
  DollarSign,
  Users,
  UserPlus,
  UserMinus,
  ShieldCheck,
  AlertTriangle,
  GraduationCap,
  Target,
  Receipt,
  CalendarCheck,
  Percent,
  BarChart3,
  PieChart as PieChartIcon,
  Crown,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon apres-midi";
  return "Bonsoir";
}

const CHANNEL_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

function MiniKPI({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}) {
  return (
    <div
      className="bg-surface border border-border rounded-xl p-4"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
            bgColor,
          )}
        >
          <Icon className={cn("w-4 h-4", color)} />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-semibold text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

function CashCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div
      className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <Icon className={cn("w-4 h-4 shrink-0", color)} />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

function MiniStatSkeleton() {
  return (
    <div
      className="bg-surface border border-border rounded-xl p-4 animate-pulse"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="h-4 w-20 bg-muted rounded mb-2" />
      <div className="h-6 w-16 bg-muted rounded" />
    </div>
  );
}

export default function AdminDashboardPage() {
  const { profile } = useAuth();
  const { data, isLoading } = useAdminDashboard();

  const firstName = profile?.full_name?.split(" ")[0] ?? "Admin";

  const alertsCount = useMemo(() => {
    if (!data) return 0;
    return data.inactiveStudents + data.latePayments + data.atRiskStudents;
  }, [data]);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
          {getGreeting()}, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Vue d&apos;ensemble de la plateforme
        </p>
      </motion.div>

      {/* System alerts banner */}
      {!isLoading && alertsCount > 0 && (
        <motion.div
          variants={staggerItem}
          className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              {alertsCount} alerte{alertsCount > 1 ? "s" : ""} systeme
            </p>
            <p className="text-xs text-amber-600/80 dark:text-amber-500/80">
              {data!.inactiveStudents > 0 &&
                `${data!.inactiveStudents} eleve${data!.inactiveStudents > 1 ? "s" : ""} inactif${data!.inactiveStudents > 1 ? "s" : ""}`}
              {data!.inactiveStudents > 0 && data!.atRiskStudents > 0 && " · "}
              {data!.atRiskStudents > 0 && `${data!.atRiskStudents} a risque`}
              {(data!.inactiveStudents > 0 || data!.atRiskStudents > 0) &&
                data!.latePayments > 0 &&
                " · "}
              {data!.latePayments > 0 &&
                `${data!.latePayments} paiement${data!.latePayments > 1 ? "s" : ""} en retard`}
            </p>
          </div>
        </motion.div>
      )}

      {/* KPI Cards — Row 1: Revenue */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface rounded-2xl p-6 animate-shimmer"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="h-4 w-24 bg-muted rounded-lg mb-4" />
              <div className="h-8 w-16 bg-muted rounded-lg" />
            </div>
          ))
        ) : (
          <>
            <StatCard
              title="CA du mois"
              value={formatCurrency(data?.revenueThisMonth ?? 0)}
              change={data?.revenueChange ?? 0}
              changeLabel="vs mois dernier"
              icon={DollarSign}
            />
            <StatCard
              title="Eleves actifs"
              value={data?.totalStudents ?? 0}
              icon={Users}
            />
            <StatCard
              title="Nouveaux ce mois"
              value={data?.newStudentsThisMonth ?? 0}
              icon={UserPlus}
            />
            <StatCard
              title="LTV moyen"
              value={formatCurrency(data?.averageLtv ?? 0)}
              icon={Receipt}
            />
          </>
        )}
      </motion.div>

      {/* KPI Cards — Row 2: Rates */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <MiniStatSkeleton key={i} />)
        ) : (
          <>
            <MiniKPI
              label="Retention"
              value={`${data?.retentionRate ?? 0}%`}
              icon={ShieldCheck}
              color="text-emerald-500"
              bgColor="bg-emerald-500/10"
            />
            <MiniKPI
              label="Churn"
              value={`${data?.churnRate ?? 0}%`}
              icon={UserMinus}
              color={
                (data?.churnRate ?? 0) > 10
                  ? "text-red-500"
                  : "text-muted-foreground"
              }
              bgColor={
                (data?.churnRate ?? 0) > 10 ? "bg-red-500/10" : "bg-muted/50"
              }
            />
            <MiniKPI
              label="Taux closing"
              value={`${data?.globalClosingRate ?? 0}%`}
              icon={Target}
              color="text-blue-500"
              bgColor="bg-blue-500/10"
            />
            <MiniKPI
              label="Completion formations"
              value={`${data?.formationCompletionRate ?? 0}%`}
              icon={GraduationCap}
              color="text-violet-500"
              bgColor="bg-violet-500/10"
            />
          </>
        )}
      </motion.div>

      {/* Charts row: Revenue evolution + Channel distribution */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Revenue evolution (2 cols) */}
        <div
          className="lg:col-span-2 bg-surface rounded-2xl p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                Evolution CA
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                6 derniers mois
              </p>
            </div>
            {data && (
              <span className="text-xl font-display font-bold text-foreground tracking-tight">
                {formatCurrency(
                  data.revenueByMonth.reduce((s, m) => s + m.revenue, 0),
                )}
              </span>
            )}
          </div>
          <div className="h-64">
            {isLoading ? (
              <div className="h-full animate-shimmer rounded-xl" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data?.revenueByMonth ?? []}>
                  <defs>
                    <linearGradient
                      id="adminRevGrad"
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
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
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
                    formatter={(value: number | undefined) =>
                      value != null ? [formatCurrency(value), "CA"] : ["\u2014"]
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--primary)"
                    strokeWidth={2.5}
                    fill="url(#adminRevGrad)"
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

        {/* Channel distribution (1 col) */}
        <div
          className="bg-surface rounded-2xl p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-2 mb-4">
            <PieChartIcon className="w-4 h-4 text-muted-foreground" />
            CA par canal
          </h3>
          {isLoading ? (
            <div className="h-48 animate-shimmer rounded-xl" />
          ) : !data?.revenueByChannel.length ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              Aucune donnee
            </div>
          ) : (
            <>
              <div className="w-40 h-40 mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.revenueByChannel}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="revenue"
                      nameKey="channel"
                      stroke="none"
                    >
                      {data.revenueByChannel.map((_, i) => (
                        <Cell
                          key={i}
                          fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]}
                        />
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
                      formatter={(value: number | undefined) =>
                        value != null ? [formatCurrency(value)] : ["\u2014"]
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-1.5">
                {data.revenueByChannel.map((item, i) => (
                  <div
                    key={item.channel}
                    className="flex items-center justify-between text-[12px]"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            CHANNEL_COLORS[i % CHANNEL_COLORS.length],
                        }}
                      />
                      <span className="text-foreground">{item.channel}</span>
                    </div>
                    <span className="font-mono text-muted-foreground tabular-nums">
                      {item.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Cash & Revenue details */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <MiniStatSkeleton key={i} />)
        ) : (
          <>
            <CashCard
              label="Cash encaisse"
              value={formatCurrency(data?.cashCollected ?? 0)}
              icon={DollarSign}
              color="text-emerald-500"
            />
            <CashCard
              label="Cash facture"
              value={formatCurrency(data?.cashInvoiced ?? 0)}
              icon={Receipt}
              color="text-blue-500"
            />
            <CashCard
              label="Check-ins semaine"
              value={String(data?.weeklyCheckins ?? 0)}
              icon={CalendarCheck}
              color="text-violet-500"
            />
          </>
        )}
      </motion.div>

      {/* Revenue by quarter */}
      {data && data.revenueByQuarter.length > 0 && (
        <motion.div
          variants={staggerItem}
          className="bg-surface rounded-2xl p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h3 className="text-[13px] font-semibold text-foreground mb-4 flex items-center gap-2">
            <Percent className="w-4 h-4 text-muted-foreground" />
            CA par trimestre
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.revenueByQuarter}>
                <XAxis
                  dataKey="quarter"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  dy={4}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                  tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
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
                  formatter={(value: number | undefined) =>
                    value != null ? [formatCurrency(value), "CA"] : ["\u2014"]
                  }
                />
                <Bar
                  dataKey="revenue"
                  fill="var(--primary)"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={60}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Rapport IA periodique */}
      <motion.div variants={staggerItem}>
        <AiPeriodicReport />
      </motion.div>

      {/* Activity Heatmap + Period Comparison */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <ActivityHeatmap />
        <PeriodComparison />
      </motion.div>

      {/* LTV Ranking */}
      <motion.div variants={staggerItem}>
        <LTVRanking />
      </motion.div>

      {/* KPI Goals + Funnel */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <KpiGoalsWidget />
        <ConversionFunnel />
      </motion.div>

      {/* Bottom: Activity feed + Coach leaderboard */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
        <div
          className="bg-surface rounded-2xl p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h3 className="text-[13px] font-semibold text-foreground flex items-center gap-2 mb-4">
            <Crown className="w-4 h-4 text-amber-500" />
            Leaderboard coaches
          </h3>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-10 animate-shimmer rounded-lg" />
              ))}
            </div>
          ) : !data?.coachLeaderboard.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucun coach
            </p>
          ) : (
            <div className="space-y-2.5">
              {data.coachLeaderboard.map((coach, i) => (
                <div
                  key={coach.name}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/30 transition-colors"
                >
                  <span className="text-xs text-muted-foreground w-5 text-center font-mono">
                    {i + 1}
                  </span>
                  {coach.avatar ? (
                    <img
                      src={coach.avatar}
                      alt=""
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs text-primary font-semibold">
                      {coach.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-foreground truncate">
                      {coach.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {coach.students} eleve
                      {coach.students !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
