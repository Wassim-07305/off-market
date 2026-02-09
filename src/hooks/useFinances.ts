import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { FinancialEntry, PaymentSchedule } from '@/types/database'
import type { FinancialEntryFormData, PaymentScheduleFormData } from '@/types/forms'
import { toast } from 'sonner'
import { ITEMS_PER_PAGE } from '@/lib/constants'

interface FinanceFilters {
  client_id?: string
  type?: string
  date_from?: string
  date_to?: string
  page?: number
}

export function useFinancialEntries(filters: FinanceFilters = {}) {
  const { page = 1, ...rest } = filters
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  return useQuery({
    queryKey: ['financial-entries', filters],
    queryFn: async () => {
      let query = supabase
        .from('financial_entries')
        .select('*, client:clients(id, name)', { count: 'exact' })
        .order('date', { ascending: false })
        .range(from, to)

      if (rest.client_id) query = query.eq('client_id', rest.client_id)
      if (rest.type) query = query.eq('type', rest.type)
      if (rest.date_from) query = query.gte('date', rest.date_from)
      if (rest.date_to) query = query.lte('date', rest.date_to)

      const { data, error, count } = await query
      if (error) throw error
      return { data: data as (FinancialEntry & { client?: { id: string; name: string } })[], count: count ?? 0 }
    },
  })
}

export function useCreateFinancialEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: FinancialEntryFormData) => {
      const { data: result, error } = await supabase.from('financial_entries').insert(data).select().single()
      if (error) throw error
      return result as FinancialEntry
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-entries'] })
      queryClient.invalidateQueries({ queryKey: ['finance-stats'] })
      toast.success('Entrée financière créée')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useUpdateFinancialEntry() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<FinancialEntry> & { id: string }) => {
      const { data: result, error } = await supabase.from('financial_entries').update(data).eq('id', id).select().single()
      if (error) throw error
      return result as FinancialEntry
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['financial-entries'] })
      queryClient.invalidateQueries({ queryKey: ['finance-stats'] })
      toast.success('Entrée mise à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useFinanceStats(clientId?: string) {
  return useQuery({
    queryKey: ['finance-stats', clientId],
    queryFn: async () => {
      let query = supabase.from('financial_entries').select('type, amount, is_paid')
      if (clientId) query = query.eq('client_id', clientId)

      const { data, error } = await query
      if (error) throw error

      const entries = data as Pick<FinancialEntry, 'type' | 'amount' | 'is_paid'>[]
      const ca = entries.filter((e) => e.type === 'ca').reduce((sum, e) => sum + Number(e.amount), 0)
      const récurrent = entries.filter((e) => e.type === 'récurrent').reduce((sum, e) => sum + Number(e.amount), 0)
      const charges = entries.filter((e) => e.type === 'charge').reduce((sum, e) => sum + Number(e.amount), 0)
      const prestataires = entries.filter((e) => e.type === 'prestataire').reduce((sum, e) => sum + Number(e.amount), 0)
      const revenue = ca + récurrent
      const expenses = charges + prestataires
      const marge = revenue > 0 ? ((revenue - expenses) / revenue) * 100 : 0

      return { ca, récurrent, charges, prestataires, revenue, expenses, marge }
    },
  })
}

// Payment Schedules
export function usePaymentSchedules(clientId?: string) {
  return useQuery({
    queryKey: ['payment-schedules', clientId],
    queryFn: async () => {
      let query = supabase
        .from('payment_schedules')
        .select('*, client:clients(id, name)')
        .order('due_date', { ascending: true })

      if (clientId) query = query.eq('client_id', clientId)

      const { data, error } = await query
      if (error) throw error
      return data as (PaymentSchedule & { client?: { id: string; name: string } })[]
    },
  })
}

export function useCreatePaymentSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: PaymentScheduleFormData) => {
      const { data: result, error } = await supabase.from('payment_schedules').insert(data).select().single()
      if (error) throw error
      return result as PaymentSchedule
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-schedules'] })
      toast.success('Échéance créée')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useUpdatePaymentSchedule() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<PaymentSchedule> & { id: string }) => {
      const { data: result, error } = await supabase.from('payment_schedules').update(data).eq('id', id).select().single()
      if (error) throw error
      return result as PaymentSchedule
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payment-schedules'] })
      toast.success('Échéance mise à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}
