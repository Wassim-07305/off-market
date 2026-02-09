import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { SocialContent } from '@/types/database'
import type { SocialContentFormData } from '@/types/forms'
import { toast } from 'sonner'

interface SocialFilters {
  client_id?: string
  status?: string
  format?: string
}

export function useSocialContent(filters: SocialFilters = {}) {
  return useQuery({
    queryKey: ['social-content', filters],
    queryFn: async () => {
      let query = supabase
        .from('social_content')
        .select('*, client:clients(id, name)')
        .order('sort_order', { ascending: true })

      if (filters.client_id) query = query.eq('client_id', filters.client_id)
      if (filters.status) query = query.eq('status', filters.status)
      if (filters.format) query = query.eq('format', filters.format)

      const { data, error } = await query
      if (error) throw error
      return data as (SocialContent & { client?: { id: string; name: string } })[]
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
      toast.success('Contenu supprimé')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useReorderSocialContent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (items: { id: string; sort_order: number }[]) => {
      const updates = items.map((item) =>
        supabase.from('social_content').update({ sort_order: item.sort_order }).eq('id', item.id)
      )
      const results = await Promise.all(updates)
      const errorResult = results.find((r) => r.error)
      if (errorResult?.error) throw errorResult.error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social-content'] })
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}
