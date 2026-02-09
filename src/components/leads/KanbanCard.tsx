import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getInitials, formatCurrency } from '@/lib/utils'
import { LEAD_SOURCE_LABELS } from '@/lib/constants'
import type { LeadWithRelations } from '@/types/database'

interface KanbanCardProps {
  lead: LeadWithRelations
}

const sourceColors: Record<string, string> = {
  instagram: 'bg-pink-50 text-pink-600',
  linkedin: 'bg-blue-50 text-blue-600',
  tiktok: 'bg-slate-50 text-slate-700',
  referral: 'bg-green-50 text-green-600',
  ads: 'bg-amber-50 text-amber-600',
  autre: 'bg-gray-50 text-gray-600',
}

export function KanbanCard({ lead }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id })

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
          <p className="text-sm font-medium text-foreground truncate">{lead.name}</p>

          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
            {lead.source && (
              <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-medium', sourceColors[lead.source] ?? sourceColors.autre)}>
                {LEAD_SOURCE_LABELS[lead.source] ?? lead.source}
              </span>
            )}
            {lead.ca_contracté > 0 && (
              <span className="text-[10px] font-semibold text-emerald-600">
                {formatCurrency(lead.ca_contracté)}
              </span>
            )}
          </div>

          <div className="mt-2 flex items-center justify-between">
            {lead.assigned_profile ? (
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-violet-100 text-[8px] font-semibold text-violet-700">
                {getInitials(lead.assigned_profile.full_name)}
              </div>
            ) : (
              <div />
            )}
            <span className="text-[10px] text-muted-foreground">
              {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: fr })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
