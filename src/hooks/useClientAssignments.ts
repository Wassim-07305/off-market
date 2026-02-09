import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ClientAssignment, ClientAssignmentWithRelations, AppRole } from '@/types/database'
import { toast } from 'sonner'

export function useClientAssignments(clientId?: string) {
  return useQuery({
    queryKey: ['client-assignments', clientId],
    queryFn: async () => {
      let query = supabase
        .from('client_assignments')
        .select('*, profile:profiles!user_id(id, full_name, email, avatar_url)')
        .order('assigned_at', { ascending: false })

      if (clientId) query = query.eq('client_id', clientId)

      const { data, error } = await query
      if (error) throw error
      return data as ClientAssignmentWithRelations[]
    },
    enabled: !!clientId,
  })
}

export function useCreateAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { client_id: string; user_id: string; role: AppRole }) => {
      const { data: result, error } = await supabase.from('client_assignments').insert(data).select().single()
      if (error) throw error
      return result as ClientAssignment
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-assignments'] })
      toast.success('Membre assigné')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useDeleteAssignment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('client_assignments').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-assignments'] })
      toast.success('Assignation supprimée')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}
