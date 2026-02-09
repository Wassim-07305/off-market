import { forwardRef, useCallback, useEffect, useRef, useState } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string
  onChange?: (value: string) => void
  debounceMs?: number
  wrapperClassName?: string
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value: controlledValue,
      onChange,
      debounceMs = 300,
      placeholder = 'Rechercher...',
      className,
      wrapperClassName,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState(controlledValue ?? '')
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
    const isControlled = controlledValue !== undefined

    useEffect(() => {
      if (isControlled) {
        setInternalValue(controlledValue)
      }
    }, [controlledValue, isControlled])

    const debouncedOnChange = useCallback(
      (val: string) => {
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current)
        }
        debounceTimer.current = setTimeout(() => {
          onChange?.(val)
        }, debounceMs)
      },
      [onChange, debounceMs]
    )

    useEffect(() => {
      return () => {
        if (debounceTimer.current) {
          clearTimeout(debounceTimer.current)
        }
      }
    }, [])

    const handleChange = (val: string) => {
      setInternalValue(val)
      debouncedOnChange(val)
    }

    const handleClear = () => {
      setInternalValue('')
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current)
      }
      onChange?.('')
    }

    return (
      <div className={cn('relative', wrapperClassName)}>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={ref}
          type="text"
          value={internalValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'h-9 w-full rounded-md border border-border bg-background pl-9 pr-8 text-sm text-foreground',
            'transition-all duration-200',
            'placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
            className
          )}
          {...props}
        />
        {internalValue && (
          <button
            type="button"
            onClick={handleClear}
            className={cn(
              'absolute right-2 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground',
              'transition-all duration-200',
              'hover:text-foreground',
              'cursor-pointer'
            )}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    )
  }
)

SearchInput.displayName = 'SearchInput'

export { SearchInput }
export type { SearchInputProps }
