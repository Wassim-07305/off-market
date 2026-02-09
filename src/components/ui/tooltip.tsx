import { useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  delayMs?: number
  className?: string
}

function Tooltip({
  content,
  children,
  side = 'top',
  delayMs = 200,
  className,
}: TooltipProps) {
  const [visible, setVisible] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updatePosition = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      const gap = 6

      switch (side) {
        case 'top':
          setPosition({
            top: rect.top + window.scrollY - gap,
            left: rect.left + window.scrollX + rect.width / 2,
          })
          break
        case 'bottom':
          setPosition({
            top: rect.bottom + window.scrollY + gap,
            left: rect.left + window.scrollX + rect.width / 2,
          })
          break
        case 'left':
          setPosition({
            top: rect.top + window.scrollY + rect.height / 2,
            left: rect.left + window.scrollX - gap,
          })
          break
        case 'right':
          setPosition({
            top: rect.top + window.scrollY + rect.height / 2,
            left: rect.right + window.scrollX + gap,
          })
          break
      }
    }
  }, [side])

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      updatePosition()
      setVisible(true)
    }, delayMs)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setVisible(false)
  }

  const tooltipTransform = {
    top: 'translate(-50%, -100%)',
    bottom: 'translate(-50%, 0)',
    left: 'translate(-100%, -50%)',
    right: 'translate(0, -50%)',
  }

  return (
    <>
      <div
        ref={triggerRef}
        className="inline-flex"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
      >
        {children}
      </div>
      {visible &&
        content &&
        createPortal(
          <div
            role="tooltip"
            className={cn(
              'fixed z-[100] max-w-xs rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background shadow-md',
              'animate-in fade-in-0 zoom-in-95',
              className
            )}
            style={{
              top: position.top,
              left: position.left,
              transform: tooltipTransform[side],
              pointerEvents: 'none',
            }}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  )
}

export { Tooltip }
export type { TooltipProps }
