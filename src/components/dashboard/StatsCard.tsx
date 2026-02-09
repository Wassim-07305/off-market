import type { LucideIcon } from 'lucide-react'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type AccentColor = 'violet' | 'blue' | 'emerald' | 'amber'

const accentConfig: Record<AccentColor, { gradient: string; iconBg: string; iconText: string }> = {
  violet: {
    gradient: 'from-violet-500 to-indigo-500',
    iconBg: 'bg-gradient-to-br from-violet-500/10 to-violet-500/5',
    iconText: 'text-violet-600',
  },
  blue: {
    gradient: 'from-blue-500 to-cyan-500',
    iconBg: 'bg-gradient-to-br from-blue-500/10 to-blue-500/5',
    iconText: 'text-blue-600',
  },
  emerald: {
    gradient: 'from-emerald-500 to-teal-500',
    iconBg: 'bg-gradient-to-br from-emerald-500/10 to-emerald-500/5',
    iconText: 'text-emerald-600',
  },
  amber: {
    gradient: 'from-amber-500 to-orange-500',
    iconBg: 'bg-gradient-to-br from-amber-500/10 to-amber-500/5',
    iconText: 'text-amber-600',
  },
}

interface StatsCardProps {
  title: string
  value: string
  icon: LucideIcon
  trend: number
  trendLabel: string
  accent?: AccentColor
  index?: number
  subtext?: string
}

export function StatsCard({ title, value, icon: Icon, trend, trendLabel, accent = 'violet', index = 0, subtext }: StatsCardProps) {
  const isPositive = trend >= 0
  const config = accentConfig[accent]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
    >
      <Card className="relative overflow-hidden">
        {/* Accent gradient strip */}
        <div className={cn('absolute top-0 left-0 right-0 h-1 bg-gradient-to-r', config.gradient)} />

        {/* Decorative gradient corner */}
        <div className={cn('absolute top-0 right-0 w-20 h-20 bg-gradient-to-br opacity-[0.07] rounded-bl-[40px]', config.gradient)} />

        <div className="relative p-6">
          <div className="flex items-start justify-between">
            <div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', config.iconBg)}>
              <Icon className={cn('h-5 w-5', config.iconText)} />
            </div>
            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
                isPositive
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-700'
              )}
            >
              {isPositive ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">{value}</p>
            {subtext && (
              <p className="mt-0.5 text-xs text-muted-foreground">{subtext}</p>
            )}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{trendLabel}</p>
        </div>
      </Card>
    </motion.div>
  )
}
