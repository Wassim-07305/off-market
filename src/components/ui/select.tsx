import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps {
  options: SelectOption[]
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  label?: string
  error?: string
  disabled?: boolean
  className?: string
  wrapperClassName?: string
  id?: string
}

const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      value,
      onChange,
      placeholder = 'Sélectionner...',
      label,
      error,
      disabled = false,
      className,
      wrapperClassName,
      id,
    },
    ref
  ) => {
    const [open, setOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

    const selectedOption = options.find((opt) => opt.value === value)

    const handleSelect = useCallback(
      (optionValue: string) => {
        onChange?.(optionValue)
        setOpen(false)
      },
      [onChange]
    )

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

    return (
      <div className={cn('flex flex-col gap-1.5', wrapperClassName)} ref={containerRef}>
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <button
            ref={ref}
            id={selectId}
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-haspopup="listbox"
            disabled={disabled}
            onClick={() => setOpen((prev) => !prev)}
            className={cn(
              'flex h-9 w-full items-center justify-between rounded-xl border border-border bg-white px-3 py-1.5 text-sm',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'cursor-pointer',
              !selectedOption && 'text-muted-foreground',
              error && 'border-destructive focus:ring-destructive',
              className
            )}
          >
            <span className="truncate">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                open && 'rotate-180'
              )}
            />
          </button>

          {open && (
            <ul
              role="listbox"
              className={cn(
                'absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-border bg-white py-1 shadow-lg',
                'animate-in fade-in-0 zoom-in-95'
              )}
            >
              {options.map((option) => (
                <li
                  key={option.value}
                  role="option"
                  aria-selected={value === option.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 px-3 py-2 text-sm transition-colors duration-150',
                    'hover:bg-secondary',
                    value === option.value && 'bg-secondary font-medium',
                    option.disabled && 'pointer-events-none opacity-50'
                  )}
                  onClick={() => {
                    if (!option.disabled) handleSelect(option.value)
                  }}
                >
                  <Check
                    className={cn(
                      'h-4 w-4 shrink-0',
                      value === option.value ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  {option.label}
                </li>
              ))}
              {options.length === 0 && (
                <li className="px-3 py-2 text-sm text-muted-foreground">
                  Aucune option disponible
                </li>
              )}
            </ul>
          )}
        </div>
        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }
export type { SelectProps, SelectOption }
