import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { CloserCall, CloserCallWithRelations } from '@/types/database'
import type { CloserCallFormData } from '@/types/forms'
import { toast } from 'sonner'
import { ITEMS_PER_PAGE } from '@/lib/constants'

interface CloserCallFilters {
  client_id?: string
  closer_id?: string
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
        .select('*, client:clients(id, name), lead:leads(id, name), closer:profiles!closer_id(id, full_name, avatar_url)', {
          count: 'exact',
        })
        .order('date', { ascending: false })
        .range(from, to)

      if (rest.client_id) query = query.eq('client_id', rest.client_id)
      if (rest.closer_id) query = query.eq('closer_id', rest.closer_id)
      if (rest.status) query = query.eq('status', rest.status)
      if (rest.date_from) query = query.gte('date', rest.date_from)
      if (rest.date_to) query = query.lte('date', rest.date_to)

      const { data, error, count } = await query
      if (error) throw error
      return { data: data as CloserCallWithRelations[], count: count ?? 0 }
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
      toast.success('Closer call créé')
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
      toast.success('Closer call mis à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useCloserCallStats(filters: { client_id?: string; closer_id?: string } = {}) {
  return useQuery({
    queryKey: ['closer-call-stats', filters],
    queryFn: async () => {
      let query = supabase.from('closer_calls').select('status, revenue')
      if (filters.client_id) query = query.eq('client_id', filters.client_id)
      if (filters.closer_id) query = query.eq('closer_id', filters.closer_id)

      const { data, error } = await query
      if (error) throw error

      const calls = data as Pick<CloserCall, 'status' | 'revenue'>[]
      const closedCalls = calls.filter((c) => c.status === 'closé')

      return {
        total: calls.length,
        closé: closedCalls.length,
        ca_total: closedCalls.reduce((sum, c) => sum + Number(c.revenue), 0),
        taux_closing: calls.length > 0 ? (closedCalls.length / calls.length) * 100 : 0,
      }
    },
  })
}
