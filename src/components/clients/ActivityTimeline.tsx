import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Phone, MessageSquare, DollarSign, FileText, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

interface ActivityTimelineProps {
  clientId: string
}

interface ActivityItem {
  id: string
  type: 'call' | 'lead' | 'finance' | 'content' | 'setter'
  title: string
  date: string
}

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  call: { icon: Phone, color: 'text-blue-600', bg: 'bg-blue-100' },
  lead: { icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  finance: { icon: DollarSign, color: 'text-violet-600', bg: 'bg-violet-100' },
  content: { icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100' },
  setter: { icon: MessageSquare, color: 'text-pink-600', bg: 'bg-pink-100' },
}

export function ActivityTimeline({ clientId }: ActivityTimelineProps) {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['client-activity', clientId],
    queryFn: async () => {
      const items: ActivityItem[] = []

      // Fetch calls
      const { data: calls } = await supabase
        .from('call_calendar')
        .select('id, date, type, status')
        .eq('client_id', clientId)
        .order('date', { ascending: false })
        .limit(5)
      calls?.forEach((c) =>
        items.push({
          id: `call-${c.id}`,
          type: 'call',
          title: `Call ${c.type} — ${c.status}`,
          date: c.date,
        })
      )

      // Fetch leads
      const { data: leads } = await supabase
        .from('leads')
        .select('id, name, client_status, created_at')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(5)
      leads?.forEach((l) =>
        items.push({
          id: `lead-${l.id}`,
          type: 'lead',
          title: `Lead ${l.name} — ${l.client_status}`,
          date: l.created_at,
        })
      )

      // Fetch financial entries
      const { data: entries } = await supabase
        .from('financial_entries')
        .select('id, label, type, date')
        .eq('client_id', clientId)
        .order('date', { ascending: false })
        .limit(5)
      entries?.forEach((e) =>
        items.push({
          id: `fin-${e.id}`,
          type: 'finance',
          title: `${e.label} (${e.type})`,
          date: e.date,
        })
      )

      // Fetch social content
      const { data: content } = await supabase
        .from('social_content')
        .select('id, title, status, created_at')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
        .limit(5)
      content?.forEach((c) =>
        items.push({
          id: `content-${c.id}`,
          type: 'content',
          title: `${c.title} — ${c.status}`,
          date: c.created_at,
        })
      )

      // Sort by date descending and take top 10
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      return items.slice(0, 10)
    },
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!activities || activities.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        Aucune activité récente
      </p>
    )
  }

  return (
    <div className="relative space-y-0">
      {activities.map((item, idx) => {
        const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.call
        const Icon = config.icon
        const isLast = idx === activities.length - 1

        return (
          <div key={item.id} className="relative flex gap-3 pb-4">
            {/* Timeline line */}
            {!isLast && (
              <div className="absolute left-4 top-8 h-full w-px bg-border/60" />
            )}
            {/* Icon */}
            <div className={cn('relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full', config.bg)}>
              <Icon className={cn('h-3.5 w-3.5', config.color)} />
            </div>
            {/* Content */}
            <div className="flex-1 pt-0.5">
              <p className="text-sm text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(item.date), { addSuffix: true, locale: fr })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
