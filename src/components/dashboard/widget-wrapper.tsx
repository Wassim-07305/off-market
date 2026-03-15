"use client";

import { memo, type ReactNode } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WidgetConfig } from "@/hooks/use-dashboard-layout";
import { WIDGET_META } from "@/hooks/use-dashboard-layout";

interface WidgetWrapperProps {
  widget: WidgetConfig;
  isEditing: boolean;
  onToggleVisibility: (id: string) => void;
  children: ReactNode;
}

function WidgetWrapperBase({
  widget,
  isEditing,
  onToggleVisibility,
  children,
}: WidgetWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id, disabled: !isEditing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Grid span classes based on widget size
  const sizeClasses: Record<string, string> = {
    "1x1": "col-span-1",
    "2x1": "col-span-1 lg:col-span-2",
    "2x2": "col-span-1 lg:col-span-2",
    full: "col-span-1 md:col-span-2 lg:col-span-3",
  };

  if (!widget.visible && !isEditing) {
    return null;
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        sizeClasses[widget.size] ?? "col-span-1",
        "relative group/widget transition-all duration-200",
        isDragging && "z-50 opacity-80 scale-[1.02]",
        isEditing && "rounded-2xl",
        isEditing && !widget.visible && "opacity-40",
      )}
    >
      {/* Edit mode overlay header */}
      {isEditing && (
        <div
          className={cn(
            "absolute -top-0.5 left-0 right-0 z-10 flex items-center justify-between px-3 py-1.5 rounded-t-2xl bg-surface/90 backdrop-blur-sm border border-border/50",
            isDragging && "border-[#DC2626]/50",
          )}
        >
          <div className="flex items-center gap-2">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 rounded-md hover:bg-muted transition-colors"
              aria-label="Deplacer le widget"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground" />
            </button>
            <span className="text-xs font-medium text-muted-foreground">
              {WIDGET_META[widget.type]?.label ?? widget.type}
            </span>
          </div>
          <button
            onClick={() => onToggleVisibility(widget.id)}
            className={cn(
              "p-1 rounded-md transition-colors",
              widget.visible
                ? "hover:bg-muted text-muted-foreground"
                : "hover:bg-error/10 text-error",
            )}
            aria-label={widget.visible ? "Masquer" : "Afficher"}
          >
            {widget.visible ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </button>
        </div>
      )}

      {/* Widget content */}
      <div
        className={cn(
          "h-full transition-all duration-200",
          isEditing && "mt-8 rounded-2xl border-2 border-dashed",
          isEditing && widget.visible && "border-border",
          isEditing && !widget.visible && "border-error/30",
          isEditing && isDragging && "border-[#DC2626]/50 shadow-lg",
        )}
      >
        {children}
      </div>
    </div>
  );
}

export const WidgetWrapper = memo(WidgetWrapperBase);
