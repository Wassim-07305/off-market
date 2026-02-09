import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Interview, InterviewWithRelations, Blockage } from '@/types/database'
import type { InterviewFormData, BlockageFormData } from '@/types/forms'
import { toast } from 'sonner'

interface InterviewFilters {
  coach_id?: string
  member_id?: string
  status?: string
}

export function useInterviews(filters: InterviewFilters = {}) {
  return useQuery({
    queryKey: ['interviews', filters],
    queryFn: async () => {
      let query = supabase
        .from('interviews')
        .select('*, coach:profiles!coach_id(id, full_name, avatar_url), member:profiles!member_id(id, full_name, avatar_url)')
        .order('date', { ascending: false })

      if (filters.coach_id) query = query.eq('coach_id', filters.coach_id)
      if (filters.member_id) query = query.eq('member_id', filters.member_id)
      if (filters.status) query = query.eq('status', filters.status)

      const { data, error } = await query
      if (error) throw error
      return data as InterviewWithRelations[]
    },
  })
}

export function useInterview(id: string | undefined) {
  return useQuery({
    queryKey: ['interviews', id],
    queryFn: async () => {
      if (!id) throw new Error('ID requis')
      const { data, error } = await supabase
        .from('interviews')
        .select('*, coach:profiles!coach_id(id, full_name, avatar_url), member:profiles!member_id(id, full_name, avatar_url), blockages(*)')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as InterviewWithRelations
    },
    enabled: !!id,
  })
}

export function useCreateInterview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: InterviewFormData) => {
      const { data: result, error } = await supabase.from('interviews').insert(data).select().single()
      if (error) throw error
      return result as Interview
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      toast.success('Entretien créé')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useUpdateInterview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Interview> & { id: string }) => {
      const { data: result, error } = await supabase.from('interviews').update(data).eq('id', id).select().single()
      if (error) throw error
      return result as Interview
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      toast.success('Entretien mis à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

// Blockages
export function useBlockages(interviewId?: string) {
  return useQuery({
    queryKey: ['blockages', interviewId],
    queryFn: async () => {
      let query = supabase.from('blockages').select('*, member:profiles!member_id(id, full_name)').order('created_at', { ascending: false })
      if (interviewId) query = query.eq('interview_id', interviewId)

      const { data, error } = await query
      if (error) throw error
      return data as (Blockage & { member?: { id: string; full_name: string } })[]
    },
    enabled: !!interviewId,
  })
}

export function useCreateBlockage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: BlockageFormData) => {
      const { data: result, error } = await supabase.from('blockages').insert(data).select().single()
      if (error) throw error
      return result as Blockage
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockages'] })
      queryClient.invalidateQueries({ queryKey: ['interviews'] })
      toast.success('Blocage ajouté')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useUpdateBlockage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Blockage> & { id: string }) => {
      const { data: result, error } = await supabase.from('blockages').update(data).eq('id', id).select().single()
      if (error) throw error
      return result as Blockage
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockages'] })
      toast.success('Blocage mis à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}
