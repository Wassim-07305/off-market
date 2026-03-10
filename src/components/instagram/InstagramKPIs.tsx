import { Instagram, Users, Image, TrendingUp } from 'lucide-react'
import { useInstagramStats } from '@/hooks/useInstagram'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPercent, cn } from '@/lib/utils'

interface InstagramKPIsProps {
  clientId?: string
}

export function InstagramKPIs({ clientId }: InstagramKPIsProps) {
  const { data: stats, isLoading } = useInstagramStats(clientId)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="mb-3 h-12 w-12 rounded-2xl" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-8 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const numberFormatter = new Intl.NumberFormat('fr-FR')

  const kpis = [
    {
      label: 'Comptes',
      value: numberFormatter.format(stats.nbComptes),
      icon: <Instagram className="h-5 w-5" />,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Abonnés total',
      value: numberFormatter.format(stats.totalFollowers),
      icon: <Users className="h-5 w-5" />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Publications',
      value: numberFormatter.format(stats.totalMedia),
      icon: <Image className="h-5 w-5" />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
    },
    {
      label: 'Engagement moyen',
      value: formatPercent(stats.avgEngagement),
      icon: <TrendingUp className="h-5 w-5" />,
      color: stats.avgEngagement > 3 ? 'text-success' : stats.avgEngagement > 1 ? 'text-warning' : 'text-muted-foreground',
      bgColor: stats.avgEngagement > 3 ? 'bg-success/10' : stats.avgEngagement > 1 ? 'bg-warning/10' : 'bg-muted',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label}>
          <div className="p-6">
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', kpi.bgColor, kpi.color)}>
              {kpi.icon}
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {kpi.label}
              </p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
                {kpi.value}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
