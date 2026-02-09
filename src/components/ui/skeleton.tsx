import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  /** Width of the skeleton. Can be a Tailwind class or a CSS value. */
  width?: string
  /** Height of the skeleton. Can be a Tailwind class or a CSS value. */
  height?: string
  /** Make the skeleton a circle */
  circle?: boolean
}

function Skeleton({ className, width, height, circle, style, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        circle && 'rounded-full',
        className
      )}
      style={{
        width: width && !width.startsWith('w-') ? width : undefined,
        height: height && !height.startsWith('h-') ? height : undefined,
        ...style,
      }}
      {...props}
    />
  )
}

function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 ? 'w-2/3' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}

function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  }

  return <Skeleton className={cn(sizeClasses[size], 'rounded-full')} />
}

export { Skeleton, SkeletonText, SkeletonAvatar }
export type { SkeletonProps }
