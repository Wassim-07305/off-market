import { useMemo, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, ExternalLink } from 'lucide-react'
import type { SocialContent } from '@/types/database'
import { useUpdateSocialContent, useDeleteSocialContent, useReorderSocialContent } from '@/hooks/useSocialContent'
import { InlineEdit } from '@/components/ui/inline-edit'
import { Checkbox } from '@/components/ui/checkbox'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/utils'
import {
  SOCIAL_STATUSES,
  SOCIAL_STATUS_LABELS,
  SOCIAL_FORMATS,
  VIDEO_TYPES,
} from '@/lib/constants'
import type { SocialStatus } from '@/lib/constants'

type SocialContentWithClient = SocialContent & { client?: { id: string; name: string } }

interface SocialTableProps {
  data: SocialContentWithClient[]
  isLoading: boolean
  onEdit?: (item: SocialContentWithClient) => void
}

const STATUS_COLORS: Record<SocialStatus, string> = {
  à_tourner: 'bg-orange-100 text-orange-700',
  idée: 'bg-gray-100 text-gray-600',
  en_cours: 'bg-blue-100 text-blue-700',
  publié: 'bg-green-100 text-green-700',
  reporté: 'bg-red-100 text-red-700',
}

const FORMAT_LABELS: Record<string, string> = {
  réel: 'Réel',
  story: 'Story',
  carrousel: 'Carrousel',
  post: 'Post',
}

const VIDEO_TYPE_LABELS: Record<string, string> = {
  réact: 'Réact',
  'b-roll': 'B-Roll',
  vidéo_virale: 'Vidéo virale',
  preuve_sociale: 'Preuve sociale',
  facecam: 'Facecam',
  talking_head: 'Talking Head',
  vlog: 'Vlog',
}

function SortableRow({
  item,
}: {
  item: SocialContentWithClient
}) {
  const updateMutation = useUpdateSocialContent()
  const deleteMutation = useDeleteSocialContent()

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

  const handleFieldUpdate = useCallback(
    (field: string, value: string | boolean) => {
      updateMutation.mutate({ id: item.id, [field]: value })
    },
    [item.id, updateMutation]
  )

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={cn(
        'border-b border-border transition-colors duration-150 hover:bg-secondary/30',
        isDragging && 'bg-secondary/50 opacity-80 shadow-lg'
      )}
    >
      <td className="w-10 px-2 py-3">
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </td>
      <td className="px-4 py-3">
        <InlineEdit
          value={item.title}
          onSave={(value) => handleFieldUpdate('title', value)}
        />
      </td>
      <td className="px-4 py-3">
        <select
          value={item.status}
          onChange={(e) => handleFieldUpdate('status', e.target.value)}
          className={cn(
            'cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-medium border-0 outline-none',
            STATUS_COLORS[item.status]
          )}
        >
          {SOCIAL_STATUSES.map((s) => (
            <option key={s} value={s}>
              {SOCIAL_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <select
          value={item.format ?? ''}
          onChange={(e) => handleFieldUpdate('format', e.target.value || '')}
          className="cursor-pointer rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">--</option>
          {SOCIAL_FORMATS.map((f) => (
            <option key={f} value={f}>
              {FORMAT_LABELS[f] ?? f}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <select
          value={item.video_type ?? ''}
          onChange={(e) => handleFieldUpdate('video_type', e.target.value || '')}
          className="cursor-pointer rounded-md border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">--</option>
          {VIDEO_TYPES.map((v) => (
            <option key={v} value={v}>
              {VIDEO_TYPE_LABELS[v] ?? v}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <InlineEdit
            value={item.link ?? ''}
            onSave={(value) => handleFieldUpdate('link', value)}
            placeholder="Ajouter un lien..."
            textClassName="max-w-[120px] truncate"
          />
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-muted-foreground hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <Checkbox
          checked={item.is_validated}
          onChange={(e) =>
            handleFieldUpdate('is_validated', (e.target as HTMLInputElement).checked)
          }
        />
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
        {item.planned_date ? formatDate(item.planned_date) : '-'}
      </td>
      <td className="w-10 px-2 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => deleteMutation.mutate(item.id)}
          loading={deleteMutation.isPending}
          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </td>
    </tr>
  )
}

export function SocialTable({ data, isLoading, onEdit: _onEdit }: SocialTableProps) {
  const reorderMutation = useReorderSocialContent()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  )

  const itemIds = useMemo(() => data.map((item) => item.id), [data])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const oldIndex = data.findIndex((item) => item.id === active.id)
      const newIndex = data.findIndex((item) => item.id === over.id)

      if (oldIndex === -1 || newIndex === -1) return

      const reordered = arrayMove(data, oldIndex, newIndex)
      const updates = reordered.map((item, index) => ({
        id: item.id,
        sort_order: index,
      }))

      reorderMutation.mutate(updates)
    },
    [data, reorderMutation]
  )

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title="Aucun contenu"
        description="Commencez par ajouter un contenu social."
      />
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-secondary/50">
              <th className="w-10 px-2 py-3" />
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Titre
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Statut
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Format
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Type vidéo
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Lien
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Validé
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Date prévue
              </th>
              <th className="w-10 px-2 py-3" />
            </tr>
          </thead>
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            <tbody>
              {data.map((item) => (
                <SortableRow key={item.id} item={item} />
              ))}
            </tbody>
          </SortableContext>
        </table>
      </DndContext>
    </div>
  )
}
