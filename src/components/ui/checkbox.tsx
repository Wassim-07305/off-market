import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
  wrapperClassName?: string
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, wrapperClassName, id, checked, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <label
        htmlFor={checkboxId}
        className={cn(
          'inline-flex cursor-pointer items-start gap-2',
          props.disabled && 'cursor-not-allowed opacity-50',
          wrapperClassName
        )}
      >
        <div className="relative flex shrink-0 items-center justify-center pt-0.5">
          <input
            ref={ref}
            id={checkboxId}
            type="checkbox"
            checked={checked}
            className={cn('peer sr-only', className)}
            {...props}
          />
          <div
            className={cn(
              'flex h-4 w-4 items-center justify-center rounded-sm border border-border',
              'transition-all duration-200',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2',
              'peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground'
            )}
          >
            <Check
              className={cn(
                'h-3 w-3 transition-opacity duration-200',
                checked ? 'opacity-100' : 'opacity-0'
              )}
            />
          </div>
        </div>
        {(label || description) && (
          <div className="flex flex-col gap-0.5">
            {label && (
              <span className="text-sm font-medium leading-none text-foreground">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-muted-foreground">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    )
  }
)

Checkbox.displayName = 'Checkbox'

export { Checkbox }
export type { CheckboxProps }
