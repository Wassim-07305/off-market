import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { SocialContent, SocialContentWithRelations } from '@/types/database'
import type { SocialContentFormData } from '@/types/forms'
import { toast } from 'sonner'

interface SocialContentFilters {
  client_id?: string
  status?: string
  format?: string
}

export function useSocialContent(filters: SocialContentFilters = {}) {
  return useQuery({
    queryKey: ['social-content', filters],
    queryFn: async () => {
      let query = supabase
        .from('social_content')
        .select('*, client:clients(id, name)')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

      if (filters.client_id) query = query.eq('client_id', filters.client_id)
      if (filters.status) query = query.eq('status', filters.status)
      if (filters.format) query = query.eq('format', filters.format)

      const { data, error } = await query
      if (error) throw error
      return data as SocialContentWithRelations[]
    },
  })
}

export function useSocialContentStats(clientId?: string) {
  return useQuery({
    queryKey: ['social-content-stats', clientId],
    queryFn: async () => {
      let query = supabase.from('social_content').select('status, format, is_validated')
      if (clientId) query = query.eq('client_id', clientId)

      const { data, error } = await query
      if (error) throw error

      const items = data as Pick<SocialContent, 'status' | 'format' | 'is_validated'>[]
      const total = items.length
      const publie = items.filter((i) => i.status === 'publié').length
      const enCours = items.filter((i) => i.status === 'en_cours').length
      const valide = items.filter((i) => i.is_validated).length

      return { total, publie, enCours, valide }
    },
  })
}

export function useCreateSocialContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: SocialContentFormData) => {
      const { data: result, error } = await supabase.from('social_content').insert(data).select().single()
      if (error) throw error
      return result as SocialContent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-content'] })
      queryClient.invalidateQueries({ queryKey: ['social-content-stats'] })
      toast.success('Contenu créé')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useUpdateSocialContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<SocialContent> & { id: string }) => {
      const { data: result, error } = await supabase.from('social_content').update(data).eq('id', id).select().single()
      if (error) throw error
      return result as SocialContent
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-content'] })
      queryClient.invalidateQueries({ queryKey: ['social-content-stats'] })
      toast.success('Contenu mis à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useDeleteSocialContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('social_content').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-content'] })
      queryClient.invalidateQueries({ queryKey: ['social-content-stats'] })
      toast.success('Contenu supprimé')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}
