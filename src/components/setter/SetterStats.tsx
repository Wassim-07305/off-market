import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { MessageSquare, TrendingUp, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useSetterStats } from '@/hooks/useSetterActivities'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface SetterStatsProps {
  userId?: string
}

export function SetterStats({ userId }: SetterStatsProps) {
  const { data: stats, isLoading } = useSetterStats(userId)

  const chartData = useMemo(() => {
    if (!stats?.daily_data) return []
    return stats.daily_data.map((d) => ({
      date: format(new Date(d.date), 'dd/MM', { locale: fr }),
      messages: d.messages_sent,
    }))
  }, [stats])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-5">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="mt-3 h-4 w-24" />
                <Skeleton className="mt-2 h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-5">
            <Skeleton className="h-[200px] w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  const kpis = [
    {
      title: 'Cette semaine',
      value: String(stats?.messages_this_week ?? 0),
      icon: MessageSquare,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Ce mois',
      value: String(stats?.messages_this_month ?? 0),
      icon: Calendar,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Moyenne quotidienne',
      value: String(stats?.average_daily ?? 0),
      icon: TrendingUp,
      color: 'bg-success/10 text-success',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {kpis.map((kpi) => (
          <Card key={kpi.title}>
            <CardContent className="p-5">
              <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', kpi.color)}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <div className="mt-3">
                <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{kpi.value} messages</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Messages envoyés (14 derniers jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-background, #fff)',
                    border: '1px solid var(--color-border, #e5e7eb)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  labelStyle={{ fontWeight: 600 }}
                />
                <Bar
                  dataKey="messages"
                  name="Messages"
                  fill="var(--color-primary, #3b82f6)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
