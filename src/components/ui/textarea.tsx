import { forwardRef, useCallback, useEffect, useRef } from 'react'
import type { TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  autoGrow?: boolean
  wrapperClassName?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      autoGrow = false,
      wrapperClassName,
      id,
      onChange,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null)
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

    const adjustHeight = useCallback(() => {
      const textarea = internalRef.current
      if (textarea && autoGrow) {
        textarea.style.height = 'auto'
        textarea.style.height = `${textarea.scrollHeight}px`
      }
    }, [autoGrow])

    useEffect(() => {
      adjustHeight()
    }, [adjustHeight, props.value])

    const setRefs = useCallback(
      (node: HTMLTextAreaElement | null) => {
        internalRef.current = node
        if (typeof ref === 'function') {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref]
    )

    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <textarea
          ref={setRefs}
          id={textareaId}
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground',
            'transition-all duration-200',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
            autoGrow && 'resize-none overflow-hidden',
            error && 'border-destructive focus:ring-destructive',
            className
          )}
          onChange={(e) => {
            onChange?.(e)
            adjustHeight()
          }}
          {...props}
        />
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }
export type { TextareaProps }
