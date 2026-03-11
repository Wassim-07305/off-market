import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  iconRight?: ReactNode;
  wrapperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      icon,
      iconRight,
      wrapperClassName,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className={cn("flex flex-col gap-1.5", wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "flex h-10 w-full rounded-lg border border-border bg-white px-3.5 py-2 text-sm text-foreground",
              "shadow-sm",
              "transition-all duration-200",
              "placeholder:text-muted-foreground/60",
              "focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10",
              "hover:border-border/80",
              "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30",
              icon && "pl-10",
              iconRight && "pr-10",
              error &&
                "border-destructive focus:ring-destructive/10 focus:border-destructive",
              className,
            )}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {iconRight}
            </span>
          )}
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  },
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
