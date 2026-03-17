import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  primary: "bg-primary text-white hover:bg-primary-hover shadow-xs",
  secondary:
    "border border-border bg-surface text-foreground hover:bg-muted/50 shadow-xs",
  ghost: "text-foreground hover:bg-muted/40",
  destructive: "bg-destructive text-white hover:bg-destructive/90 shadow-xs",
  outline:
    "border border-border text-primary hover:bg-primary/5 hover:border-primary/40",
} as const;

const buttonSizes = {
  sm: "h-8 px-3 text-xs gap-1.5 font-medium",
  md: "h-9 px-4 text-sm gap-2 font-medium",
  lg: "h-11 px-5 text-sm gap-2.5 font-medium",
} as const;

type ButtonVariant = keyof typeof buttonVariants;
type ButtonSize = keyof typeof buttonSizes;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
  iconRight?: ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      icon,
      iconRight,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium",
          "transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30 focus-visible:ring-offset-1",
          "disabled:pointer-events-none disabled:opacity-50",
          "active:scale-[0.98]",
          "cursor-pointer",
          buttonVariants[variant],
          buttonSizes[size],
          className,
        )}
        disabled={isDisabled}
        {...props}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : icon ? (
          <span className="shrink-0">{icon}</span>
        ) : null}
        {children}
        {iconRight && !loading && <span className="shrink-0">{iconRight}</span>}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants, buttonSizes };
export type { ButtonProps, ButtonVariant, ButtonSize };
