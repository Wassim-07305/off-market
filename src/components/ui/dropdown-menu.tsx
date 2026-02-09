import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

interface DropdownMenuProps {
  trigger: ReactNode
  children: ReactNode
  align?: 'left' | 'right'
  className?: string
}

function DropdownMenu({ trigger, children, align = 'left', className }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: align === 'right' ? rect.right + window.scrollX : rect.left + window.scrollX,
        width: rect.width,
      })
    }
  }, [align])

  const handleToggle = useCallback(() => {
    if (!open) updatePosition()
    setOpen((prev) => !prev)
  }, [open, updatePosition])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node) &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  return (
    <>
      <div ref={triggerRef} className="inline-flex" onClick={handleToggle}>
        {trigger}
      </div>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            className={cn(
              'fixed z-50 min-w-[180px] overflow-hidden rounded-md border border-border bg-background py-1 shadow-lg',
              'animate-in fade-in-0 zoom-in-95',
              className
            )}
            style={{
              top: position.top,
              left: align === 'right' ? undefined : position.left,
              right: align === 'right' ? window.innerWidth - position.left : undefined,
            }}
          >
            <DropdownMenuContext.Provider value={{ close: () => setOpen(false) }}>
              {children}
            </DropdownMenuContext.Provider>
          </div>,
          document.body
        )}
    </>
  )
}

// Context for closing menu from items
import { createContext, useContext } from 'react'

interface DropdownMenuContextValue {
  close: () => void
}

const DropdownMenuContext = createContext<DropdownMenuContextValue>({
  close: () => {},
})

interface DropdownMenuItemProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  destructive?: boolean
  icon?: ReactNode
  className?: string
}

function DropdownMenuItem({
  children,
  onClick,
  disabled = false,
  destructive = false,
  icon,
  className,
}: DropdownMenuItemProps) {
  const { close } = useContext(DropdownMenuContext)

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        onClick?.()
        close()
      }}
      className={cn(
        'flex w-full items-center gap-2 px-3 py-2 text-sm',
        'transition-colors duration-150',
        'cursor-pointer',
        'disabled:pointer-events-none disabled:opacity-50',
        destructive
          ? 'text-destructive hover:bg-destructive/10'
          : 'text-foreground hover:bg-secondary',
        className
      )}
    >
      {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
      {children}
    </button>
  )
}

function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn('my-1 h-px bg-border', className)} />
}

function DropdownMenuLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('px-3 py-1.5 text-xs font-medium text-muted-foreground', className)}>
      {children}
    </div>
  )
}

export {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
}
export type { DropdownMenuProps, DropdownMenuItemProps }
