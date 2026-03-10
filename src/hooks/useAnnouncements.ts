import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import { useRole } from '@/hooks/useRole'
import type { Announcement } from '@/types/database'
import { toast } from 'sonner'

export function useAnnouncements() {
  const { user } = useAuth()
  const { role } = useRole()

  return useQuery({
    queryKey: ['announcements', user?.id, role],
    queryFn: async () => {
      const now = new Date().toISOString()

      // Get active announcements
      const { data: announcements, error: annError } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .or(`starts_at.is.null,starts_at.lte.${now}`)
        .or(`ends_at.is.null,ends_at.gte.${now}`)
        .order('created_at', { ascending: false })

      if (annError) throw annError

      // Get user's dismissals
      const { data: dismissals, error: disError } = await supabase
        .from('announcement_dismissals')
        .select('announcement_id')
        .eq('user_id', user!.id)

      if (disError) throw disError

      const dismissedIds = new Set(dismissals?.map((d) => d.announcement_id) ?? [])

      // Filter by role and dismissals
      return (announcements as Announcement[])
        .filter((a) => {
          // Check if dismissed
          if (dismissedIds.has(a.id)) return false
          // Check role targeting
          if (!a.target_roles || a.target_roles.length === 0) return true
          return role && a.target_roles.includes(role)
        })
    },
    enabled: !!user?.id && !!role,
  })
}

export function useDismissAnnouncement() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (announcementId: string) => {
      if (!user) throw new Error('Non authentifié')

      const { error } = await supabase
        .from('announcement_dismissals')
        .insert({ announcement_id: announcementId, user_id: user.id })

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
    },
  })
}

export function useCreateAnnouncement() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (data: Omit<Announcement, 'id' | 'created_at' | 'created_by'>) => {
      const { data: result, error } = await supabase
        .from('announcements')
        .insert({ ...data, created_by: user?.id })
        .select()
        .single()

      if (error) throw error
      return result as Announcement
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      toast.success('Annonce créée')
    },
    onError: () => {
      toast.error('Erreur lors de la création')
    },
  })
}

export function useUpdateAnnouncement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Announcement> & { id: string }) => {
      const { error } = await supabase
        .from('announcements')
        .update(data)
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      toast.success('Annonce mise à jour')
    },
    onError: () => {
      toast.error('Erreur lors de la mise à jour')
    },
  })
}

export function useDeleteAnnouncement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      toast.success('Annonce supprimée')
    },
    onError: () => {
      toast.error('Erreur lors de la suppression')
    },
  })
}
