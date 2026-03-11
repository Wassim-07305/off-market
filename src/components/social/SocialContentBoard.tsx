import { useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  SOCIAL_CONTENT_STATUSES,
  SOCIAL_CONTENT_STATUS_LABELS,
  SOCIAL_CONTENT_STATUS_COLORS,
  SOCIAL_FORMAT_LABELS,
  VIDEO_TYPE_LABELS,
} from '@/lib/constants'
import type { SocialContentStatus } from '@/lib/constants'
import type { SocialContentWithRelations } from '@/types/database'

interface SocialContentBoardProps {
  data: SocialContentWithRelations[]
  isLoading: boolean
  onStatusChange?: (contentId: string, newStatus: SocialContentStatus) => void
}

const COLUMN_BORDER_COLORS: Record<SocialContentStatus, string> = {
  idée: 'border-t-slate-400',
  a_tourner: 'border-t-amber-500',
  en_cours: 'border-t-blue-500',
  publié: 'border-t-emerald-500',
  reporté: 'border-t-orange-500',
}

export function SocialContentBoard({ data, isLoading, onStatusChange }: SocialContentBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="min-w-[280px] flex-1 space-y-3">
            <Skeleton className="h-8 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        ))}
      </div>
    )
  }

  const columns = SOCIAL_CONTENT_STATUSES.map((status) => ({
    id: status,
    label: SOCIAL_CONTENT_STATUS_LABELS[status],
    items: data.filter((item) => item.status === status),
    borderColor: COLUMN_BORDER_COLORS[status],
  }))

  const activeItem = activeId ? data.find((item) => item.id === activeId) : null

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over || !onStatusChange) return

    const contentId = active.id as string
    const newStatus = over.id as SocialContentStatus

    if ((SOCIAL_CONTENT_STATUSES as readonly string[]).includes(newStatus)) {
      const item = data.find((i) => i.id === contentId)
      if (item && item.status !== newStatus) {
        onStatusChange(contentId, newStatus)
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <SocialColumn
            key={column.id}
            id={column.id}
            label={column.label}
            count={column.items.length}
            borderColor={column.borderColor}
            items={column.items}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem ? (
          <div className="rotate-2 opacity-90">
            <ContentCard item={activeItem} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

interface SocialColumnProps {
  id: string
  label: string
  count: number
  borderColor: string
  items: SocialContentWithRelations[]
}

function SocialColumn({ id, label, count, borderColor, items }: SocialColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex min-w-[280px] flex-1 flex-col rounded-2xl border border-border/40 bg-muted/30 transition-colors',
        'border-t-[3px]',
        borderColor,
        isOver && 'bg-primary/[0.03] border-primary/20'
      )}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground">
          {count}
        </span>
      </div>

      <div className="flex-1 space-y-2 px-3 pb-3 min-h-[120px]">
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableContentCard key={item.id} item={item} />
          ))}
        </SortableContext>

        {items.length === 0 && (
          <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-border/40 text-xs text-muted-foreground">
            Aucun contenu
          </div>
        )}
      </div>
    </div>
  )
}

function SortableContentCard({ item }: { item: SocialContentWithRelations }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group rounded-xl border border-border/40 bg-white p-3 shadow-sm transition-all',
        'hover:shadow-md hover:border-border/60',
        isDragging && 'opacity-50 shadow-lg'
      )}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground line-clamp-2">{item.title}</p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {item.format && (
              <Badge className={cn(SOCIAL_CONTENT_STATUS_COLORS[item.status])}>
                {SOCIAL_FORMAT_LABELS[item.format]}
              </Badge>
            )}
            {item.video_type && (
              <span className="text-xs text-muted-foreground">
                {VIDEO_TYPE_LABELS[item.video_type]}
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between">
            {item.client && (
              <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                {item.client.name}
              </span>
            )}
            {item.planned_date && (
              <span className="text-xs text-muted-foreground">
                {format(new Date(item.planned_date), 'dd MMM', { locale: fr })}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function ContentCard({ item }: { item: SocialContentWithRelations }) {
  return (
    <Card className="w-[260px]">
      <CardContent className="p-3">
        <p className="text-sm font-medium text-foreground line-clamp-2">{item.title}</p>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {item.format && (
            <Badge className={cn(SOCIAL_CONTENT_STATUS_COLORS[item.status])}>
              {SOCIAL_FORMAT_LABELS[item.format]}
            </Badge>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between">
          {item.client && (
            <span className="text-xs text-muted-foreground truncate max-w-[140px]">
              {item.client.name}
            </span>
          )}
          {item.planned_date && (
            <span className="text-xs text-muted-foreground">
              {format(new Date(item.planned_date), 'dd MMM', { locale: fr })}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
