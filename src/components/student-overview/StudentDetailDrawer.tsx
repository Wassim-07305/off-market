import { X } from 'lucide-react'
import type { StudentOverview } from '@/types/database'
import { ActivityBadge } from './ActivityBadge'
import { FormationProgressList } from './FormationProgressList'
import { getInitials, formatDate, formatRelativeDate } from '@/lib/utils'
import { createPortal } from 'react-dom'
import { useCallback, useEffect, useRef } from 'react'

interface StudentDetailDrawerProps {
  student: StudentOverview | null
  open: boolean
  onClose: () => void
}

export function StudentDetailDrawer({ student, open, onClose }: StudentDetailDrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  const handleEscape = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [open, handleEscape])

  if (!open || !student) return null

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose()
      }}
    >
      <div className="w-full max-w-md animate-in slide-in-from-right bg-white shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-white px-5 py-4">
          <h2 className="text-lg font-semibold text-foreground">Détail élève</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 px-5 py-5">
          {/* Profile */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-700">
              {student.avatar_url ? (
                <img src={student.avatar_url} alt="" className="h-14 w-14 rounded-full object-cover" />
              ) : (
                getInitials(student.full_name)
              )}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-foreground">{student.full_name}</h3>
              <p className="truncate text-sm text-muted-foreground">{student.email}</p>
              <div className="mt-1">
                <ActivityBadge lastSeenAt={student.last_seen_at} />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-border p-3 text-center">
              <p className="text-lg font-bold text-foreground">{student.messages_count}</p>
              <p className="text-[11px] text-muted-foreground">Messages</p>
            </div>
            <div className="rounded-xl border border-border p-3 text-center">
              <p className="text-lg font-bold text-foreground">{student.formations.length}</p>
              <p className="text-[11px] text-muted-foreground">Formations</p>
            </div>
            <div className="rounded-xl border border-border p-3 text-center">
              <p className="text-lg font-bold text-foreground">
                {student.last_seen_at ? formatRelativeDate(student.last_seen_at) : '—'}
              </p>
              <p className="text-[11px] text-muted-foreground">Vu</p>
            </div>
          </div>

          {/* Timeline info */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Informations</h4>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Inscrit le</span>
                <span className="font-medium text-foreground">{formatDate(student.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dernière connexion</span>
                <span className="font-medium text-foreground">
                  {student.last_seen_at ? formatRelativeDate(student.last_seen_at) : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dernier message</span>
                <span className="font-medium text-foreground">
                  {student.last_message_at ? formatRelativeDate(student.last_message_at) : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Formations */}
          <div>
            <h4 className="mb-2 text-sm font-semibold text-foreground">Formations</h4>
            <FormationProgressList formations={student.formations} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
