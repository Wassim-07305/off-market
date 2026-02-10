import type { StudentOverview } from '@/types/database'
import { ActivityBadge } from './ActivityBadge'
import { ProgressBar } from '@/components/formations/ProgressBar'
import { getInitials, formatRelativeDate } from '@/lib/utils'

interface StudentRowProps {
  student: StudentOverview
  onClick: () => void
}

export function StudentRow({ student, onClick }: StudentRowProps) {
  const totalItems = student.formations.reduce((sum, f) => sum + (f.progress?.total_items ?? 0), 0)
  const completedItems = student.formations.reduce((sum, f) => sum + (f.progress?.completed_items ?? 0), 0)

  return (
    <tr
      onClick={onClick}
      className="cursor-pointer border-b border-border transition-colors hover:bg-muted/30 last:border-0"
    >
      {/* Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
            {student.avatar_url ? (
              <img src={student.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              getInitials(student.full_name)
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{student.full_name}</p>
            <p className="truncate text-xs text-muted-foreground">{student.email}</p>
          </div>
        </div>
      </td>

      {/* Activity */}
      <td className="px-4 py-3">
        <ActivityBadge lastSeenAt={student.last_seen_at} />
      </td>

      {/* Progress */}
      <td className="px-4 py-3">
        <ProgressBar completed={completedItems} total={totalItems} size="sm" />
      </td>

      {/* Messages */}
      <td className="px-4 py-3 text-center">
        <span className="text-sm text-foreground">{student.messages_count}</span>
      </td>

      {/* Last seen */}
      <td className="px-4 py-3 text-right">
        <span className="text-xs text-muted-foreground">
          {student.last_seen_at ? formatRelativeDate(student.last_seen_at) : '—'}
        </span>
      </td>
    </tr>
  )
}
