import { DollarSign, PhoneCall, Target } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCloserCallStats } from '@/hooks/useCloserCalls'
import { formatCurrency, formatPercent, cn } from '@/lib/utils'

interface CloserCallKPIsProps {
  clientId?: string
}

export function CloserCallKPIs({ clientId }: CloserCallKPIsProps) {
  const { data: stats, isLoading } = useCloserCallStats({
    client_id: clientId,
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="mb-3 h-12 w-12 rounded-2xl" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const kpis = [
    {
      title: 'CA close total',
      value: formatCurrency(stats?.ca_total ?? 0),
      icon: DollarSign,
      color: 'bg-success/10 text-success',
    },
    {
      title: 'Calls closes',
      value: String(stats?.closé ?? 0),
      icon: PhoneCall,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Taux de closing',
      value: formatPercent(stats?.taux_closing ?? 0),
      icon: Target,
      color: 'bg-warning/10 text-warning',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <div className="p-6">
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl', kpi.color)}>
              <kpi.icon className="h-6 w-6" />
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
              <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{kpi.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
