import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ItemCompletion } from '@/types/database'
import { useAuthStore } from '@/stores/auth-store'

export function useUserCompletions(userId?: string) {
  const currentUserId = useAuthStore((s) => s.user?.id)
  const targetId = userId || currentUserId

  return useQuery({
    queryKey: ['item-completions', targetId],
    queryFn: async () => {
      if (!targetId) return []
      const { data, error } = await supabase
        .from('item_completions')
        .select('*')
        .eq('user_id', targetId)
      if (error) throw error
      return data as ItemCompletion[]
    },
    enabled: !!targetId,
  })
}

export function useToggleCompletion() {
  const queryClient = useQueryClient()
  const userId = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async ({ itemId, completed }: { itemId: string; completed: boolean }) => {
      if (!userId) throw new Error('Non authentifié')

      if (completed) {
        // Mark as completed
        const { error } = await supabase.from('item_completions').insert({ item_id: itemId, user_id: userId })
        if (error) throw error
      } else {
        // Remove completion
        const { error } = await supabase
          .from('item_completions')
          .delete()
          .eq('item_id', itemId)
          .eq('user_id', userId)
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-completions'] })
      queryClient.invalidateQueries({ queryKey: ['formation-progress'] })
    },
  })
}
