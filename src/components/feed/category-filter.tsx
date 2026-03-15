"use client";

import { cn } from "@/lib/utils";
import { POST_CATEGORY_CONFIG, type PostCategory } from "@/types/feed";

const CATEGORIES: {
  label: string;
  value: PostCategory | "all";
  emoji?: string;
}[] = [
  { label: "Tous", value: "all" },
  ...Object.entries(POST_CATEGORY_CONFIG).map(([value, config]) => ({
    label: config.label,
    value: value as PostCategory,
    emoji: config.emoji,
  })),
];

interface CategoryFilterProps {
  value: PostCategory | "all";
  onChange: (value: PostCategory | "all") => void;
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
