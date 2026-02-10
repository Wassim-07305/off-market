import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Profile, UserRole, AppRole } from '@/types/database'
import { toast } from 'sonner'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true })

      if (profilesError) throw profilesError

      const { data: roles, error: rolesError } = await supabase.from('user_roles').select('*')
      if (rolesError) throw rolesError

      return (profiles as Profile[]).map((profile) => ({
        ...profile,
        role: (roles as UserRole[]).find((r) => r.user_id === profile.id)?.role ?? 'eleve' as AppRole,
      }))
    },
  })
}

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('id, full_name, avatar_url, email').order('full_name')
      if (error) throw error
      return data as Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'email'>[]
    },
  })
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase.from('user_roles').upsert({ user_id: userId, role }, { onConflict: 'user_id' })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      toast.success('Rôle mis à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Profile> & { id: string }) => {
      const { data: result, error } = await supabase.from('profiles').update(data).eq('id', id).select().single()
      if (error) throw error
      return result as Profile
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['profiles'] })
      toast.success('Profil mis à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}
