import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Channel, ChannelWithDetails } from '@/types/database'
import type { ChannelFormData } from '@/types/forms'
import { toast } from 'sonner'

export function useChannels() {
  return useQuery({
    queryKey: ['channels'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_channels')
      if (error) throw error
      return (data as unknown as ChannelWithDetails[]) ?? []
    },
  })
}

export function useCreateChannel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ChannelFormData) => {
      const { member_ids, ...channelData } = data

      // Create channel
      const { data: channel, error: channelError } = await supabase
        .from('channels')
        .insert(channelData)
        .select()
        .single()
      if (channelError) throw channelError

      // Add members
      const members = member_ids.map((userId) => ({
        channel_id: channel.id,
        user_id: userId,
      }))
      const { error: membersError } = await supabase.from('channel_members').insert(members)
      if (membersError) throw membersError

      return channel as Channel
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] })
      toast.success('Canal créé')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useUpdateChannel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Channel> & { id: string }) => {
      const { data: result, error } = await supabase.from('channels').update(data).eq('id', id).select().single()
      if (error) throw error
      return result as Channel
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] })
      toast.success('Canal mis à jour')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useDeleteChannel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('channels').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] })
      toast.success('Canal supprimé')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useAddChannelMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ channelId, userId }: { channelId: string; userId: string }) => {
      const { error } = await supabase.from('channel_members').insert({ channel_id: channelId, user_id: userId })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] })
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useRemoveChannelMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ channelId, userId }: { channelId: string; userId: string }) => {
      const { error } = await supabase
        .from('channel_members')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', userId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['channels'] })
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}
