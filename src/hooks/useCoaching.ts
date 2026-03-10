import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { CoachingGoal, StudentTask } from '@/types/database'
import type { CoachingGoalFormData, StudentTaskFormData } from '@/types/forms'
import { toast } from 'sonner'
import { ITEMS_PER_PAGE } from '@/lib/constants'

// ─── Coaching Goals ─────────────────────────────────────────────────────────

interface GoalFilters {
  client_id?: string
  status?: string
  page?: number
}

export function useCoachingGoals(filters: GoalFilters = {}) {
  const { client_id, status, page = 1 } = filters
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  return useQuery({
    queryKey: ['coaching_goals', filters],
    queryFn: async () => {
      let query = supabase
        .from('coaching_goals')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (client_id) {
        query = query.eq('client_id', client_id)
      }
      if (status) {
        query = query.eq('status', status)
      }

      const { data, error, count } = await query
      if (error) throw error
      return { data: data as CoachingGoal[], count: count ?? 0 }
    },
  })
}

export function useCreateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CoachingGoalFormData) => {
      const { data: result, error } = await supabase
        .from('coaching_goals')
        .insert(data)
        .select()
        .single()
      if (error) throw error
      return result as CoachingGoal
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaching_goals'] })
      toast.success('Objectif créé avec succès')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useUpdateGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CoachingGoal> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('coaching_goals')
        .update(data)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return result as CoachingGoal
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['coaching_goals'] })
      queryClient.setQueryData(['coaching_goals', data.id], data)
      toast.success('Objectif mis à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useDeleteGoal() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('coaching_goals').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coaching_goals'] })
      toast.success('Objectif supprimé')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

// ─── Student Tasks ──────────────────────────────────────────────────────────

interface TaskFilters {
  student_id?: string
  status?: string
  page?: number
}

export function useStudentTasks(filters: TaskFilters = {}) {
  const { student_id, status, page = 1 } = filters
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  return useQuery({
    queryKey: ['student_tasks', filters],
    queryFn: async () => {
      let query = supabase
        .from('student_tasks')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (student_id) {
        query = query.eq('student_id', student_id)
      }
      if (status) {
        query = query.eq('status', status)
      }

      const { data, error, count } = await query
      if (error) throw error
      return { data: data as StudentTask[], count: count ?? 0 }
    },
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: StudentTaskFormData) => {
      const { data: result, error } = await supabase
        .from('student_tasks')
        .insert(data)
        .select()
        .single()
      if (error) throw error
      return result as StudentTask
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student_tasks'] })
      toast.success('Tâche créée avec succès')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<StudentTask> & { id: string }) => {
      const payload: Record<string, unknown> = { ...data }
      // Auto-set completed_at quand le statut passe à "termine"
      if (data.status === 'termine' && !data.completed_at) {
        payload.completed_at = new Date().toISOString()
      }
      const { data: result, error } = await supabase
        .from('student_tasks')
        .update(payload)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return result as StudentTask
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['student_tasks'] })
      queryClient.setQueryData(['student_tasks', data.id], data)
      toast.success('Tâche mise à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('student_tasks').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student_tasks'] })
      toast.success('Tâche supprimée')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}
