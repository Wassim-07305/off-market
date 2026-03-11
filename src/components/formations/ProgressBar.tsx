import { cn } from "@/lib/utils";

interface ProgressBarProps {
  completed: number;
  total: number;
  size?: "sm" | "md";
  className?: string;
}

export function ProgressBar({
  completed,
  total,
  size = "md",
  className,
}: ProgressBarProps) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full bg-secondary",
        size === "sm" ? "h-1.5" : "h-2.5",
        className,
      )}
    >
      <div
        className="h-full rounded-full bg-primary transition-all duration-300"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
