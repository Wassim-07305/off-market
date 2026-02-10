import { BookOpen } from 'lucide-react'
import type { Formation } from '@/types/database'
import { ProgressBar } from './ProgressBar'
import { cn } from '@/lib/utils'

interface FormationCardProps {
  formation: Formation
  progress?: { completed: number; total: number }
  isAdmin?: boolean
  onClick: () => void
}

export function FormationCard({ formation, progress, isAdmin, onClick }: FormationCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex flex-col rounded-xl border border-border bg-white p-0 text-left transition-all',
        'hover:border-blue-200 hover:shadow-md'
      )}
    >
      {/* Thumbnail */}
      {formation.thumbnail_url ? (
        <div className="aspect-video w-full overflow-hidden rounded-t-xl">
          <img
            src={formation.thumbnail_url}
            alt={formation.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-t-xl bg-gradient-to-br from-blue-50 to-indigo-100">
          <BookOpen className="h-10 w-10 text-blue-400" />
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-foreground group-hover:text-blue-700 transition-colors">
            {formation.title}
          </h3>
          {isAdmin && (
            <span className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium',
              formation.is_published
                ? 'bg-green-100 text-green-700'
                : 'bg-amber-100 text-amber-700'
            )}>
              {formation.is_published ? 'Publié' : 'Brouillon'}
            </span>
          )}
        </div>

        {formation.description && (
          <p className="mt-1.5 line-clamp-2 text-xs text-muted-foreground">
            {formation.description}
          </p>
        )}

        {progress && (
          <div className="mt-auto pt-3">
            <ProgressBar completed={progress.completed} total={progress.total} size="sm" />
          </div>
        )}
      </div>
    </button>
  )
}
