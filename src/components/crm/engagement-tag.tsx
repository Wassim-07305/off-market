"use client";

import { cn } from "@/lib/utils";
import { STUDENT_TAGS } from "@/lib/constants";
import type { StudentEngagementTag } from "@/types/database";
import { Crown, Star, Sparkles, AlertTriangle, UserX } from "lucide-react";

const TAG_ICONS: Record<StudentEngagementTag, typeof Crown> = {
  vip: Crown,
  standard: Star,
  new: Sparkles,
  at_risk: AlertTriangle,
  churned: UserX,
};

interface EngagementTagBadgeProps {
  tag: StudentEngagementTag;
  size?: "sm" | "md";
  showIcon?: boolean;
  className?: string;
}

export function EngagementTagBadge({
  tag,
  size = "md",
  showIcon = true,
  className,
}: EngagementTagBadgeProps) {
  const config = STUDENT_TAGS.find((t) => t.value === tag);
  if (!config) return null;

  const Icon = TAG_ICONS[tag];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium border",
        size === "sm" ? "h-5 px-2 text-[10px]" : "h-6 px-2.5 text-[11px]",
        config.color,
        className,
      )}
    >
      {showIcon && (
        <Icon className={size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"} />
      )}
      {config.label}
    </span>
  );
}

interface EngagementTagSelectorProps {
  currentTag: StudentEngagementTag;
  onSelect: (tag: StudentEngagementTag) => void;
  isPending?: boolean;
}

export function EngagementTagSelector({
  currentTag,
  onSelect,
  isPending = false,
}: EngagementTagSelectorProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {STUDENT_TAGS.map((tag) => {
        const Icon = TAG_ICONS[tag.value as StudentEngagementTag];
        const isActive = currentTag === tag.value;
        return (
          <button
            key={tag.value}
            onClick={() => onSelect(tag.value as StudentEngagementTag)}
            disabled={isPending || isActive}
            className={cn(
              "inline-flex items-center gap-1.5 h-7 px-3 rounded-full text-xs font-medium border transition-all",
              isActive
                ? cn(tag.color, "ring-2", "ring-offset-1")
                : "bg-surface text-muted-foreground border-border hover:bg-muted",
              isPending && "opacity-50 cursor-not-allowed",
            )}
          >
            <Icon className="w-3 h-3" />
            {tag.label}
          </button>
        );
      })}
    </div>
  );
}
