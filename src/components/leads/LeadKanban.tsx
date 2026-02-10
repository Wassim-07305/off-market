import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { LEAD_STATUSES, LEAD_STATUS_LABELS } from '@/lib/constants'
import type { LeadStatus } from '@/lib/constants'
import type { LeadWithRelations } from '@/types/database'

interface LeadKanbanProps {
  leads: LeadWithRelations[]
  onStatusChange: (leadId: string, newStatus: LeadStatus) => void
}

const COLUMN_COLORS: Record<LeadStatus, string> = {
  premier_message: 'border-t-slate-400',
  en_discussion: 'border-t-blue-500',
  qualifie: 'border-t-indigo-500',
  loom_envoye: 'border-t-purple-500',
  call_planifie: 'border-t-amber-500',
  close: 'border-t-emerald-500',
  perdu: 'border-t-red-500',
}

export function LeadKanban({ leads, onStatusChange }: LeadKanbanProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )

  const columns = LEAD_STATUSES.map((status) => ({
    id: status,
    label: LEAD_STATUS_LABELS[status],
    leads: leads.filter((l) => l.status === status),
    color: COLUMN_COLORS[status],
  }))

  const activeLead = activeId ? leads.find((l) => l.id === activeId) : null

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const leadId = active.id as string
    const newStatus = over.id as LeadStatus

    // Check if the drop target is a column
    if ((LEAD_STATUSES as readonly string[]).includes(newStatus)) {
      const lead = leads.find((l) => l.id === leadId)
      if (lead && lead.status !== newStatus) {
        onStatusChange(leadId, newStatus)
      }
    }
  }, [leads, onStatusChange])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            label={column.label}
            count={column.leads.length}
            color={column.color}
            leads={column.leads}
          />
        ))}
      </div>

      <DragOverlay>
        {activeLead ? (
          <div className="rotate-2 opacity-90">
            <KanbanCard lead={activeLead} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
