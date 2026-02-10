import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ProgressBar } from './ProgressBar'
import { Skeleton } from '@/components/ui/skeleton'
import { getInitials } from '@/lib/utils'

interface StudentProgress {
  user_id: string
  full_name: string
  avatar_url: string | null
  total_items: number
  completed_items: number
}

interface FormationProgressAdminProps {
  formationId: string
}

export function FormationProgressAdmin({ formationId }: FormationProgressAdminProps) {
  const [data, setData] = useState<StudentProgress[]>([])
  const [loading, setLoading] = useState(true)

  const loadProgress = useCallback(async () => {
    setLoading(true)

    // Get all students (role = eleve)
    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'eleve')

    if (!roles || roles.length === 0) {
      setData([])
      setLoading(false)
      return
    }

    const studentIds = roles.map((r) => r.user_id)

    // Get profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .in('id', studentIds)

    // Get all items for this formation
    const { data: modules } = await supabase
      .from('formation_modules')
      .select('id')
      .eq('formation_id', formationId)

    const moduleIds = (modules ?? []).map((m) => m.id)

    let totalItems = 0
    const completionsByUser: Record<string, number> = {}

    if (moduleIds.length > 0) {
      const { data: items } = await supabase
        .from('module_items')
        .select('id')
        .in('module_id', moduleIds)

      totalItems = items?.length ?? 0
      const itemIds = (items ?? []).map((i) => i.id)

      if (itemIds.length > 0) {
        const { data: completions } = await supabase
          .from('item_completions')
          .select('user_id, item_id')
          .in('item_id', itemIds)
          .in('user_id', studentIds)

        for (const c of completions ?? []) {
          completionsByUser[c.user_id] = (completionsByUser[c.user_id] || 0) + 1
        }
      }
    }

    const result: StudentProgress[] = (profiles ?? []).map((p) => ({
      user_id: p.id,
      full_name: p.full_name,
      avatar_url: p.avatar_url,
      total_items: totalItems,
      completed_items: completionsByUser[p.id] ?? 0,
    }))

    // Sort by progress descending
    result.sort((a, b) => {
      const pA = a.total_items > 0 ? a.completed_items / a.total_items : 0
      const pB = b.total_items > 0 ? b.completed_items / b.total_items : 0
      return pB - pA
    })

    setData(result)
    setLoading(false)
  }, [formationId])

  useEffect(() => {
    loadProgress()
  }, [loadProgress])

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2 w-full rounded-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Aucun élève inscrit
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {data.map((student) => (
        <div key={student.user_id} className="flex items-center gap-3 rounded-lg border border-border p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
            {student.avatar_url ? (
              <img src={student.avatar_url} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              getInitials(student.full_name)
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{student.full_name}</p>
            <ProgressBar
              completed={student.completed_items}
              total={student.total_items}
              size="sm"
              className="mt-1"
            />
          </div>
          <span className="shrink-0 text-xs font-medium text-muted-foreground">
            {student.total_items > 0
              ? `${Math.round((student.completed_items / student.total_items) * 100)}%`
              : '—'}
          </span>
        </div>
      ))}
    </div>
  )
}
