"use client";

import { cn } from "@/lib/utils";
import { POST_TYPE_CONFIG, type PostType } from "@/types/feed";

const CATEGORIES: {
  label: string;
  value: PostType | "all";
  emoji?: string;
}[] = [
  { label: "Tous", value: "all" },
  ...Object.entries(POST_TYPE_CONFIG).map(([value, config]) => ({
    label: config.label,
    value: value as PostType,
    emoji: config.emoji,
  })),
];

interface CategoryFilterProps {
  value: PostType | "all";
  onChange: (value: PostType | "all") => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={cn(
            "px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
            value === cat.value
              ? "bg-primary text-white shadow-sm"
              : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80",
          )}
        >
          {cat.emoji && `${cat.emoji} `}
          {cat.label}
        </button>
      ))}
    </div>
  );
}
