import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Ritual } from '@/types/database'
import type { RitualFormData } from '@/types/forms'
import { toast } from 'sonner'
import { ITEMS_PER_PAGE } from '@/lib/constants'

interface RitualFilters {
  search?: string
  frequency?: string
  page?: number
}

export function useRituals(filters: RitualFilters = {}) {
  const { search, frequency, page = 1 } = filters
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  return useQuery({
    queryKey: ['rituals', filters],
    queryFn: async () => {
      let query = supabase
        .from('rituals')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
      }
      if (frequency) {
        query = query.eq('frequency', frequency)
      }

      const { data, error, count } = await query
      if (error) throw error
      return { data: data as Ritual[], count: count ?? 0 }
    },
  })
}

export function useRitualStats() {
  return useQuery({
    queryKey: ['rituals', 'stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rituals')
        .select('id, frequency, is_active')

      if (error) throw error

      const rituals = data as Ritual[]
      const total = rituals.length
      const actifs = rituals.filter((r) => r.is_active).length
      const quotidien = rituals.filter((r) => r.frequency === 'quotidien').length
      const hebdomadaire = rituals.filter((r) => r.frequency === 'hebdomadaire').length
      const mensuel = rituals.filter((r) => r.frequency === 'mensuel').length

      return { total, actifs, quotidien, hebdomadaire, mensuel }
    },
  })
}

export function useCreateRitual() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: RitualFormData) => {
      const { data: result, error } = await supabase.from('rituals').insert(data).select().single()
      if (error) throw error
      return result as Ritual
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rituals'] })
      toast.success('Rituel créé avec succès')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useUpdateRitual() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Ritual> & { id: string }) => {
      const { data: result, error } = await supabase.from('rituals').update(data).eq('id', id).select().single()
      if (error) throw error
      return result as Ritual
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rituals'] })
      queryClient.setQueryData(['rituals', data.id], data)
      toast.success('Rituel mis à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useDeleteRitual() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('rituals').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rituals'] })
      toast.success('Rituel supprimé')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}
