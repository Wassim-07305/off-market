import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import type { MessageReactionWithUser } from '@/types/database'

export const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🎉'] as const

export function useMessageReactions(messageId: string) {
  return useQuery({
    queryKey: ['message-reactions', messageId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('message_reactions')
        .select(`
          *,
          user:profiles!user_id(id, full_name, avatar_url)
        `)
        .eq('message_id', messageId)

      if (error) throw error
      return (data ?? []) as MessageReactionWithUser[]
    },
    enabled: !!messageId,
  })
}

export function useToggleReaction() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      if (!user) throw new Error('Non authentifié')

      // Check if reaction already exists
      const { data: existing } = await supabase
        .from('message_reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .maybeSingle()

      if (existing) {
        // Remove reaction
        const { error } = await supabase
          .from('message_reactions')
          .delete()
          .eq('id', existing.id)
        if (error) throw error
        return { action: 'removed' as const }
      } else {
        // Add reaction
        const { error } = await supabase
          .from('message_reactions')
          .insert({ message_id: messageId, user_id: user.id, emoji })
        if (error) throw error
        return { action: 'added' as const }
      }
    },
    onSuccess: (_, { messageId }) => {
      queryClient.invalidateQueries({ queryKey: ['message-reactions', messageId] })
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    },
  })
}

// Group reactions by emoji with counts and users
export function groupReactions(reactions: MessageReactionWithUser[], currentUserId: string | undefined) {
  const groups = new Map<string, { count: number; users: string[]; hasReacted: boolean }>()

  for (const reaction of reactions) {
    const existing = groups.get(reaction.emoji) ?? { count: 0, users: [], hasReacted: false }
    existing.count++
    if (reaction.user?.full_name) {
      existing.users.push(reaction.user.full_name)
    }
    if (reaction.user_id === currentUserId) {
      existing.hasReacted = true
    }
    groups.set(reaction.emoji, existing)
  }

  return Array.from(groups.entries()).map(([emoji, data]) => ({
    emoji,
    ...data,
  }))
}
