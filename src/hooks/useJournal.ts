import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { JournalEntry, WeeklyCheckin } from '@/types/database'
import { toast } from 'sonner'
import { ITEMS_PER_PAGE } from '@/lib/constants'

// ─── Journal Entries ───────────────────────────────────────────────────────────

interface JournalFilters {
  search?: string
  dateFrom?: string
  dateTo?: string
  page?: number
}

export function useJournalEntries(filters: JournalFilters = {}) {
  const { search, dateFrom, dateTo, page = 1 } = filters
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  return useQuery({
    queryKey: ['journal-entries', filters],
    queryFn: async () => {
      let query = supabase
        .from('journal_entries')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
      }
      if (dateFrom) {
        query = query.gte('created_at', dateFrom)
      }
      if (dateTo) {
        query = query.lte('created_at', dateTo)
      }

      const { data, error, count } = await query
      if (error) throw error
      return { data: data as JournalEntry[], count: count ?? 0 }
    },
  })
}

interface JournalEntryInput {
  title?: string
  content?: string
  mood?: number
  tags?: string[]
  is_private?: boolean
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: JournalEntryInput) => {
      const { data: result, error } = await supabase
        .from('journal_entries')
        .insert(data)
        .select()
        .single()
      if (error) throw error
      return result as JournalEntry
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
      toast.success('Entrée créée avec succès')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<JournalEntry> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('journal_entries')
        .update(data)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return result as JournalEntry
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
      queryClient.setQueryData(['journal-entries', data.id], data)
      toast.success('Entrée mise à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('journal_entries').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] })
      toast.success('Entrée supprimée')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

// ─── Weekly Check-ins ──────────────────────────────────────────────────────────

interface CheckinFilters {
  page?: number
}

export function useWeeklyCheckins(filters: CheckinFilters = {}) {
  const { page = 1 } = filters
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  return useQuery({
    queryKey: ['weekly-checkins', filters],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('weekly_checkins')
        .select('*', { count: 'exact' })
        .order('week_start', { ascending: false })
        .range(from, to)

      if (error) throw error
      return { data: data as WeeklyCheckin[], count: count ?? 0 }
    },
  })
}

interface WeeklyCheckinInput {
  week_start: string
  revenue?: number
  prospection_count?: number
  win?: string
  blocker?: string
  goal_next_week?: string
  mood?: number
}

export function useCreateWeeklyCheckin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: WeeklyCheckinInput) => {
      const { data: result, error } = await supabase
        .from('weekly_checkins')
        .insert(data)
        .select()
        .single()
      if (error) throw error
      return result as WeeklyCheckin
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-checkins'] })
      toast.success('Check-in créé avec succès')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useUpdateWeeklyCheckin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<WeeklyCheckin> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('weekly_checkins')
        .update(data)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return result as WeeklyCheckin
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['weekly-checkins'] })
      queryClient.setQueryData(['weekly-checkins', data.id], data)
      toast.success('Check-in mis à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}
