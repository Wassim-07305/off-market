import { Phone, CheckCircle, TrendingUp, DollarSign } from 'lucide-react'
import { useCloserCallStats } from '@/hooks/useCloserCalls'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatPercent, cn } from '@/lib/utils'

interface CloserCallKPIsProps {
  clientId?: string
}

export function CloserCallKPIs({ clientId }: CloserCallKPIsProps) {
  const { data: stats, isLoading } = useCloserCallStats(clientId)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <div className="p-6">
              <Skeleton className="mb-3 h-12 w-12 rounded-2xl" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-8 w-32" />
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const kpis = [
    {
      label: 'Total appels',
      value: String(stats.total),
      icon: <Phone className="h-5 w-5" />,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Closés',
      value: String(stats.closed),
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      label: 'Taux de closing',
      value: formatPercent(stats.tauxClosing),
      icon: <TrendingUp className="h-5 w-5" />,
      color: stats.tauxClosing >= 50 ? 'text-success' : stats.tauxClosing >= 25 ? 'text-warning' : 'text-destructive',
      bgColor: stats.tauxClosing >= 50 ? 'bg-success/10' : stats.tauxClosing >= 25 ? 'bg-warning/10' : 'bg-destructive/10',
    },
    {
      label: 'CA Généré',
      value: formatCurrency(stats.caGenere),
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
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
