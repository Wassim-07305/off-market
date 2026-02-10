import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Formation, FormationProgress } from '@/types/database'
import { toast } from 'sonner'

export function useFormations(publishedOnly = false) {
  return useQuery({
    queryKey: ['formations', { publishedOnly }],
    queryFn: async () => {
      let query = supabase
        .from('formations')
        .select('*')
        .order('sort_order', { ascending: true })

      if (publishedOnly) {
        query = query.eq('is_published', true)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Formation[]
    },
  })
}

export function useFormation(id: string | undefined) {
  return useQuery({
    queryKey: ['formations', id],
    queryFn: async () => {
      if (!id) return null
      const { data, error } = await supabase.from('formations').select('*').eq('id', id).single()
      if (error) throw error
      return data as Formation
    },
    enabled: !!id,
  })
}

export function useCreateFormation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { title: string; description?: string; thumbnail_url?: string; is_published?: boolean }) => {
      const { data: result, error } = await supabase.from('formations').insert(data).select().single()
      if (error) throw error
      return result as Formation
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] })
      toast.success('Formation créée')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useUpdateFormation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Formation> & { id: string }) => {
      const { data: result, error } = await supabase.from('formations').update(data).eq('id', id).select().single()
      if (error) throw error
      return result as Formation
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] })
      toast.success('Formation mise à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useDeleteFormation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('formations').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formations'] })
      toast.success('Formation supprimée')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useFormationProgress(formationId: string | undefined, userId?: string) {
  return useQuery({
    queryKey: ['formation-progress', formationId, userId],
    queryFn: async () => {
      if (!formationId) return null
      const args: Record<string, string> = { p_formation_id: formationId }
      if (userId) args.p_user_id = userId
      const { data, error } = await supabase.rpc('get_formation_progress', args)
      if (error) throw error
      return data as unknown as FormationProgress
    },
    enabled: !!formationId,
  })
}
