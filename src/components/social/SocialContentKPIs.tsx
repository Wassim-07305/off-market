import { FileText, CheckCircle, Clock, ThumbsUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useSocialContentStats } from '@/hooks/useSocialContent'
import { cn } from '@/lib/utils'

interface SocialContentKPIsProps {
  clientId?: string
}

export function SocialContentKPIs({ clientId }: SocialContentKPIsProps) {
  const { data: stats, isLoading } = useSocialContentStats(clientId)

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      title: 'Total contenus',
      value: String(stats?.total ?? 0),
      icon: FileText,
      color: 'bg-primary/10 text-primary',
    },
    {
      title: 'Publiés',
      value: String(stats?.publie ?? 0),
      icon: CheckCircle,
      color: 'bg-success/10 text-success',
    },
    {
      title: 'En cours',
      value: String(stats?.enCours ?? 0),
      icon: Clock,
      color: 'bg-blue-100 text-blue-700',
    },
    {
      title: 'Validés',
      value: String(stats?.valide ?? 0),
      icon: ThumbsUp,
      color: 'bg-warning/10 text-warning',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
