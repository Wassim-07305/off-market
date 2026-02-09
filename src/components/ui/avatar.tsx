import { useState } from 'react'
import { cn, getInitials } from '@/lib/utils'

const avatarSizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
} as const

type AvatarSize = keyof typeof avatarSizes

interface AvatarProps {
  src?: string | null
  name: string
  size?: AvatarSize
  className?: string
}

function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const [imageError, setImageError] = useState(false)
  const initials = getInitials(name)

  const showImage = src && !imageError

  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary',
        avatarSizes[size],
        className
      )}
      title={name}
    >
      {showImage ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full rounded-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="select-none">{initials}</span>
      )}
    </div>
  )
}

export { Avatar, avatarSizes }
export type { AvatarProps, AvatarSize }
