"use client";

import { useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import {
  useRevenueStats,
  useStudentStats,
  useSalesStats,
  useEngagementStats,
  useCoachLeaderboard,
} from "@/hooks/use-admin-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ConversionFunnel } from "@/components/dashboard/conversion-funnel";
import { KpiGoalsWidget } from "@/components/dashboard/kpi-goals";
import { ActivityHeatmap } from "@/components/dashboard/activity-heatmap";
import { PeriodComparison } from "@/components/dashboard/period-comparison";
import { LTVRanking } from "@/components/dashboard/ltv-ranking";
import { AiPeriodicReport } from "@/components/dashboard/ai-periodic-report";
import Link from "next/link";
import { ExportDropdown } from "@/components/shared/export-dropdown";
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
  ArrowRight,
  FileText,
  Table,
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
  "#AF0000",
  "#71717a",
  "#a1a1aa",
  "#d4d4d8",
  "#52525b",
  "#3f3f46",
];

/* ─── Mini KPI (Row 2) ─── */
function MiniKPI({
  label,
  value,
  icon: Icon,
  color,
  accentBg,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor?: string;
  accentBg?: string;
}) {
  return (
    <div className="group relative overflow-hidden bg-surface border border-border rounded-2xl p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "size-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110",
            accentBg ?? "bg-muted",
          )}
        >
          <Icon className={cn("size-[16px]", color)} />
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
            {label}
          </p>
          <p className="text-xl font-bold text-foreground tabular-nums leading-tight">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Cash Card ─── */
function CashCard({
  label,
  value,
  icon: Icon,
  color,
  accentBg,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  accentBg?: string;
}) {
  return (
    <div className="group relative overflow-hidden bg-surface border border-border rounded-2xl p-4 flex items-center gap-3 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <div
        className={cn(
          "size-9 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110",
          accentBg ?? "bg-muted",
        )}
      >
        <Icon className={cn("size-[16px]", color)} />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-semibold">
          {label}
        </p>
        <p className="text-base font-bold text-foreground tabular-nums">
          {value}
        </p>
      </div>
    </div>
  );
}

/* ─── Skeleton ─── */
function MiniStatSkeleton() {
  return (
    <div className="bg-surface border border-border rounded-2xl p-4 animate-pulse">
      <div className="h-4 w-20 bg-muted rounded-lg mb-2" />
      <div className="h-6 w-16 bg-muted rounded-lg" />
    </div>
  );
}

/* ─── Section Header ─── */
function SectionHeader({
  icon: Icon,
  label,
  extra,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-2.5">
        <Icon className="size-4 text-muted-foreground/60" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
          {label}
        </h3>
        <div className="h-px flex-1 bg-gradient-to-r from-zinc-200 to-transparent ml-2 min-w-[40px]" />
      </div>
      {extra}
    </div>
  );
}

/* ─── Chart Card Wrapper ─── */
function ChartCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "bg-surface border border-border rounded-2xl p-6 transition-shadow duration-300 hover:shadow-md",
        className,
      )}
    >
      {children}
    </div>
  );
}

const TOOLTIP_STYLE = {
  backgroundColor: "var(--surface)",
  border: "1px solid var(--border)",
  borderRadius: "12px",
  fontSize: "13px",
  boxShadow:
    "0 4px 6px -1px rgb(0 0 0 / 0.05), 0 10px 15px -3px rgb(0 0 0 / 0.03)",
  padding: "10px 14px",
};

/* ═══════════════════════════════════════════ */
/*  Main Component                             */
/* ═══════════════════════════════════════════ */

export default function AdminDashboardPage() {
  const { profile } = useAuth();

  // Independent hooks — each section renders as soon as its data arrives
  const revenueQuery = useRevenueStats();
  const studentsQuery = useStudentStats();
  const salesQuery = useSalesStats();
  const engagementQuery = useEngagementStats();
  const coachesQuery = useCoachLeaderboard();

  const firstName = profile?.full_name?.split(" ")[0] ?? "Admin";

  const alertsCount = useMemo(() => {
    if (!studentsQuery.data || !coachesQuery.data) return 0;
    return studentsQuery.data.atRiskStudents + coachesQuery.data.latePayments;
  }, [studentsQuery.data, coachesQuery.data]);

  const alertsReady = !!studentsQuery.data && !!coachesQuery.data;

  return (
    <div className="space-y-4">
      {/* ─── Header ─── */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
              {getGreeting()}, {firstName}
            </span>
          </h1>
          <p className="text-sm text-muted-foreground/70">
            Vue d&apos;ensemble de la plateforme
          </p>
        </div>
        <ExportDropdown
          options={[
            {
              label: "Rapport PDF",
              icon: FileText,
              onClick: () => {
                window.open("/api/admin/dashboard-export?format=pdf", "_blank");
              },
            },
            {
              label: "Export CSV",
              icon: Table,
              onClick: () => {
                window.open("/api/admin/dashboard-export?format=csv", "_blank");
              },
            },
          ]}
        />
      </div>

      {/* ─── System alerts banner ─── */}
      {alertsReady && alertsCount > 0 && (
        <motion.div
          variants={staggerItem}
          className="relative overflow-hidden rounded-2xl border border-amber-200/80 p-4 sm:p-5"
          style={{
            background:
              "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 40%, #FCD34D 100%)",
          }}
        >
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative flex items-center gap-4">
            <div className="size-10 rounded-xl bg-amber-600/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-5 text-amber-700" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-900">
                {alertsCount} alerte{alertsCount > 1 ? "s" : ""} systeme
              </p>
              <p className="text-xs text-amber-800/80 mt-0.5">
                {studentsQuery.data!.atRiskStudents > 0 &&
                  `${studentsQuery.data!.atRiskStudents} eleve${studentsQuery.data!.atRiskStudents > 1 ? "s" : ""} signale${studentsQuery.data!.atRiskStudents > 1 ? "s" : ""}`}
                {studentsQuery.data!.atRiskStudents > 0 &&
                  coachesQuery.data!.latePayments > 0 &&
                  " · "}
                {coachesQuery.data!.latePayments > 0 &&
                  `${coachesQuery.data!.latePayments} paiement${coachesQuery.data!.latePayments > 1 ? "s" : ""} en retard`}
              </p>
            </div>
            <Link
              href="/admin/clients"
              className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-900/90 text-white text-xs font-semibold hover:bg-amber-900 transition-colors shadow-sm"
            >
              Voir les alertes
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* ─── KPI Cards — Row 1: Revenue + Student stats ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {revenueQuery.isLoading || studentsQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-2xl p-5 animate-pulse"
            >
              <div className="h-3 w-24 bg-muted rounded-lg mb-5" />
              <div className="h-8 w-20 bg-muted rounded-lg" />
            </div>
          ))
        ) : (
          <>
            <Link href="/admin/billing/ca" className="block hover:ring-2 hover:ring-primary/20 rounded-[14px] transition-shadow">
              <StatCard
                title="CA du mois"
                value={formatCurrency(revenueQuery.data?.revenueThisMonth ?? 0)}
                change={revenueQuery.data?.revenueChange ?? 0}
                changeLabel="vs mois dernier"
                icon={DollarSign}
                iconBg="bg-[#AF0000]/10"
                iconColor="text-[#AF0000]"
              />
            </Link>
            <StatCard
              title="Élèves actifs"
              value={studentsQuery.data?.totalStudents ?? 0}
              icon={Users}
              iconBg="bg-blue-500/10"
              iconColor="text-blue-600"
            />
            <StatCard
              title="Nouveaux ce mois"
              value={studentsQuery.data?.newStudentsThisMonth ?? 0}
              icon={UserPlus}
              iconBg="bg-emerald-500/10"
              iconColor="text-emerald-600"
            />
            <StatCard
              title="LTV moyen"
              value={formatCurrency(studentsQuery.data?.averageLtv ?? 0)}
              icon={Receipt}
              iconBg="bg-violet-500/10"
              iconColor="text-violet-600"
            />
          </>
        )}
      </div>

      {/* ─── KPI Cards — Row 2: Rates ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {studentsQuery.isLoading ||
        salesQuery.isLoading ||
        engagementQuery.isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <MiniStatSkeleton key={i} />)
        ) : (
          <>
            <MiniKPI
              label="Retention"
              value={`${studentsQuery.data?.retentionRate ?? 0}%`}
              icon={ShieldCheck}
              color="text-emerald-600"
              accentBg="bg-emerald-500/10"
            />
            <MiniKPI
              label="Churn"
              value={`${studentsQuery.data?.churnRate ?? 0}%`}
              icon={UserMinus}
              color={
                (studentsQuery.data?.churnRate ?? 0) > 10
                  ? "text-red-600"
                  : "text-muted-foreground"
              }
              accentBg={
                (studentsQuery.data?.churnRate ?? 0) > 10
                  ? "bg-red-500/10"
                  : "bg-muted"
              }
            />
            <MiniKPI
              label="Taux closing"
              value={`${salesQuery.data?.globalClosingRate ?? 0}%`}
              icon={Target}
              color="text-[#AF0000]"
              accentBg="bg-[#AF0000]/8"
            />
            <MiniKPI
              label="Completion formations"
              value={`${engagementQuery.data?.formationCompletionRate ?? 0}%`}
              icon={GraduationCap}
              color="text-amber-600"
              accentBg="bg-amber-500/10"
            />
          </>
        )}
      </div>

      {/* ─── Charts row: Revenue evolution + Channel distribution ─── */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Revenue evolution (2 cols) */}
        <ChartCard className="lg:col-span-2">
          <SectionHeader
            icon={BarChart3}
            label="Evolution CA"
            extra={
              revenueQuery.data && (
                <span className="text-xl font-bold text-foreground tracking-tight tabular-nums">
                  {formatCurrency(
                    revenueQuery.data.revenueByMonth.reduce(
                      (s, m) => s + m.revenue,
                      0,
                    ),
                  )}
                </span>
              )
            }
          />
          <p className="text-[11px] text-muted-foreground/60 -mt-4 mb-4 ml-6">
            6 derniers mois
          </p>
          <div className="h-64">
            {revenueQuery.isLoading ? (
              <div className="h-full bg-zinc-50 rounded-xl animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueQuery.data?.revenueByMonth ?? []}>
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
                        stopColor="#AF0000"
                        stopOpacity={0.15}
                      />
                      <stop offset="100%" stopColor="#AF0000" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#a1a1aa", fontSize: 11 }}
                    dy={8}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#a1a1aa", fontSize: 11 }}
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value: number | undefined) =>
                      value != null ? [formatCurrency(value), "CA"] : ["\u2014"]
                    }
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#AF0000"
                    strokeWidth={2.5}
                    fill="url(#adminRevGrad)"
                    dot={false}
                    activeDot={{
                      r: 5,
                      fill: "#AF0000",
                      stroke: "#fff",
                      strokeWidth: 2.5,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </ChartCard>

        {/* Channel distribution (1 col) — from student details */}
        <ChartCard>
          <SectionHeader icon={PieChartIcon} label="CA par canal" />
          {studentsQuery.isLoading ? (
            <div className="h-48 bg-zinc-50 rounded-xl animate-pulse" />
          ) : !studentsQuery.data?.revenueByChannel.length ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">
              Aucune donnee
            </div>
          ) : (
            <>
              <div className="w-44 h-44 mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={studentsQuery.data.revenueByChannel}
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="revenue"
                      nameKey="channel"
                      stroke="none"
                    >
                      {studentsQuery.data.revenueByChannel.map((_, i) => (
                        <Cell
                          key={i}
                          fill={CHANNEL_COLORS[i % CHANNEL_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(value: number | undefined) =>
                        value != null ? [formatCurrency(value)] : ["\u2014"]
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-5 space-y-2">
                {studentsQuery.data.revenueByChannel.map((item, i) => (
                  <div
                    key={item.channel}
                    className="flex items-center justify-between text-xs group/legend"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="size-2.5 rounded-full ring-2 ring-white shadow-sm"
                        style={{
                          backgroundColor:
                            CHANNEL_COLORS[i % CHANNEL_COLORS.length],
                        }}
                      />
                      <span className="text-foreground font-medium group-hover/legend:text-foreground/80 transition-colors">
                        {item.channel}
                      </span>
                    </div>
                    <span className="font-mono text-muted-foreground/70 tabular-nums font-semibold">
                      {item.percent}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </ChartCard>
      </motion.div>

      {/* ─── Cash & Revenue details ─── */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        {revenueQuery.isLoading || engagementQuery.isLoading ? (
          Array.from({ length: 3 }).map((_, i) => <MiniStatSkeleton key={i} />)
        ) : (
          <>
            <CashCard
              label="Cash encaisse"
              value={formatCurrency(revenueQuery.data?.cashCollected ?? 0)}
              icon={DollarSign}
              color="text-emerald-600"
              accentBg="bg-emerald-500/10"
            />
            <CashCard
              label="Cash facture"
              value={formatCurrency(revenueQuery.data?.cashInvoiced ?? 0)}
              icon={Receipt}
              color="text-[#AF0000]"
              accentBg="bg-[#AF0000]/8"
            />
            <CashCard
              label="Check-ins semaine"
              value={String(engagementQuery.data?.weeklyCheckins ?? 0)}
              icon={CalendarCheck}
              color="text-blue-600"
              accentBg="bg-blue-500/10"
            />
          </>
        )}
      </motion.div>

      {/* ─── Revenue by quarter ─── */}
      {revenueQuery.data && revenueQuery.data.revenueByQuarter.length > 0 && (
        <motion.div variants={staggerItem}>
          <ChartCard>
            <SectionHeader icon={Percent} label="CA par trimestre" />
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueQuery.data.revenueByQuarter}>
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#AF0000" stopOpacity={1} />
                      <stop
                        offset="100%"
                        stopColor="#DC2626"
                        stopOpacity={0.7}
                      />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="quarter"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#a1a1aa", fontSize: 11 }}
                    dy={4}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#a1a1aa", fontSize: 11 }}
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    formatter={(value: number | undefined) =>
                      value != null ? [formatCurrency(value), "CA"] : ["\u2014"]
                    }
                  />
                  <Bar
                    dataKey="revenue"
                    fill="url(#barGrad)"
                    radius={[8, 8, 0, 0]}
                    maxBarSize={56}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </motion.div>
      )}

      {/* ─── Rapport IA periodique ─── */}
      <motion.div variants={staggerItem}>
        <AiPeriodicReport />
      </motion.div>

      {/* ─── Activity Heatmap + Period Comparison ─── */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <ActivityHeatmap />
        <PeriodComparison />
      </motion.div>

      {/* ─── LTV Ranking ─── */}
      <motion.div variants={staggerItem}>
        <LTVRanking />
      </motion.div>

      {/* ─── KPI Goals + Funnel ─── */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <KpiGoalsWidget />
        <ConversionFunnel />
      </motion.div>

      {/* ─── Bottom: Activity feed + Coach leaderboard ─── */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        <div className="lg:col-span-2">
          <ActivityFeed />
        </div>
        <ChartCard>
          <SectionHeader icon={Crown} label="Leaderboard coaches" />
          {coachesQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-zinc-50 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : !coachesQuery.data?.coachLeaderboard.length ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucun coach
            </p>
          ) : (
            <div className="space-y-1">
              {coachesQuery.data.coachLeaderboard.map((coach, i) => (
                <div
                  key={coach.id ?? `coach-${i}`}
                  className={cn(
                    "flex items-center gap-3 p-2.5 rounded-xl transition-all duration-200 hover:bg-zinc-50",
                    i === 0 && "bg-amber-50/50",
                  )}
                >
                  <span
                    className={cn(
                      "text-xs w-6 text-center font-mono tabular-nums font-bold rounded-lg py-0.5",
                      i === 0
                        ? "text-amber-700 bg-amber-100"
                        : i === 1
                          ? "text-zinc-500 bg-muted"
                          : i === 2
                            ? "text-orange-600 bg-orange-50"
                            : "text-muted-foreground",
                    )}
                  >
                    {i + 1}
                  </span>
                  {coach.avatar ? (
                    <Image
                      src={coach.avatar}
                      alt=""
                      width={36}
                      height={36}
                      className="size-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                    />
                  ) : (
                    <div className="size-9 rounded-full bg-primary/5 flex items-center justify-center text-xs text-primary font-bold ring-2 ring-white shadow-sm">
                      {coach.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {coach.name}
                      </p>
                      <span
                        className={cn(
                          "text-[10px] font-bold px-1.5 py-0.5 rounded-full",
                          coach.score >= 70
                            ? "bg-emerald-100 text-emerald-700"
                            : coach.score >= 40
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700",
                        )}
                      >
                        {coach.score}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/70">
                      {coach.students} eleve{coach.students !== 1 ? "s" : ""}
                      {coach.avgHealth > 0 && ` · ${coach.avgHealth}% sante`}
                      {coach.sessionsMonth > 0 && ` · ${coach.sessionsMonth} sessions`}
                      {coach.atRisk > 0 && (
                        <span className="text-red-500"> · {coach.atRisk} à risque</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ChartCard>
      </motion.div>
    </div>
  );
}
