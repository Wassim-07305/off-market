import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { AIConversation, AIMessage } from '@/types/database'
import { toast } from 'sonner'

export function useConversations() {
  return useQuery({
    queryKey: ['ai-conversations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) throw error
      return data as AIConversation[]
    },
  })
}

export function useConversationMessages(conversationId: string | null) {
  return useQuery({
    queryKey: ['ai-messages', conversationId],
    queryFn: async () => {
      if (!conversationId) throw new Error('ID de conversation requis')

      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as AIMessage[]
    },
    enabled: !!conversationId,
  })
}

export function useCreateConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (title?: string) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: user.id,
          title: title || 'Nouvelle conversation',
        })
        .select()
        .single()

      if (error) throw error
      return data as AIConversation
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] })
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      conversationId,
      content,
    }: {
      conversationId: string
      content: string
    }) => {
      // 1. Insérer le message utilisateur
      const { data: userMessage, error: userError } = await supabase
        .from('ai_messages')
        .insert({
          conversation_id: conversationId,
          role: 'user',
          content,
        })
        .select()
        .single()

      if (userError) throw userError

      // 2. Mettre à jour le titre si c'est le premier message
      const { data: existingMessages } = await supabase
        .from('ai_messages')
        .select('id')
        .eq('conversation_id', conversationId)
        .eq('role', 'user')

      if (existingMessages && existingMessages.length === 1) {
        const title = content.length > 50 ? content.slice(0, 50) + '...' : content
        await supabase
          .from('ai_conversations')
          .update({ title, updated_at: new Date().toISOString() })
          .eq('id', conversationId)
      } else {
        await supabase
          .from('ai_conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId)
      }

      // 3. Insérer une réponse placeholder de l'assistant
      const { data: assistantMessage, error: assistantError } = await supabase
        .from('ai_messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content:
            "Je suis l'assistant Off-Market. Cette fonctionnalité sera bientôt connectée à l'IA.",
        })
        .select()
        .single()

      if (assistantError) throw assistantError

      return { userMessage, assistantMessage }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['ai-messages', variables.conversationId],
      })
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] })
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useDeleteConversation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      // Supprimer les messages d'abord (cascade devrait gérer, mais par sécurité)
      const { error: msgError } = await supabase
        .from('ai_messages')
        .delete()
        .eq('conversation_id', id)

      if (msgError) throw msgError

      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] })
      toast.success('Conversation supprimée')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}
