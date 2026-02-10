import { cn } from '@/lib/utils'

interface ProgressBarProps {
  completed: number
  total: number
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export function ProgressBar({ completed, total, className, showLabel = true, size = 'md' }: ProgressBarProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('flex-1 rounded-full bg-muted overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2')}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            percentage === 100 ? 'bg-green-500' : 'bg-primary'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className={cn('shrink-0 font-medium', size === 'sm' ? 'text-[10px]' : 'text-xs', 'text-muted-foreground')}>
          {completed}/{total}
        </span>
      )}
    </div>
  )
}
