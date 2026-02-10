import { useState } from 'react'
import { ChevronDown, Pencil, Plus, Trash2 } from 'lucide-react'
import type { FormationModule, ModuleItem, ItemCompletion } from '@/types/database'
import { ItemRow } from './ItemRow'
import { cn } from '@/lib/utils'

interface ModuleAccordionProps {
  module: FormationModule
  items: ModuleItem[]
  completions?: ItemCompletion[]
  isAdmin?: boolean
  isEleve?: boolean
  onToggleComplete?: (itemId: string, completed: boolean) => void
  onItemClick?: (item: ModuleItem) => void
  onEditModule?: () => void
  onDeleteModule?: () => void
  onAddItem?: () => void
  onEditItem?: (item: ModuleItem) => void
  onDeleteItem?: (item: ModuleItem) => void
  defaultOpen?: boolean
}

export function ModuleAccordion({
  module,
  items,
  completions = [],
  isAdmin,
  isEleve,
  onToggleComplete,
  onItemClick,
  onEditModule,
  onDeleteModule,
  onAddItem,
  onEditItem,
  onDeleteItem,
  defaultOpen = false,
}: ModuleAccordionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const completedIds = new Set(completions.map((c) => c.item_id))
  const completedCount = items.filter((i) => completedIds.has(i.id)).length

  return (
    <div className="rounded-xl border border-border bg-white overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/30"
      >
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground">{module.title}</h3>
          {module.description && (
            <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{module.description}</p>
          )}
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">
          {isEleve ? `${completedCount}/${items.length}` : `${items.length} items`}
        </span>

        {/* Admin actions */}
        {isAdmin && (
          <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {onAddItem && (
              <button
                type="button"
                onClick={onAddItem}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            )}
            {onEditModule && (
              <button
                type="button"
                onClick={onEditModule}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
            )}
            {onDeleteModule && (
              <button
                type="button"
                onClick={onDeleteModule}
                className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}
      </button>

      {/* Items */}
      {isOpen && (
        <div className="border-t border-border px-2 py-1">
          {items.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              Aucun item dans ce module
            </p>
          ) : (
            items.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                isCompleted={completedIds.has(item.id)}
                isAdmin={isAdmin}
                onToggleComplete={
                  isEleve && onToggleComplete
                    ? (completed) => onToggleComplete(item.id, completed)
                    : undefined
                }
                onEdit={isAdmin && onEditItem ? () => onEditItem(item) : undefined}
                onDelete={isAdmin && onDeleteItem ? () => onDeleteItem(item) : undefined}
                onClick={onItemClick ? () => onItemClick(item) : undefined}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}
