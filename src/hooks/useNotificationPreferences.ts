import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import type { NotificationPreferences } from '@/types/database'
import { DEFAULT_NOTIFICATION_PREFERENCES } from '@/types/database'

export function useNotificationPreferences() {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['notification-preferences', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('notification_preferences')
        .eq('id', user!.id)
        .single()

      if (error) throw error

      return (data?.notification_preferences as NotificationPreferences | null)
        ?? DEFAULT_NOTIFICATION_PREFERENCES
    },
  })
}

export function useUpdateNotificationPreferences() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (prefs: NotificationPreferences) => {
      if (!user) throw new Error('Non authentifié')

      const { error } = await supabase
        .from('profiles')
        .update({ notification_preferences: prefs as unknown as Record<string, unknown> })
        .eq('id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] })
      toast.success('Préférences mises à jour')
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour des préférences')
    },
  })
}
