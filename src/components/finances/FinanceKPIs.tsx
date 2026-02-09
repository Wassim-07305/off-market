import { TrendingUp, Repeat, Receipt, Users, Percent, DollarSign } from 'lucide-react'
import { useFinanceStats } from '@/hooks/useFinances'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency, formatPercent, cn } from '@/lib/utils'

interface FinanceKPIsProps {
  clientId?: string
}

export function FinanceKPIs({ clientId }: FinanceKPIsProps) {
  const { data: stats, isLoading } = useFinanceStats(clientId)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
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

  const kpis = [
    {
      label: 'CA total',
      value: formatCurrency(stats.ca),
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'MRR',
      value: formatCurrency(stats.récurrent),
      icon: <DollarSign className="h-5 w-5" />,
      color: 'text-violet-600',
      bgColor: 'bg-violet-500/10',
    },
    {
      label: 'Récurrent total',
      value: formatCurrency(stats.récurrent),
      icon: <Repeat className="h-5 w-5" />,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Charges totales',
      value: formatCurrency(stats.charges),
      icon: <Receipt className="h-5 w-5" />,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Prestataires total',
      value: formatCurrency(stats.prestataires),
      icon: <Users className="h-5 w-5" />,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
    {
      label: 'Marge %',
      value: formatPercent(stats.marge),
      icon: <Percent className="h-5 w-5" />,
      color: stats.marge > 0 ? 'text-success' : stats.marge < 0 ? 'text-destructive' : 'text-muted-foreground',
      bgColor: stats.marge > 0 ? 'bg-success/10' : stats.marge < 0 ? 'bg-destructive/10' : 'bg-muted',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
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
