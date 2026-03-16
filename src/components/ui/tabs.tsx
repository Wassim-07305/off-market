import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface TabItem {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

interface TabsListProps {
  tabs: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

function TabsList({ tabs, value, onChange, className }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn(
        "flex items-center gap-0.5 overflow-x-auto bg-muted rounded-lg p-1",
        className,
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          disabled={tab.disabled}
          onClick={() => onChange(tab.value)}
          className={cn(
            "relative inline-flex shrink-0 whitespace-nowrap items-center px-3.5 py-1.5 text-sm font-medium rounded-md",
            "transition-all duration-150",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary/30",
            "disabled:pointer-events-none disabled:opacity-50",
            "cursor-pointer",
            value === tab.value
              ? "bg-white text-foreground shadow-sm border border-border/60"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

interface TabsContentProps {
  value: string;
  activeValue: string;
  children: ReactNode;
  className?: string;
}

function TabsContent({
  value,
  activeValue,
  children,
  className,
}: TabsContentProps) {
  if (value !== activeValue) return null;

  return (
    <div
      role="tabpanel"
      className={cn("mt-4 focus-visible:outline-none", className)}
    >
      {children}
    </div>
  );
}

export { TabsList, TabsContent };
export type { TabItem, TabsListProps, TabsContentProps };
