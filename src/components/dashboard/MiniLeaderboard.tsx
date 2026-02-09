import { useQuery } from '@tanstack/react-query'
import { Trophy } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { startOfMonth, format } from 'date-fns'

const rankColors = ['text-yellow-500', 'text-slate-400', 'text-amber-600']
const rankBgs = ['bg-yellow-50', 'bg-slate-50', 'bg-amber-50']

export function MiniLeaderboard() {
  const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd')

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['leaderboard', monthStart],
    queryFn: async () => {
      // Get setter activities this month grouped by user
      const { data: activities, error } = await supabase
        .from('setter_activities')
        .select('user_id, messages_sent')
        .gte('date', monthStart)

      if (error) throw error

      // Aggregate by user
      const userTotals: Record<string, number> = {}
      for (const a of activities) {
        userTotals[a.user_id] = (userTotals[a.user_id] ?? 0) + a.messages_sent
      }

      // Get profiles for top users
      const sorted = Object.entries(userTotals)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)

      if (sorted.length === 0) return []

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', sorted.map(([id]) => id))

      const profileMap = new Map(profiles?.map(p => [p.id, p]) ?? [])

      return sorted.map(([userId, total]) => ({
        userId,
        name: profileMap.get(userId)?.full_name ?? 'Utilisateur',
        avatarUrl: profileMap.get(userId)?.avatar_url,
        total,
      }))
    },
  })

  return (
    <div className="rounded-2xl border border-border/40 bg-white p-5">
      <h3 className="font-semibold text-foreground flex items-center gap-2 mb-4">
        <Trophy className="h-4 w-4 text-yellow-500" />
        Top Messages
      </h3>

      {leaderboard.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4">Aucune donnée ce mois</p>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, i) => (
            <div key={entry.userId} className="flex items-center gap-3">
              <div className={cn('flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold', rankBgs[i], rankColors[i])}>
                {i + 1}
              </div>
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/10 to-violet-400/5 text-[10px] font-semibold text-violet-600">
                {entry.avatarUrl ? (
                  <img src={entry.avatarUrl} alt={entry.name} className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  getInitials(entry.name)
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{entry.name}</p>
              </div>
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {entry.total.toLocaleString('fr-FR')}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
