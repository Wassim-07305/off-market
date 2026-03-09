import { useState, useMemo } from 'react'
import {
  BarChart3,
  TrendingUp,
  Users,
  Target,
  DollarSign,
  Phone,
  Calendar,
  Download,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useLeads } from '@/hooks/useLeads'
import type { LeadWithRelations } from '@/types/database'
import { useCallCalendar } from '@/hooks/useCallCalendar'
import { useDashboardStats } from '@/hooks/useDashboardStats'
import { useRole } from '@/hooks/useRole'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { TimePeriod } from '@/components/shared/TimeFilter'
import { TimeFilter } from '@/components/shared/TimeFilter'

const COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

const STATUS_COLORS: Record<string, string> = {
  premier_message: '#94a3b8',
  en_discussion: '#3b82f6',
  qualifie: '#6366f1',
  loom_envoye: '#8b5cf6',
  call_planifie: '#f59e0b',
  close: '#10b981',
  perdu: '#ef4444',
}

const STATUS_LABELS: Record<string, string> = {
  premier_message: 'Premier message',
  en_discussion: 'En discussion',
  qualifie: 'Qualifie',
  loom_envoye: 'Loom envoye',
  call_planifie: 'Call planifie',
  close: 'Close',
  perdu: 'Perdu',
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<TimePeriod>('month')
  const { isAdmin } = useRole()
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: leadsData, isLoading: leadsLoading } = useLeads()
  const leads = leadsData?.data ?? []
  const { data: calls, isLoading: callsLoading } = useCallCalendar()

  const isLoading = statsLoading || leadsLoading || callsLoading

  // Leads by status
  const leadsByStatus = useMemo(() => {
    if (leads.length === 0) return []
    const counts: Record<string, number> = {}
    leads.forEach((lead: LeadWithRelations) => {
      counts[lead.status] = (counts[lead.status] || 0) + 1
    })
    return Object.entries(counts).map(([status, count]) => ({
      name: STATUS_LABELS[status] || status,
      value: count,
      color: STATUS_COLORS[status] || '#94a3b8',
    }))
  }, [leads])

  // CA by source
  const caBySource = useMemo(() => {
    if (leads.length === 0) return []
    const totals: Record<string, number> = {}
    leads.forEach((lead: LeadWithRelations) => {
      const source = lead.source || 'autre'
      totals[source] = (totals[source] || 0) + Number(lead.ca_contracté || 0)
    })
    return Object.entries(totals)
      .map(([source, total]) => ({
        name: source.charAt(0).toUpperCase() + source.slice(1),
        value: total,
      }))
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [leads])

  // Calls by type
  const callsByType = useMemo(() => {
    if (!calls) return []
    const counts: Record<string, number> = {}
    calls.forEach((call) => {
      counts[call.type] = (counts[call.type] || 0) + 1
    })
    return Object.entries(counts).map(([type, count], index) => ({
      name: type.charAt(0).toUpperCase() + type.slice(1),
      value: count,
      color: COLORS[index % COLORS.length],
    }))
  }, [calls])

  // Monthly revenue trend (simulated from leads)
  const monthlyRevenue = useMemo(() => {
    if (leads.length === 0) return []
    const months: Record<string, number> = {}
    const now = new Date()

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const key = date.toLocaleDateString('fr-FR', { month: 'short' })
      months[key] = 0
    }

    leads.forEach((lead: LeadWithRelations) => {
      if (lead.status === 'close' && lead.ca_contracté > 0) {
        const date = new Date(lead.created_at)
        const key = date.toLocaleDateString('fr-FR', { month: 'short' })
        if (months[key] !== undefined) {
          months[key] += Number(lead.ca_contracté)
        }
      }
    })

    return Object.entries(months).map(([month, revenue]) => ({
      month,
      revenue,
    }))
  }, [leads])

  // Conversion funnel
  const conversionFunnel = useMemo(() => {
    if (leads.length === 0) return []
    const total = leads.length
    const enDiscussion = leads.filter((l: LeadWithRelations) =>
      ['en_discussion', 'qualifie', 'loom_envoye', 'call_planifie', 'close'].includes(l.status)
    ).length
    const qualifies = leads.filter((l: LeadWithRelations) =>
      ['qualifie', 'loom_envoye', 'call_planifie', 'close'].includes(l.status)
    ).length
    const callPlanifie = leads.filter((l: LeadWithRelations) =>
      ['call_planifie', 'close'].includes(l.status)
    ).length
    const closes = leads.filter((l: LeadWithRelations) => l.status === 'close').length

    return [
      { name: 'Total Leads', value: total, fill: '#94a3b8' },
      { name: 'En discussion', value: enDiscussion, fill: '#3b82f6' },
      { name: 'Qualifies', value: qualifies, fill: '#6366f1' },
      { name: 'Call planifie', value: callPlanifie, fill: '#f59e0b' },
      { name: 'Closes', value: closes, fill: '#10b981' },
    ]
  }, [leads])

  const handleExport = () => {
    const data = {
      stats,
      leadsByStatus,
      caBySource,
      monthlyRevenue,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!isAdmin) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h2 className="mt-4 text-lg font-semibold text-foreground">Acces restreint</h2>
          <p className="text-sm text-muted-foreground">
            Les analytics sont reservees aux administrateurs.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Vue d'ensemble de vos performances
          </p>
        </div>
        <div className="flex items-center gap-3">
          <TimeFilter value={period} onChange={setPeriod} />
          <Button
            variant="secondary"
            onClick={handleExport}
            icon={<Download className="h-4 w-4" />}
          >
            Exporter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="mt-3 h-4 w-20" />
                <Skeleton className="mt-2 h-6 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KPICard
            title="CA Total"
            value={formatCurrency(stats?.ca_total ?? 0)}
            icon={DollarSign}
            trend={stats ? ((stats.ca_total_this_month - stats.ca_total_prev_month) / Math.max(stats.ca_total_prev_month, 1)) * 100 : 0}
            color="emerald"
          />
          <KPICard
            title="Leads"
            value={String(leads.length)}
            icon={Users}
            color="blue"
          />
          <KPICard
            title="Taux Closing"
            value={formatPercent(stats?.taux_closing ?? 0)}
            icon={Target}
            trend={stats ? stats.taux_closing - stats.taux_closing_prev_month : 0}
            color="amber"
          />
          <KPICard
            title="Calls"
            value={String(calls?.length ?? 0)}
            icon={Phone}
            color="purple"
          />
        </div>
      )}

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              Evolution du CA
            </CardTitle>
            <CardDescription>Chiffre d'affaires des 6 derniers mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), 'CA']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Leads by Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Leads par statut
            </CardTitle>
            <CardDescription>Repartition actuelle du pipeline</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadsByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {leadsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [value, 'Leads']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend
                    layout="vertical"
                    verticalAlign="middle"
                    align="right"
                    wrapperStyle={{ fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Funnel de conversion
            </CardTitle>
            <CardDescription>De lead a client</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conversionFunnel} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis type="number" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                    width={100}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {conversionFunnel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* CA by Source */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-amber-600" />
              CA par source
            </CardTitle>
            <CardDescription>Origine des revenus</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={caBySource}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    stroke="#9ca3af"
                    tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value)), 'CA']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="value" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calls by Type */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-red-600" />
            Calls par type
          </CardTitle>
          <CardDescription>Repartition des differents types de calls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={callsByType}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                >
                  {callsByType.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  color,
}: {
  title: string
  value: string
  icon: React.ElementType
  trend?: number
  color: 'emerald' | 'blue' | 'amber' | 'purple'
}) {
  const colorClasses = {
    emerald: 'bg-emerald-100 text-emerald-700 ring-emerald-100',
    blue: 'bg-blue-100 text-blue-700 ring-blue-100',
    amber: 'bg-amber-100 text-amber-700 ring-amber-100',
    purple: 'bg-purple-100 text-purple-700 ring-purple-100',
  }

  return (
    <Card>
      <CardContent className="p-5">
        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-lg ring-1 ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <p className="mt-3 text-sm font-medium text-muted-foreground">{title}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {trend !== undefined && (
            <span
              className={`text-xs font-medium ${
                trend >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
