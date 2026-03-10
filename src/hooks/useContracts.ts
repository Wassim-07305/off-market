import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Contract, Invoice } from '@/types/database'
import { toast } from 'sonner'
import { ITEMS_PER_PAGE } from '@/lib/constants'

// ── Contracts ──────────────────────────────────────────────

interface ContractFilters {
  search?: string
  status?: string
  client_id?: string
  page?: number
}

export function useContracts(filters: ContractFilters = {}) {
  const { search, status, client_id, page = 1 } = filters
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  return useQuery({
    queryKey: ['contracts', filters],
    queryFn: async () => {
      let query = supabase
        .from('contracts')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (search) {
        query = query.ilike('title', `%${search}%`)
      }
      if (status) {
        query = query.eq('status', status)
      }
      if (client_id) {
        query = query.eq('client_id', client_id)
      }

      const { data, error, count } = await query
      if (error) throw error
      return { data: data as Contract[], count: count ?? 0 }
    },
  })
}

export function useCreateContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Contract>) => {
      const { data: result, error } = await supabase.from('contracts').insert(data).select().single()
      if (error) throw error
      return result as Contract
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      toast.success('Contrat créé avec succès')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useUpdateContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Contract> & { id: string }) => {
      const { data: result, error } = await supabase.from('contracts').update(data).eq('id', id).select().single()
      if (error) throw error
      return result as Contract
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      queryClient.setQueryData(['contracts', data.id], data)
      toast.success('Contrat mis à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useDeleteContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contracts').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      toast.success('Contrat supprimé')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

// ── Invoices ───────────────────────────────────────────────

interface InvoiceFilters {
  search?: string
  status?: string
  client_id?: string
  page?: number
}

export function useInvoices(filters: InvoiceFilters = {}) {
  const { search, status, client_id, page = 1 } = filters
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  return useQuery({
    queryKey: ['invoices', filters],
    queryFn: async () => {
      let query = supabase
        .from('invoices')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (search) {
        query = query.ilike('invoice_number', `%${search}%`)
      }
      if (status) {
        query = query.eq('status', status)
      }
      if (client_id) {
        query = query.eq('client_id', client_id)
      }

      const { data, error, count } = await query
      if (error) throw error
      return { data: data as Invoice[], count: count ?? 0 }
    },
  })
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Partial<Invoice>) => {
      const { data: result, error } = await supabase.from('invoices').insert(data).select().single()
      if (error) throw error
      return result as Invoice
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Facture créée avec succès')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Invoice> & { id: string }) => {
      const { data: result, error } = await supabase.from('invoices').update(data).eq('id', id).select().single()
      if (error) throw error
      return result as Invoice
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      queryClient.setQueryData(['invoices', data.id], data)
      toast.success('Facture mise à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('invoices').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      toast.success('Facture supprimée')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}
