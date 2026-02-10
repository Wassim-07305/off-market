import { Users, MessageSquare, Phone, Wallet } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useLeadStats } from '@/hooks/useLeads'
import { formatCurrency } from '@/lib/utils'

interface LeadKPIsProps {
  clientId?: string
}

export function LeadKPIs({ clientId }: LeadKPIsProps) {
  const { data: stats, isLoading } = useLeadStats(clientId)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
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
      title: 'Total leads',
      value: String(stats?.total ?? 0),
      icon: Users,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'En discussion',
      value: String(stats?.en_discussion ?? 0),
      icon: MessageSquare,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Calls planifiés',
      value: String(stats?.call_planifie ?? 0),
      icon: Phone,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      title: 'CA Contracté total',
      value: formatCurrency(stats?.ca_contracté ?? 0),
      icon: Wallet,
      color: 'bg-success/10 text-success',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {kpis.map((kpi) => (
        <Card key={kpi.title}>
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${kpi.color}`}>
                <kpi.icon className="h-6 w-6" />
              </div>
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
