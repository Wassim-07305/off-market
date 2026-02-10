import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ModuleItem } from '@/types/database'
import { toast } from 'sonner'

export function useModuleItems(moduleId: string | undefined) {
  return useQuery({
    queryKey: ['module-items', moduleId],
    queryFn: async () => {
      if (!moduleId) return []
      const { data, error } = await supabase
        .from('module_items')
        .select('*')
        .eq('module_id', moduleId)
        .order('sort_order', { ascending: true })
      if (error) throw error
      return data as ModuleItem[]
    },
    enabled: !!moduleId,
  })
}

export function useAllModuleItems(moduleIds: string[]) {
  return useQuery({
    queryKey: ['module-items', 'all', moduleIds],
    queryFn: async () => {
      if (moduleIds.length === 0) return []
      const { data, error } = await supabase
        .from('module_items')
        .select('*')
        .in('module_id', moduleIds)
        .order('sort_order', { ascending: true })
      if (error) throw error
      return data as ModuleItem[]
    },
    enabled: moduleIds.length > 0,
  })
}

export function useCreateModuleItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { module_id: string; title: string; type?: 'video' | 'document'; url?: string; duration?: number; sort_order?: number }) => {
      const { data: result, error } = await supabase.from('module_items').insert(data).select().single()
      if (error) throw error
      return result as ModuleItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-items'] })
      toast.success('Item créé')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useUpdateModuleItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<ModuleItem> & { id: string }) => {
      const { data: result, error } = await supabase.from('module_items').update(data).eq('id', id).select().single()
      if (error) throw error
      return result as ModuleItem
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-items'] })
      toast.success('Item mis à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useDeleteModuleItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('module_items').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['module-items'] })
      toast.success('Item supprimé')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}
