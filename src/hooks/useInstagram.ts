import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { InstagramAccount, InstagramPostStat } from '@/types/database'
import type { InstagramAccountFormData, InstagramPostStatFormData } from '@/types/forms'
import { toast } from 'sonner'

export function useInstagramAccounts(clientId?: string) {
  return useQuery({
    queryKey: ['instagram-accounts', clientId],
    queryFn: async () => {
      let query = supabase
        .from('instagram_accounts')
        .select('*, client:clients(id, name)')
        .order('created_at', { ascending: false })

      if (clientId) query = query.eq('client_id', clientId)

      const { data, error } = await query
      if (error) throw error
      return data as (InstagramAccount & { client?: { id: string; name: string } })[]
    },
  })
}

export function useCreateInstagramAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: InstagramAccountFormData) => {
      const { data: result, error } = await supabase.from('instagram_accounts').insert(data).select().single()
      if (error) throw error
      return result as InstagramAccount
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-accounts'] })
      toast.success('Compte Instagram ajouté')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useUpdateInstagramAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InstagramAccount> & { id: string }) => {
      const { data: result, error } = await supabase.from('instagram_accounts').update(data).eq('id', id).select().single()
      if (error) throw error
      return result as InstagramAccount
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-accounts'] })
      toast.success('Compte mis à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

// Post Stats
export function useInstagramPostStats(accountId?: string) {
  return useQuery({
    queryKey: ['instagram-post-stats', accountId],
    queryFn: async () => {
      if (!accountId) return []
      const { data, error } = await supabase
        .from('instagram_post_stats')
        .select('*')
        .eq('account_id', accountId)
        .order('posted_at', { ascending: false })

      if (error) throw error
      return data as InstagramPostStat[]
    },
    enabled: !!accountId,
  })
}

export function useCreateInstagramPostStat() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: InstagramPostStatFormData) => {
      const { data: result, error } = await supabase.from('instagram_post_stats').insert(data).select().single()
      if (error) throw error
      return result as InstagramPostStat
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instagram-post-stats'] })
      toast.success('Stats ajoutées')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}
