import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SwitchProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "onChange"
> {
  label?: string;
  description?: string;
  wrapperClassName?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      className,
      label,
      description,
      wrapperClassName,
      id,
      checked,
      disabled,
      onCheckedChange,
      ...props
    },
    ref,
  ) => {
    const switchId = id || label?.toLowerCase().replace(/\s+/g, "-");

    const handleChange = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked);
      }
    };

    return (
      <label
        htmlFor={switchId}
        className={cn(
          "inline-flex cursor-pointer items-center justify-between gap-3",
          disabled && "cursor-not-allowed opacity-50",
          wrapperClassName,
        )}
      >
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
        <div className="relative flex shrink-0 items-center">
          <input
            ref={ref}
            id={switchId}
            type="checkbox"
            checked={checked}
            disabled={disabled}
            onChange={handleChange}
            className={cn("peer sr-only", className)}
            {...props}
          />
          <button
            type="button"
            role="switch"
            aria-checked={checked}
            disabled={disabled}
            onClick={handleChange}
            className={cn(
              "relative h-6 w-11 rounded-full transition-colors",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              checked ? "bg-primary" : "bg-zinc-300 dark:bg-zinc-600",
            )}
          >
            <span
              className={cn(
                "absolute top-0.5 h-5 w-5 rounded-full bg-surface shadow-sm transition-transform",
                checked ? "translate-x-5" : "translate-x-0.5",
              )}
            />
          </button>
        </div>
      </label>
    );
  },
);

Switch.displayName = "Switch";

export { Switch };
export type { SwitchProps };
