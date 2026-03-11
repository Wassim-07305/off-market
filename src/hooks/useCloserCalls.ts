import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { CloserCall, CloserCallWithRelations } from '@/types/database'
import type { CloserCallFormData } from '@/types/forms'
import { toast } from 'sonner'
import { ITEMS_PER_PAGE } from '@/lib/constants'

interface CloserCallFilters {
  client_id?: string
  status?: string
  date_from?: string
  date_to?: string
  page?: number
}

export function useCloserCalls(filters: CloserCallFilters = {}) {
  const { page = 1, ...rest } = filters
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  return useQuery({
    queryKey: ['closer-calls', filters],
    queryFn: async () => {
      let query = supabase
        .from('closer_calls')
        .select('*, client:clients(id, name), lead:leads(id, name), closer_profile:profiles!closer_calls_closer_id_fkey(id, full_name, avatar_url)', { count: 'exact' })
        .order('date', { ascending: false })
        .range(from, to)

      if (rest.client_id) query = query.eq('client_id', rest.client_id)
      if (rest.status) query = query.eq('status', rest.status)
      if (rest.date_from) query = query.gte('date', rest.date_from)
      if (rest.date_to) query = query.lte('date', rest.date_to)

      const { data, error, count } = await query
      if (error) throw error
      return { data: data as CloserCallWithRelations[], count: count ?? 0 }
    },
  })
}

export function useCloserCallStats(clientId?: string) {
  return useQuery({
    queryKey: ['closer-call-stats', clientId],
    queryFn: async () => {
      let query = supabase.from('closer_calls').select('status, revenue')
      if (clientId) query = query.eq('client_id', clientId)

      const { data, error } = await query
      if (error) throw error

      const calls = data as Pick<CloserCall, 'status' | 'revenue'>[]
      const total = calls.length
      const closed = calls.filter((c) => c.status === 'closé')
      const caGenere = closed.reduce((sum, c) => sum + Number(c.revenue), 0)
      const tauxClosing = total > 0 ? (closed.length / total) * 100 : 0

      return { total, closed: closed.length, nonClosed: total - closed.length, caGenere, tauxClosing }
    },
  })
}

export function useCreateCloserCall() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CloserCallFormData) => {
      const { data: result, error } = await supabase.from('closer_calls').insert(data).select().single()
      if (error) throw error
      return result as CloserCall
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['closer-calls'] })
      queryClient.invalidateQueries({ queryKey: ['closer-call-stats'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Appel closer créé')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useUpdateCloserCall() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CloserCall> & { id: string }) => {
      const { data: result, error } = await supabase.from('closer_calls').update(data).eq('id', id).select().single()
      if (error) throw error
      return result as CloserCall
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['closer-calls'] })
      queryClient.invalidateQueries({ queryKey: ['closer-call-stats'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Appel mis à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useDeleteCloserCall() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('closer_calls').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['closer-calls'] })
      queryClient.invalidateQueries({ queryKey: ['closer-call-stats'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] })
      toast.success('Appel supprimé')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}
