import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Form, FormField, FormSubmission, FormWithFields } from '@/types/database'
import { toast } from 'sonner'
import { ITEMS_PER_PAGE } from '@/lib/constants'

interface FormFilters {
  search?: string
  status?: string
  page?: number
}

export function useForms(filters: FormFilters = {}) {
  const { search, status, page = 1 } = filters
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  return useQuery({
    queryKey: ['forms', filters],
    queryFn: async () => {
      let query = supabase
        .from('forms')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (search) {
        query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
      }
      if (status) {
        query = query.eq('status', status)
      }

      const { data, error, count } = await query
      if (error) throw error
      return { data: data as Form[], count: count ?? 0 }
    },
  })
}

export function useFormWithFields(formId: string | undefined) {
  return useQuery({
    queryKey: ['forms', formId, 'fields'],
    queryFn: async () => {
      if (!formId) throw new Error('ID requis')

      const [formResult, fieldsResult] = await Promise.all([
        supabase.from('forms').select('*').eq('id', formId).single(),
        supabase.from('form_fields').select('*').eq('form_id', formId).order('sort_order', { ascending: true }),
      ])

      if (formResult.error) throw formResult.error
      if (fieldsResult.error) throw fieldsResult.error

      return {
        ...formResult.data,
        fields: fieldsResult.data as FormField[],
      } as FormWithFields
    },
    enabled: !!formId,
  })
}

export function useFormSubmissions(formId: string | undefined) {
  return useQuery({
    queryKey: ['forms', formId, 'submissions'],
    queryFn: async () => {
      if (!formId) throw new Error('ID requis')

      const { data, error, count } = await supabase
        .from('form_submissions')
        .select('*', { count: 'exact' })
        .eq('form_id', formId)
        .order('submitted_at', { ascending: false })

      if (error) throw error
      return { data: data as FormSubmission[], count: count ?? 0 }
    },
    enabled: !!formId,
  })
}

export function useCreateForm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { title: string; description?: string }) => {
      const { data: result, error } = await supabase
        .from('forms')
        .insert({
          title: data.title,
          description: data.description ?? null,
          status: 'brouillon',
        })
        .select()
        .single()
      if (error) throw error
      return result as Form
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] })
      toast.success('Formulaire créé avec succès')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useUpdateForm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Form> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('forms')
        .update(data)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return result as Form
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['forms'] })
      queryClient.setQueryData(['forms', data.id, 'fields'], undefined)
      toast.success('Formulaire mis à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useDeleteForm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('forms').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forms'] })
      toast.success('Formulaire supprimé')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useCreateFormField() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Omit<FormField, 'id' | 'created_at'>) => {
      const { data: result, error } = await supabase
        .from('form_fields')
        .insert(data)
        .select()
        .single()
      if (error) throw error
      return result as FormField
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['forms', data.form_id, 'fields'] })
      toast.success('Champ ajouté')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useUpdateFormField() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<FormField> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('form_fields')
        .update(data)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return result as FormField
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['forms', data.form_id, 'fields'] })
      toast.success('Champ mis à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useDeleteFormField() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, formId }: { id: string; formId: string }) => {
      const { error } = await supabase.from('form_fields').delete().eq('id', id)
      if (error) throw error
      return { formId }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['forms', data.formId, 'fields'] })
      toast.success('Champ supprimé')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useSubmitForm() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { form_id: string; answers: Record<string, unknown> }) => {
      const { data: result, error } = await supabase
        .from('form_submissions')
        .insert({
          form_id: data.form_id,
          answers: data.answers,
        })
        .select()
        .single()
      if (error) throw error
      return result as FormSubmission
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['forms', data.form_id, 'submissions'] })
      toast.success('Réponse envoyée avec succès')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}
