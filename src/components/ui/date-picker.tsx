import { useCallback, useEffect, useRef, useState } from 'react'
import { DayPicker } from 'react-day-picker'
import { fr } from 'date-fns/locale'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  className?: string
  wrapperClassName?: string
}

function DatePicker({
  value,
  onChange,
  placeholder = 'Sélectionner une date',
  label,
  error,
  disabled = false,
  className,
  wrapperClassName,
}: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
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

  const handleSelect = useCallback(
    (date: Date | undefined) => {
      onChange?.(date)
      setOpen(false)
    },
    [onChange]
  )

  return (
    <div className={cn('flex flex-col gap-1.5', wrapperClassName)} ref={containerRef}>
      {label && (
        <span className="text-sm font-medium text-foreground">{label}</span>
      )}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            'flex h-9 w-full items-center gap-2 rounded-md border border-border bg-background px-3 text-sm',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'cursor-pointer',
            !value && 'text-muted-foreground',
            error && 'border-destructive focus:ring-destructive',
            className
          )}
        >
          <CalendarIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="truncate">
            {value ? format(value, 'dd MMM yyyy', { locale: fr }) : placeholder}
          </span>
        </button>

        {open && (
          <div
            className={cn(
              'absolute z-50 mt-1 rounded-md border border-border bg-background p-3 shadow-lg',
              'animate-in fade-in-0 zoom-in-95'
            )}
          >
            <DayPicker
              mode="single"
              selected={value}
              onSelect={handleSelect}
              locale={fr}
              showOutsideDays
              classNames={{
                months: 'flex flex-col',
                month: 'space-y-3',
                month_caption: 'flex items-center justify-center pt-1 text-sm font-medium',
                nav: 'flex items-center justify-between absolute inset-x-0 top-0 px-1',
                button_previous: cn(
                  'h-7 w-7 inline-flex items-center justify-center rounded-md bg-transparent text-muted-foreground',
                  'transition-all duration-200',
                  'hover:bg-secondary hover:text-foreground',
                  'cursor-pointer'
                ),
                button_next: cn(
                  'h-7 w-7 inline-flex items-center justify-center rounded-md bg-transparent text-muted-foreground',
                  'transition-all duration-200',
                  'hover:bg-secondary hover:text-foreground',
                  'cursor-pointer'
                ),
                month_grid: 'w-full border-collapse space-y-1',
                weekdays: 'flex',
                weekday: 'text-muted-foreground rounded-md w-8 font-normal text-[0.8rem] text-center',
                week: 'flex w-full mt-1',
                day: 'text-center text-sm p-0 relative',
                day_button: cn(
                  'h-8 w-8 inline-flex items-center justify-center rounded-md font-normal',
                  'transition-all duration-200',
                  'hover:bg-secondary',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  'cursor-pointer'
                ),
                selected: 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                today: 'bg-accent text-accent-foreground font-semibold',
                outside: 'text-muted-foreground opacity-50',
                disabled: 'text-muted-foreground opacity-50 cursor-not-allowed',
              }}
            />
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}

export { DatePicker }
export type { DatePickerProps }
