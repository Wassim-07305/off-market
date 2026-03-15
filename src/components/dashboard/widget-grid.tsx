"use client";

import { useState, useCallback, useMemo, memo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { Settings, Save, RotateCcw, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useDashboardLayout,
  useSaveDashboardLayout,
  useResetDashboardLayout,
  DEFAULT_WIDGETS,
  WIDGET_META,
  type WidgetConfig,
  type WidgetType,
} from "@/hooks/use-dashboard-layout";
import { WidgetWrapper } from "@/components/dashboard/widget-wrapper";
import { WidgetRenderer } from "@/components/dashboard/widget-renderer";

export function WidgetGrid() {
  const { data: savedWidgets, isLoading: layoutLoading } = useDashboardLayout();
  const saveMutation = useSaveDashboardLayout();
  const resetMutation = useResetDashboardLayout();

  const [isEditing, setIsEditing] = useState(false);
  const [localWidgets, setLocalWidgets] = useState<WidgetConfig[] | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Use local state while editing, saved state otherwise
  const widgets = useMemo(
    () => localWidgets ?? savedWidgets ?? DEFAULT_WIDGETS,
    [localWidgets, savedWidgets],
  );

  const visibleWidgets = useMemo(
    () => (isEditing ? widgets : widgets.filter((w) => w.visible)),
    [widgets, isEditing],
  );

  const sortableIds = useMemo(
    () => visibleWidgets.map((w) => w.id),
    [visibleWidgets],
  );

  // ─── DnD sensors ────────────────────────────────────────────

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // ─── Handlers ───────────────────────────────────────────────

  const handleStartEdit = useCallback(() => {
    setLocalWidgets([...(savedWidgets ?? DEFAULT_WIDGETS)]);
    setIsEditing(true);
  }, [savedWidgets]);

  const handleCancelEdit = useCallback(() => {
    setLocalWidgets(null);
    setIsEditing(false);
  }, []);

  const handleSave = useCallback(() => {
    if (localWidgets) {
      saveMutation.mutate(localWidgets, {
        onSuccess: () => {
          setLocalWidgets(null);
          setIsEditing(false);
        },
      });
    }
  }, [localWidgets, saveMutation]);

  const handleReset = useCallback(() => {
    resetMutation.mutate(undefined, {
      onSuccess: () => {
        setLocalWidgets(null);
        setIsEditing(false);
      },
    });
  }, [resetMutation]);

  const handleToggleVisibility = useCallback((widgetId: string) => {
    setLocalWidgets((prev) =>
      (prev ?? []).map((w) =>
        w.id === widgetId ? { ...w, visible: !w.visible } : w,
      ),
    );
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLocalWidgets((prev) => {
      const items = prev ?? [];
      const oldIndex = items.findIndex((w) => w.id === active.id);
      const newIndex = items.findIndex((w) => w.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return items;
      const reordered = arrayMove(items, oldIndex, newIndex);
      return reordered.map((w, i) => ({ ...w, position: i }));
    });
  }, []);

  const activeWidget = activeId
    ? visibleWidgets.find((w) => w.id === activeId)
    : null;

  // ─── Loading state ──────────────────────────────────────────

  if (layoutLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-48 bg-surface rounded-2xl animate-shimmer",
              i === 0 && "col-span-1 md:col-span-2 lg:col-span-3",
              (i === 1 || i === 2) && "lg:col-span-2",
            )}
            style={{ boxShadow: "var(--shadow-card)" }}
          />
        ))}
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-end gap-2">
        {isEditing ? (
          <>
            <button
              onClick={handleReset}
              disabled={resetMutation.isPending}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-muted-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors disabled:opacity-50"
            >
              {resetMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RotateCcw className="w-3.5 h-3.5" />
              )}
              Reinitialiser
            </button>
            <button
              onClick={handleCancelEdit}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-muted-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-semibold text-white rounded-lg transition-colors disabled:opacity-50"
              style={{ backgroundColor: "#DC2626" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#B91C1C";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#DC2626";
              }}
            >
              {saveMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Sauvegarder
            </button>
          </>
        ) : (
          <button
            onClick={handleStartEdit}
            className="inline-flex items-center gap-1.5 h-8 px-3 text-xs font-medium text-muted-foreground bg-surface hover:bg-muted rounded-lg transition-colors border border-border"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <Settings className="w-3.5 h-3.5" />
            Personnaliser
          </button>
        )}
      </div>

      {/* Grid */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
          <div
            className={cn(
              "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5",
              isEditing &&
                "p-4 rounded-2xl border-2 border-dashed border-border/50 bg-muted/20",
            )}
          >
            {visibleWidgets.map((widget) => (
              <WidgetWrapper
                key={widget.id}
                widget={widget}
                isEditing={isEditing}
                onToggleVisibility={handleToggleVisibility}
              >
                <MemoizedWidgetRenderer type={widget.type} />
              </WidgetWrapper>
            ))}
          </div>
        </SortableContext>

        {/* Drag overlay */}
        <DragOverlay>
          {activeWidget ? (
            <div className="rounded-2xl border-2 border-[#DC2626]/40 bg-surface shadow-xl opacity-90 p-4">
              <p className="text-sm font-medium text-foreground">
                {WIDGET_META[activeWidget.type]?.label ?? activeWidget.type}
              </p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

// Memoized renderer to prevent re-renders when other widgets change
const MemoizedWidgetRenderer = memo(function MemoizedWidgetRenderer({
  type,
}: {
  type: WidgetType;
}) {
  return <WidgetRenderer type={type} />;
});
