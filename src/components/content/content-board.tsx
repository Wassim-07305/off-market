"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import {
  useSocialContent,
  useUpdateContent,
  type SocialContentItem,
  type ContentStatus,
} from "@/hooks/use-social-content";
import { cn } from "@/lib/utils";
import {
  GripVertical,
  Calendar,
  Image,
  Loader2,
} from "lucide-react";

// ─── Column definitions ──────────────────────────────────────

const BOARD_COLUMNS: {
  status: ContentStatus;
  label: string;
  dotColor: string;
  bgHover: string;
}[] = [
  {
    status: "draft",
    label: "Brouillon",
    dotColor: "bg-zinc-400",
    bgHover: "bg-zinc-500/5 ring-1 ring-inset ring-zinc-400/20",
  },
  {
    status: "scheduled",
    label: "Planifie",
    dotColor: "bg-blue-500",
    bgHover: "bg-blue-500/5 ring-1 ring-inset ring-blue-500/20",
  },
  {
    status: "published",
    label: "Publie",
    dotColor: "bg-emerald-500",
    bgHover: "bg-emerald-500/5 ring-1 ring-inset ring-emerald-500/20",
  },
  {
    status: "archived",
    label: "Archive",
    dotColor: "bg-zinc-300 dark:bg-zinc-600",
    bgHover: "bg-zinc-500/5 ring-1 ring-inset ring-zinc-400/20",
  },
];

const PLATFORM_BADGE: Record<
  string,
  { label: string; className: string }
> = {
  instagram: {
    label: "Instagram",
    className:
      "bg-pink-50 text-pink-600 dark:bg-pink-950/40 dark:text-pink-400",
  },
  linkedin: {
    label: "LinkedIn",
    className:
      "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400",
  },
  tiktok: {
    label: "TikTok",
    className:
      "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200",
  },
};

// ─── Content Card ────────────────────────────────────────────

function ContentCard({
  item,
  isDragging,
  onClick,
}: {
  item: SocialContentItem;
  isDragging?: boolean;
  onClick?: () => void;
}) {
  const badge = PLATFORM_BADGE[item.platform] ?? PLATFORM_BADGE.instagram;
  const scheduledDate = item.scheduled_at
    ? new Date(item.scheduled_at).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-surface border border-border rounded-xl p-3.5 group transition-all duration-200 cursor-pointer",
        isDragging
          ? "shadow-xl opacity-90 rotate-1 scale-[1.02]"
          : "hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-sm",
      )}
    >
      <div className="flex items-start gap-2.5">
        <GripVertical className="w-3.5 h-3.5 text-muted-foreground/30 mt-0.5 shrink-0 cursor-grab" />
        <div className="flex-1 min-w-0">
          {/* Title */}
          <p className="text-[13px] font-medium text-foreground truncate">
            {item.title}
          </p>

          {/* Platform badge + date */}
          <div className="flex items-center gap-2 mt-2">
            <span
              className={cn(
                "inline-flex items-center text-[10px] font-semibold px-2 py-0.5 rounded-md",
                badge.className,
              )}
            >
              {badge.label}
            </span>
            {scheduledDate && (
              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {scheduledDate}
              </span>
            )}
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground"
                >
                  {tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="text-[10px] text-muted-foreground">
                  +{item.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Media indicator */}
          {item.media_urls && item.media_urls.length > 0 && (
            <div className="flex items-center gap-1 mt-2 text-[11px] text-muted-foreground">
              <Image className="w-3 h-3" />
              {item.media_urls.length} media
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Draggable wrapper ───────────────────────────────────────

function DraggableContentCard({
  item,
  onClick,
}: {
  item: SocialContentItem;
  onClick: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: item.id });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(isDragging && "opacity-30")}
    >
      <ContentCard item={item} onClick={onClick} />
    </div>
  );
}

// ─── Droppable Column ────────────────────────────────────────

function BoardColumn({
  column,
  items,
  onCardClick,
}: {
  column: (typeof BOARD_COLUMNS)[number];
  items: SocialContentItem[];
  onCardClick: (item: SocialContentItem) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.status });

  return (
    <div
      ref={setNodeRef}
      className="flex flex-col min-w-[260px] w-[260px] shrink-0"
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-1 mb-3">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", column.dotColor)} />
          <span className="text-xs font-semibold text-foreground tracking-wide">
            {column.label}
          </span>
          <span className="text-[11px] text-muted-foreground font-mono tabular-nums">
            {items.length}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div
        className={cn(
          "flex-1 space-y-2 min-h-[50vh] rounded-xl p-2 -m-2 transition-colors duration-200",
          isOver && column.bgHover,
        )}
      >
        {items.map((item) => (
          <DraggableContentCard
            key={item.id}
            item={item}
            onClick={() => onCardClick(item)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Board ──────────────────────────────────────────────

interface ContentBoardProps {
  onEditItem: (item: SocialContentItem) => void;
}

export function ContentBoard({ onEditItem }: ContentBoardProps) {
  const { data: items, isLoading } = useSocialContent();
  const updateContent = useUpdateContent();
  const [activeItem, setActiveItem] = useState<SocialContentItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const found = items?.find((i) => i.id === event.active.id);
    if (found) setActiveItem(found);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveItem(null);
    const { active, over } = event;
    if (!over || !items) return;

    const itemId = active.id as string;
    const newStatus = over.id as ContentStatus;
    const item = items.find((i) => i.id === itemId);
    if (!item || item.status === newStatus) return;

    if (newStatus === "published") {
      updateContent.mutate({
        id: itemId,
        status: newStatus,
        published_at: new Date().toISOString(),
      });
    } else {
      updateContent.mutate({
        id: itemId,
        status: newStatus,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const grouped: Record<ContentStatus, SocialContentItem[]> = {
    draft: [],
    scheduled: [],
    published: [],
    archived: [],
  };

  for (const item of items ?? []) {
    if (grouped[item.status]) {
      grouped[item.status].push(item);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {BOARD_COLUMNS.map((col) => (
          <BoardColumn
            key={col.status}
            column={col}
            items={grouped[col.status]}
            onCardClick={onEditItem}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem ? <ContentCard item={activeItem} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
