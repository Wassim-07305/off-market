import { cn } from '@/lib/utils'

interface HealthScoreProps {
  score: number // 0-100
  size?: number
}

export function HealthScore({ score, size = 80 }: HealthScoreProps) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  const color =
    score >= 70
      ? 'text-emerald-500'
      : score >= 40
        ? 'text-amber-500'
        : 'text-red-500'

  const bgColor =
    score >= 70
      ? 'stroke-emerald-100'
      : score >= 40
        ? 'stroke-amber-100'
        : 'stroke-red-100'

  const label =
    score >= 70
      ? 'Bon'
      : score >= 40
        ? 'Moyen'
        : 'Faible'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={6}
            className={bgColor}
          />
          {/* Score arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={cn('transition-all duration-700', color.replace('text-', 'stroke-'))}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('text-lg font-bold', color)}>{score}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
    </div>
  )
}
