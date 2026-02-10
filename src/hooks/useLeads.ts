import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Lead, LeadWithRelations } from '@/types/database'
import type { LeadFormData } from '@/types/forms'
import { toast } from 'sonner'
import { ITEMS_PER_PAGE } from '@/lib/constants'

interface LeadFilters {
  search?: string
  status?: string
  source?: string
  client_id?: string
  assigned_to?: string
  page?: number
}

export function useLeads(filters: LeadFilters = {}) {
  const { search, status, source, client_id, assigned_to, page = 1 } = filters
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  return useQuery({
    queryKey: ['leads', filters],
    queryFn: async () => {
      let query = supabase
        .from('leads')
        .select('*, client:clients(id, name), assigned_profile:profiles!assigned_to(id, full_name, avatar_url)', {
          count: 'exact',
        })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (search) {
        query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`)
      }
      if (status) query = query.eq('status', status)
      if (source) query = query.eq('source', source)
      if (client_id) query = query.eq('client_id', client_id)
      if (assigned_to) query = query.eq('assigned_to', assigned_to)

      const { data, error, count } = await query
      if (error) throw error
      return { data: data as LeadWithRelations[], count: count ?? 0 }
    },
  })
}

export function useAllLeads() {
  return useQuery({
    queryKey: ['leads', 'all-kanban'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*, client:clients(id, name), assigned_profile:profiles!assigned_to(id, full_name, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(200)

      if (error) throw error
      return data as LeadWithRelations[]
    },
  })
}

export function useLeadsByClient(clientId: string | undefined) {
  return useQuery({
    queryKey: ['leads', 'client', clientId],
    queryFn: async () => {
      if (!clientId) throw new Error('Client ID requis')
      const { data, error } = await supabase
        .from('leads')
        .select('*, assigned_profile:profiles!assigned_to(id, full_name)')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as LeadWithRelations[]
    },
    enabled: !!clientId,
  })
}

export function useCreateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: LeadFormData) => {
      const { data: result, error } = await supabase.from('leads').insert(data).select().single()
      if (error) throw error
      return result as Lead
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead créé avec succès')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useUpdateLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Lead> & { id: string }) => {
      const { data: result, error } = await supabase.from('leads').update(data).eq('id', id).select().single()
      if (error) throw error
      return result as Lead
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead mis à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useDeleteLead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('leads').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] })
      toast.success('Lead supprimé')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useLeadStats(clientId?: string) {
  return useQuery({
    queryKey: ['lead-stats', clientId],
    queryFn: async () => {
      let query = supabase.from('leads').select('*')
      if (clientId) query = query.eq('client_id', clientId)

      const { data, error } = await query
      if (error) throw error

      const leads = data as Lead[]
      return {
        total: leads.length,
        en_discussion: leads.filter((l) => l.status === 'en_discussion').length,
        call_planifie: leads.filter((l) => l.status === 'call_planifie').length,
        close: leads.filter((l) => l.status === 'close').length,
        ca_contracté: leads.reduce((sum, l) => sum + Number(l.ca_contracté), 0),
        ca_collecté: leads.reduce((sum, l) => sum + Number(l.ca_collecté), 0),
      }
    },
  })
}
