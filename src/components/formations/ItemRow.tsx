import { Check, FileText, Pencil, Play, Trash2 } from 'lucide-react'
import type { ModuleItem } from '@/types/database'
import { cn } from '@/lib/utils'

interface ItemRowProps {
  item: ModuleItem
  isCompleted?: boolean
  isAdmin?: boolean
  onToggleComplete?: (completed: boolean) => void
  onEdit?: () => void
  onDelete?: () => void
  onClick?: () => void
}

export function ItemRow({ item, isCompleted, isAdmin, onToggleComplete, onEdit, onDelete, onClick }: ItemRowProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-lg px-3 py-2 transition-colors',
        onClick && 'cursor-pointer hover:bg-muted/50'
      )}
    >
      {/* Completion checkbox (for students) */}
      {onToggleComplete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggleComplete(!isCompleted)
          }}
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all',
            isCompleted
              ? 'border-green-500 bg-green-500 text-white'
              : 'border-border hover:border-green-400'
          )}
        >
          {isCompleted && <Check className="h-3 w-3" />}
        </button>
      )}

      {/* Icon */}
      <div className={cn(
        'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
        item.type === 'video' ? 'bg-red-50' : 'bg-blue-50'
      )}>
        {item.type === 'video' ? (
          <Play className="h-4 w-4 text-red-500" />
        ) : (
          <FileText className="h-4 w-4 text-blue-500" />
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1" onClick={onClick}>
        <p className={cn('text-sm font-medium text-foreground', isCompleted && 'line-through opacity-60')}>
          {item.title}
        </p>
        {item.duration && (
          <p className="text-xs text-muted-foreground">{item.duration} min</p>
        )}
      </div>

      {/* Admin actions */}
      {isAdmin && (
        <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {onEdit && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onEdit()
              }}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
              className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
