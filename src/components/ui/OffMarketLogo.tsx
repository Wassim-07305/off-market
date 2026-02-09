import { cn } from '@/lib/utils'

interface OffMarketLogoProps {
  size?: number
  showText?: boolean
  className?: string
  textClassName?: string
}

export function OffMarketLogo({ size = 36, showText = false, className, textClassName }: OffMarketLogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        width={size}
        height={size}
        className="shrink-0"
      >
        <defs>
          <linearGradient id="om-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="100%" stopColor="#DC2626" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="7" fill="url(#om-grad)" />
        <text
          x="16"
          y="22"
          textAnchor="middle"
          fill="#fff"
          fontFamily="Inter, system-ui, sans-serif"
          fontWeight="700"
          fontSize="18"
        >
          O
        </text>
      </svg>
      {showText && (
        <span className={cn('text-base font-bold tracking-tight', textClassName)}>
          Off-Market
        </span>
      )}
    </div>
  )
}
