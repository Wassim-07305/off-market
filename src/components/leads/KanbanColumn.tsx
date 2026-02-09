import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanCard } from './KanbanCard'
import { cn } from '@/lib/utils'
import type { LeadWithRelations } from '@/types/database'

interface KanbanColumnProps {
  id: string
  label: string
  count: number
  color: string
  leads: LeadWithRelations[]
}

export function KanbanColumn({ id, label, count, color, leads }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex w-64 shrink-0 flex-col rounded-2xl border border-border/40 bg-muted/30 transition-colors',
        'border-t-[3px]',
        color,
        isOver && 'bg-primary/[0.03] border-primary/20'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold text-foreground">{label}</h3>
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1.5 text-[11px] font-semibold text-muted-foreground">
          {count}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 px-3 pb-3 min-h-[120px]">
        <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <KanbanCard key={lead.id} lead={lead} />
          ))}
        </SortableContext>

        {leads.length === 0 && (
          <div className="flex h-20 items-center justify-center rounded-xl border border-dashed border-border/40 text-xs text-muted-foreground">
            Aucun lead
          </div>
        )}
      </div>
    </div>
  )
}
