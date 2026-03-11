import { useEffect, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Notification } from '@/types/database'
import { useNotificationStore } from '@/stores/notification-store'
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences'
import { playNotificationSound } from '@/lib/notification-sound'
import { toast } from 'sonner'

export function useNotifications(userId: string | undefined) {
  const { setNotifications, setUnreadCount, addNotification } = useNotificationStore()
  const queryClient = useQueryClient()
  const { data: prefs } = useNotificationPreferences()
  const prefsRef = useRef(prefs)

  // Keep prefs ref updated
  useEffect(() => {
    prefsRef.current = prefs
  }, [prefs])

  const query = useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      if (!userId) return []
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      return data as Notification[]
    },
    enabled: !!userId,
  })

  // Sync with store
  useEffect(() => {
    if (query.data) {
      setNotifications(query.data)
      setUnreadCount(query.data.filter((n) => !n.is_read).length)
    }
  }, [query.data, setNotifications, setUnreadCount])

  // Realtime subscription
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel('notifications-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const notification = payload.new as Notification
          addNotification(notification)
          queryClient.invalidateQueries({ queryKey: ['notifications', userId] })
          toast.info(notification.title, { description: notification.message ?? undefined })

          // Play notification sound if enabled
          if (prefsRef.current?.sound_enabled !== false) {
            playNotificationSound()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, addNotification, queryClient])

  return query
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId).eq('is_read', false)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
