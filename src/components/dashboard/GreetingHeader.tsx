import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useAuth } from '@/hooks/useAuth'
import { TimeFilter } from '@/components/shared/TimeFilter'
import type { TimePeriod } from '@/components/shared/TimeFilter'

interface GreetingHeaderProps {
  period: TimePeriod
  onPeriodChange: (period: TimePeriod) => void
}

export function GreetingHeader({ period, onPeriodChange }: GreetingHeaderProps) {
  const { profile } = useAuth()
  const now = new Date()
  const hour = now.getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Utilisateur'
  const today = format(now, "EEEE d MMMM yyyy", { locale: fr })

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {greeting}, {firstName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground capitalize">
          {today}
        </p>
      </div>
      <TimeFilter value={period} onChange={onPeriodChange} />
    </div>
  )
}
