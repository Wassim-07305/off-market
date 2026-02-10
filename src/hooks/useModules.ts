import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { FormationModule } from '@/types/database'
import { toast } from 'sonner'

export function useModules(formationId: string | undefined) {
  return useQuery({
    queryKey: ['modules', formationId],
    queryFn: async () => {
      if (!formationId) return []
      const { data, error } = await supabase
        .from('formation_modules')
        .select('*')
        .eq('formation_id', formationId)
        .order('sort_order', { ascending: true })
      if (error) throw error
      return data as FormationModule[]
    },
    enabled: !!formationId,
  })
}

export function useCreateModule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { formation_id: string; title: string; description?: string; sort_order?: number }) => {
      const { data: result, error } = await supabase.from('formation_modules').insert(data).select().single()
      if (error) throw error
      return result as FormationModule
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['modules', variables.formation_id] })
      toast.success('Module créé')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useUpdateModule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<FormationModule> & { id: string }) => {
      const { data: result, error } = await supabase.from('formation_modules').update(data).eq('id', id).select().single()
      if (error) throw error
      return result as FormationModule
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['modules', result.formation_id] })
      toast.success('Module mis à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useDeleteModule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, formationId }: { id: string; formationId: string }) => {
      const { error } = await supabase.from('formation_modules').delete().eq('id', id)
      if (error) throw error
      return formationId
    },
    onSuccess: (formationId) => {
      queryClient.invalidateQueries({ queryKey: ['modules', formationId] })
      toast.success('Module supprimé')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}
