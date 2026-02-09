import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { SetterActivity } from '@/types/database'
import type { SetterActivityFormData } from '@/types/forms'
import { toast } from 'sonner'

interface SetterFilters {
  user_id?: string
  client_id?: string
  date_from?: string
  date_to?: string
}

export function useSetterActivities(filters: SetterFilters = {}) {
  return useQuery({
    queryKey: ['setter-activities', filters],
    queryFn: async () => {
      let query = supabase
        .from('setter_activities')
        .select('*, client:clients(id, name), profile:profiles!user_id(id, full_name)')
        .order('date', { ascending: false })

      if (filters.user_id) query = query.eq('user_id', filters.user_id)
      if (filters.client_id) query = query.eq('client_id', filters.client_id)
      if (filters.date_from) query = query.gte('date', filters.date_from)
      if (filters.date_to) query = query.lte('date', filters.date_to)

      const { data, error } = await query
      if (error) throw error
      return data as (SetterActivity & { client?: { id: string; name: string }; profile?: { id: string; full_name: string } })[]
    },
  })
}

export function useUpsertSetterActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: SetterActivityFormData & { user_id: string }) => {
      const { data: result, error } = await supabase
        .from('setter_activities')
        .upsert(data, { onConflict: 'user_id,client_id,date' })
        .select()
        .single()
      if (error) throw error
      return result as SetterActivity
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setter-activities'] })
      toast.success('Activité enregistrée')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useSetterStats(userId?: string) {
  return useQuery({
    queryKey: ['setter-stats', userId],
    queryFn: async () => {
      let query = supabase.from('setter_activities').select('date, messages_sent')
      if (userId) query = query.eq('user_id', userId)

      const { data, error } = await query.order('date', { ascending: false }).limit(30)
      if (error) throw error

      const activities = data as Pick<SetterActivity, 'date' | 'messages_sent'>[]
      const today = new Date()
      const startOfWeek = new Date(today)
      startOfWeek.setDate(today.getDate() - today.getDay() + 1)
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)

      const thisWeek = activities.filter((a) => new Date(a.date) >= startOfWeek)
      const thisMonth = activities.filter((a) => new Date(a.date) >= startOfMonth)

      return {
        total_messages: activities.reduce((sum, a) => sum + a.messages_sent, 0),
        messages_this_week: thisWeek.reduce((sum, a) => sum + a.messages_sent, 0),
        messages_this_month: thisMonth.reduce((sum, a) => sum + a.messages_sent, 0),
        average_daily: activities.length > 0 ? Math.round(activities.reduce((sum, a) => sum + a.messages_sent, 0) / activities.length) : 0,
        daily_data: activities.slice(0, 14).reverse(),
      }
    },
  })
}
