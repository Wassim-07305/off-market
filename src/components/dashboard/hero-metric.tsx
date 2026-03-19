"use client";

import { cn } from "@/lib/utils";

interface HeroMetricProps {
  label: string;
  value: string;
  change?: {
    value: string;
    label?: string;
    positive: boolean;
  };
  sparklineData?: number[];
  className?: string;
}

function Sparkline({ data }: { data: number[] }) {
  const width = 120;
  const height = 48;
  const padding = 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data
    .map((v, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((v - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const areaPoints = `${padding},${height - padding} ${points} ${width - padding},${height - padding}`;

  const gradientId = "sparkline-fill";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="shrink-0"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor="var(--color-primary)"
            stopOpacity="0.3"
          />
          <stop
            offset="100%"
            stopColor="var(--color-primary)"
            stopOpacity="0"
          />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradientId})`} />
      <polyline
        points={points}
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeroMetric({
  label,
  value,
  change,
  sparklineData,
  className,
}: HeroMetricProps) {
  return (
    <div
      className={cn(
        "bg-gradient-to-br from-primary-glow to-primary-glow-subtle border border-primary/[0.12] rounded-lg p-4 sm:p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-primary font-semibold">
            {label}
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight mt-1">
            {value}
          </p>
          {change && (
            <p className="mt-1 flex items-center gap-1">
              <span
                className={cn(
                  "text-[10px] sm:text-xs font-medium",
                  change.positive ? "text-success" : "text-destructive",
                )}
              >
                {change.value}
              </span>
              {change.label && (
                <span className="text-[10px] sm:text-xs text-muted-foreground">
                  {change.label}
                </span>
              )}
            </p>
          )}
        </div>

        {sparklineData && sparklineData.length >= 2 && (
          <Sparkline data={sparklineData} />
        )}
      </div>
    </div>
  );
}
