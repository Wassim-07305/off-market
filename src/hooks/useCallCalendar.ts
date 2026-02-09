import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { CallCalendar, CallCalendarWithRelations } from '@/types/database'
import type { CallCalendarFormData } from '@/types/forms'
import { toast } from 'sonner'

interface CallFilters {
  date_from?: string
  date_to?: string
  client_id?: string
  assigned_to?: string
  status?: string
  type?: string
}

export function useCallCalendar(filters: CallFilters = {}) {
  return useQuery({
    queryKey: ['call-calendar', filters],
    queryFn: async () => {
      let query = supabase
        .from('call_calendar')
        .select('*, client:clients(id, name), lead:leads(id, name), assigned_profile:profiles!assigned_to(id, full_name, avatar_url)')
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      if (filters.date_from) query = query.gte('date', filters.date_from)
      if (filters.date_to) query = query.lte('date', filters.date_to)
      if (filters.client_id) query = query.eq('client_id', filters.client_id)
      if (filters.assigned_to) query = query.eq('assigned_to', filters.assigned_to)
      if (filters.status) query = query.eq('status', filters.status)
      if (filters.type) query = query.eq('type', filters.type)

      const { data, error } = await query
      if (error) throw error
      return data as CallCalendarWithRelations[]
    },
  })
}

export function useCreateCall() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CallCalendarFormData) => {
      const { data: result, error } = await supabase.from('call_calendar').insert(data).select().single()
      if (error) throw error
      return result as CallCalendar
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call-calendar'] })
      toast.success('Call planifié avec succès')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useUpdateCall() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<CallCalendar> & { id: string }) => {
      const { data: result, error } = await supabase.from('call_calendar').update(data).eq('id', id).select().single()
      if (error) throw error
      return result as CallCalendar
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call-calendar'] })
      toast.success('Call mis à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useDeleteCall() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('call_calendar').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['call-calendar'] })
      toast.success('Call supprimé')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useCallStats(filters: CallFilters = {}) {
  return useQuery({
    queryKey: ['call-stats', filters],
    queryFn: async () => {
      let query = supabase.from('call_calendar').select('status, date')
      if (filters.client_id) query = query.eq('client_id', filters.client_id)
      if (filters.assigned_to) query = query.eq('assigned_to', filters.assigned_to)

      const { data, error } = await query
      if (error) throw error

      const today = new Date().toISOString().split('T')[0]
      const calls = data as Pick<CallCalendar, 'status' | 'date'>[]

      return {
        total: calls.length,
        today: calls.filter((c) => c.date === today).length,
        upcoming: calls.filter((c) => c.date > today && c.status === 'planifié').length,
        réalisé: calls.filter((c) => c.status === 'réalisé').length,
        no_show: calls.filter((c) => c.status === 'no_show').length,
      }
    },
  })
}
