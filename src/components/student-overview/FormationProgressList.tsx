import type { StudentOverview } from '@/types/database'
import { ProgressBar } from '@/components/formations/ProgressBar'
import { GraduationCap } from 'lucide-react'

interface FormationProgressListProps {
  formations: StudentOverview['formations']
}

export function FormationProgressList({ formations }: FormationProgressListProps) {
  if (formations.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        Aucune formation assignée
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {formations.map((f) => (
        <div key={f.formation_id} className="flex items-center gap-3 rounded-lg border border-border p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
            <GraduationCap className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{f.title}</p>
            <ProgressBar
              completed={f.progress?.completed_items ?? 0}
              total={f.progress?.total_items ?? 0}
              size="sm"
              className="mt-1"
            />
          </div>
          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            {f.progress && f.progress.total_items > 0
              ? `${Math.round((f.progress.completed_items / f.progress.total_items) * 100)}%`
              : '—'}
          </span>
        </div>
      ))}
    </div>
  )
}
