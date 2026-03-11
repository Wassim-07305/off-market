import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { InstagramAccount, InstagramAccountWithRelations, InstagramPostStat } from '@/types/database'
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
      return data as InstagramAccountWithRelations[]
    },
  })
}

export function useInstagramPostStats(accountId?: string) {
  return useQuery({
    queryKey: ['instagram-post-stats', accountId],
    enabled: !!accountId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('instagram_post_stats')
        .select('*')
        .eq('account_id', accountId!)
        .order('posted_at', { ascending: false })

      if (error) throw error
      return data as InstagramPostStat[]
    },
  })
}

export function useInstagramStats(clientId?: string) {
  return useQuery({
    queryKey: ['instagram-stats', clientId],
    queryFn: async () => {
      let accQuery = supabase.from('instagram_accounts').select('id, followers, following, media_count')
      if (clientId) accQuery = accQuery.eq('client_id', clientId)

      const { data: accounts, error: accError } = await accQuery
      if (accError) throw accError

      const totalFollowers = (accounts ?? []).reduce((sum, a) => sum + Number(a.followers), 0)
      const totalMedia = (accounts ?? []).reduce((sum, a) => sum + Number(a.media_count), 0)
      const nbComptes = (accounts ?? []).length

      const accountIds = (accounts ?? []).map((a) => a.id)
      let avgEngagement = 0

      if (accountIds.length > 0) {
        const { data: stats, error: statsError } = await supabase
          .from('instagram_post_stats')
          .select('engagement_rate')
          .in('account_id', accountIds)

        if (statsError) throw statsError
        if (stats && stats.length > 0) {
          avgEngagement = stats.reduce((sum, s) => sum + Number(s.engagement_rate), 0) / stats.length
        }
      }

      return { totalFollowers, totalMedia, nbComptes, avgEngagement }
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
      queryClient.invalidateQueries({ queryKey: ['instagram-stats'] })
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
      queryClient.invalidateQueries({ queryKey: ['instagram-stats'] })
      toast.success('Compte mis à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
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
      queryClient.invalidateQueries({ queryKey: ['instagram-stats'] })
      toast.success('Statistique ajoutée')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}
