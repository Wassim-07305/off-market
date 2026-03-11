import { forwardRef } from "react";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_1px_3px_0_rgb(220_38_38/0.3),inset_0_1px_0_0_rgb(255_255_255/0.1)]",
  secondary:
    "border border-border bg-white text-foreground hover:bg-muted/50 hover:border-border/80 shadow-sm",
  ghost: "text-foreground hover:bg-muted/60",
  destructive:
    "bg-destructive text-white hover:bg-destructive/90 shadow-[0_1px_3px_0_rgb(220_38_38/0.3)]",
  outline:
    "border-2 border-primary/80 text-primary hover:bg-primary/5 hover:border-primary",
} as const;

const buttonSizes = {
  sm: "h-8 px-3 text-xs gap-1.5 font-medium",
  md: "h-9 px-4 text-sm gap-2 font-medium",
  lg: "h-11 px-5 text-sm gap-2.5 font-semibold",
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
          "inline-flex items-center justify-center rounded-xl font-medium",
          "transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
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
