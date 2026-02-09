import { useCallback, useEffect, useRef, useState } from 'react'
import { Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InlineEditProps {
  value: string
  onSave: (value: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  textClassName?: string
  disabled?: boolean
  multiline?: boolean
}

function InlineEdit({
  value,
  onSave,
  placeholder = 'Cliquer pour modifier...',
  className,
  inputClassName,
  textClassName,
  disabled = false,
  multiline = false,
}: InlineEditProps) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    setEditValue(value)
  }, [value])

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const handleSave = useCallback(() => {
    const trimmed = editValue.trim()
    if (trimmed !== value) {
      onSave(trimmed)
    }
    setEditing(false)
  }, [editValue, value, onSave])

  const handleCancel = useCallback(() => {
    setEditValue(value)
    setEditing(false)
  }, [value])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !multiline) {
        e.preventDefault()
        handleSave()
      } else if (e.key === 'Enter' && multiline && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        handleSave()
      } else if (e.key === 'Escape') {
        handleCancel()
      }
    },
    [handleSave, handleCancel, multiline]
  )

  if (editing) {
    const sharedProps = {
      value: editValue,
      onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      ) => setEditValue(e.target.value),
      onBlur: handleSave,
      onKeyDown: handleKeyDown,
      className: cn(
        'w-full rounded-md border border-ring bg-background px-2 py-1 text-sm text-foreground',
        'transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
        inputClassName
      ),
    }

    if (multiline) {
      return (
        <textarea
          ref={inputRef as React.RefObject<HTMLTextAreaElement>}
          rows={3}
          {...sharedProps}
        />
      )
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type="text"
        {...sharedProps}
      />
    )
  }

  return (
    <div
      className={cn(
        'group inline-flex items-center gap-1.5',
        !disabled && 'cursor-pointer',
        className
      )}
      onClick={() => {
        if (!disabled) setEditing(true)
      }}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          setEditing(true)
        }
      }}
      role={disabled ? undefined : 'button'}
      tabIndex={disabled ? undefined : 0}
    >
      <span
        className={cn(
          'text-sm',
          !value && 'text-muted-foreground',
          !disabled && 'group-hover:text-primary',
          'transition-colors duration-200',
          textClassName
        )}
      >
        {value || placeholder}
      </span>
      {!disabled && (
        <Pencil className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
      )}
    </div>
  )
}

export { InlineEdit }
export type { InlineEditProps }
