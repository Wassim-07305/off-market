import { useEffect } from 'react'
import { useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Message, MessageWithSender } from '@/types/database'
import { toast } from 'sonner'

const MESSAGES_PER_PAGE = 50

export function useMessages(channelId: string | null) {
  const queryClient = useQueryClient()

  const query = useInfiniteQuery({
    queryKey: ['messages', channelId],
    queryFn: async ({ pageParam = 0 }) => {
      if (!channelId) return { data: [], nextOffset: null }

      const from = pageParam
      const to = from + MESSAGES_PER_PAGE - 1

      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:profiles!sender_id(id, full_name, avatar_url, email)')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      return {
        data: (data as MessageWithSender[]).reverse(),
        nextOffset: data.length === MESSAGES_PER_PAGE ? from + MESSAGES_PER_PAGE : null,
      }
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextOffset,
    enabled: !!channelId,
  })

  // Realtime subscription for new messages
  useEffect(() => {
    if (!channelId) return

    const channel = supabase
      .channel(`messages-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', channelId] })
          queryClient.invalidateQueries({ queryKey: ['channels'] })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', channelId] })
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'messages',
          filter: `channel_id=eq.${channelId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', channelId] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelId, queryClient])

  return query
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      channelId,
      content,
      senderId,
      fileUrl,
      fileName,
    }: {
      channelId: string
      content?: string
      senderId: string
      fileUrl?: string
      fileName?: string
    }) => {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          channel_id: channelId,
          sender_id: senderId,
          content: content || null,
          file_url: fileUrl || null,
          file_name: fileName || null,
        })
        .select()
        .single()
      if (error) throw error
      return data as Message
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['messages', variables.channelId] })
      queryClient.invalidateQueries({ queryKey: ['channels'] })
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useEditMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, content, channelId }: { id: string; content: string; channelId: string }) => {
      const { error } = await supabase.from('messages').update({ content, is_edited: true }).eq('id', id)
      if (error) throw error
      return channelId
    },
    onSuccess: (channelId) => {
      queryClient.invalidateQueries({ queryKey: ['messages', channelId] })
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useDeleteMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, channelId }: { id: string; channelId: string }) => {
      const { error } = await supabase.from('messages').delete().eq('id', id)
      if (error) throw error
      return channelId
    },
    onSuccess: (channelId) => {
      queryClient.invalidateQueries({ queryKey: ['messages', channelId] })
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}
