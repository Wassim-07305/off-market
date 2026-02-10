import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { StudentOverview } from '@/types/database'

export function useStudentsOverview() {
  return useQuery({
    queryKey: ['students-overview'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_students_overview')
      if (error) throw error
      return (data as unknown as StudentOverview[]) ?? []
    },
  })
}

export function useStudentOverview(userId: string | undefined) {
  return useQuery({
    queryKey: ['student-overview', userId],
    queryFn: async () => {
      if (!userId) return null
      const { data, error } = await supabase.rpc('get_student_overview', { p_user_id: userId })
      if (error) throw error
      return data as unknown as StudentOverview
    },
    enabled: !!userId,
  })
}
