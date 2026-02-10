import { useState } from 'react'
import { DollarSign, Phone, TrendingUp, MessageSquare, AlertTriangle, Users, Target } from 'lucide-react'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import { useLeadStats } from '@/hooks/useLeads'
import { useSetterStats } from '@/hooks/useSetterActivities'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { GreetingHeader } from '@/components/dashboard/GreetingHeader'
import { UrgentActions } from '@/components/dashboard/UrgentActions'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { MiniLeaderboard } from '@/components/dashboard/MiniLeaderboard'
import { RevenueChart } from '@/components/dashboard/RevenueChart'
import { LeadsChart } from '@/components/dashboard/LeadsChart'
import { SetterActivityChart } from '@/components/dashboard/SetterActivityChart'
import { cn } from '@/lib/utils'
import type { TimePeriod } from '@/components/shared/TimeFilter'

function computeTrend(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border/40 bg-white p-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-11 w-11 rounded-xl" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="mt-4 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-7 w-32" />
          </div>
          <Skeleton className="mt-2 h-3 w-28" />
        </div>
      ))}
    </div>
  )
}

// ─── Eleve Dashboard ───
function EleveDashboard() {
  const { user } = useAuth()
  const userId = user?.id
  const { data: leadStats, isLoading: leadLoading } = useLeadStats()
  const { data: activityStats, isLoading: activityLoading } = useSetterStats(userId)

  const isLoading = leadLoading || activityLoading

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="mt-3 h-4 w-24" />
              <Skeleton className="mt-2 h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const kpis = [
    {
      title: 'Mes Leads',
      value: String(leadStats?.total ?? 0),
      icon: Users,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'En Discussion',
      value: String(leadStats?.en_discussion ?? 0),
      icon: MessageSquare,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Calls Planifies',
      value: String(leadStats?.call_planifie ?? 0),
      icon: Phone,
      color: 'bg-amber-100 text-amber-700',
    },
    {
      title: 'Messages / semaine',
      value: String(activityStats?.messages_this_week ?? 0),
      icon: Target,
      color: 'bg-emerald-100 text-emerald-700',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <CardContent className="p-5">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', kpi.color)}>
              <kpi.icon className="h-5 w-5" />
            </div>
            <div className="mt-3">
              <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{kpi.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ─── Admin Dashboard ───
function AdminDashboard() {
  const { data: stats, isLoading } = useDashboardStats()

  const caTrend = stats
    ? computeTrend(stats.ca_total_this_month, stats.ca_total_prev_month)
    : 0
  const callsTrend = stats
    ? computeTrend(stats.nb_calls_this_month, stats.nb_calls_prev_month)
    : 0
  const closingTrend = stats
    ? computeTrend(stats.taux_closing, stats.taux_closing_prev_month)
    : 0
  const messagesTrend = stats
    ? computeTrend(stats.messages_sent_this_month, stats.messages_sent_prev_month)
    : 0

  const showClosingAlert = stats && stats.taux_closing < 30

  return (
    <>
      {/* KPI Cards */}
      {isLoading ? (
        <StatsCardsSkeleton />
      ) : stats ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="CA Total Close"
            value={formatCurrency(stats.ca_total)}
            icon={DollarSign}
            trend={caTrend}
            trendLabel="vs mois precedent"
            accent="emerald"
            index={0}
          />
          <StatsCard
            title="Nombre de Calls"
            value={String(stats.nb_calls)}
            icon={Phone}
            trend={callsTrend}
            trendLabel="vs mois precedent"
            accent="blue"
            index={1}
          />
          <StatsCard
            title="Taux de Closing"
            value={formatPercent(stats.taux_closing)}
            icon={TrendingUp}
            trend={closingTrend}
            trendLabel="vs mois precedent"
            accent="red"
            index={2}
          />
          <StatsCard
            title="Messages Envoyes"
            value={String(stats.messages_sent)}
            icon={MessageSquare}
            trend={messagesTrend}
            trendLabel="vs mois precedent"
            accent="amber"
            index={3}
          />
        </div>
      ) : null}

      {/* Alert: low closing rate */}
      {showClosingAlert && (
        <div className="flex items-center gap-3 rounded-xl bg-destructive/10 px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-medium text-destructive">
              Taux de closing bas
            </p>
            <p className="text-xs text-destructive/80">
              Votre taux de closing est actuellement de {formatPercent(stats!.taux_closing)}.
              Un taux inferieur a 30% necessite une attention particuliere.
            </p>
          </div>
        </div>
      )}

      {/* Urgent Actions + Leaderboard */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UrgentActions />
        </div>
        <MiniLeaderboard />
      </div>

      {/* Charts: Revenue & Leads side by side */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <RevenueChart />
        <LeadsChart />
      </div>

      {/* Setter Activity Chart */}
      <SetterActivityChart />

      {/* Recent Activity */}
      <RecentActivity />
    </>
  )
}

// ─── Main Dashboard ───
export default function DashboardPage() {
  const [period, setPeriod] = useState<TimePeriod>('month')
  const { isEleve } = useRole()

  return (
    <div className="space-y-6">
      <GreetingHeader period={period} onPeriodChange={setPeriod} />

      {isEleve ? (
        <>
          <EleveDashboard />
          <SetterActivityChart />
        </>
      ) : (
        <AdminDashboard />
      )}
    </div>
  )
}
