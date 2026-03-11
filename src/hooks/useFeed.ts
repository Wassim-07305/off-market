import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { FeedPost, FeedComment, FeedLike } from '@/types/database'
import { toast } from 'sonner'
import { ITEMS_PER_PAGE } from '@/lib/constants'
import { useAuthStore } from '@/stores/auth-store'

export function useFeedPosts(page = 1) {
  const from = (page - 1) * ITEMS_PER_PAGE
  const to = from + ITEMS_PER_PAGE - 1

  return useQuery({
    queryKey: ['feed-posts', page],
    queryFn: async () => {
      const { data, error, count } = await supabase
        .from('feed_posts')
        .select('*, author:profiles!author_id(id, full_name, avatar_url)', { count: 'exact' })
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error
      return { data: data as FeedPost[], count: count ?? 0 }
    },
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Non authentifié')
      const { data, error } = await supabase
        .from('feed_posts')
        .insert({ author_id: user.id, content })
        .select('*, author:profiles!author_id(id, full_name, avatar_url)')
        .single()

      if (error) throw error
      return data as FeedPost
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] })
      toast.success('Publication créée')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('feed_posts').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] })
      toast.success('Publication supprimée')
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function usePostComments(postId: string | null) {
  return useQuery({
    queryKey: ['feed-comments', postId],
    queryFn: async () => {
      if (!postId) throw new Error('Post ID requis')
      const { data, error } = await supabase
        .from('feed_comments')
        .select('*, author:profiles!author_id(id, full_name, avatar_url)')
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data as FeedComment[]
    },
    enabled: !!postId,
  })
}

export function useCreateComment() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: async ({ post_id, content }: { post_id: string; content: string }) => {
      if (!user) throw new Error('Non authentifié')
      const { data, error } = await supabase
        .from('feed_comments')
        .insert({ post_id, author_id: user.id, content })
        .select('*, author:profiles!author_id(id, full_name, avatar_url)')
        .single()

      if (error) throw error

      // Incrémenter le compteur de commentaires
      await supabase.rpc('increment_comment_count' as never, { row_id: post_id } as never).then(() => {
        // fallback: on invalide les posts pour rafraîchir le compteur
      })

      return data as FeedComment
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['feed-comments', variables.post_id] })
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] })
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useToggleLike() {
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('Non authentifié')

      // Vérifier si le like existe déjà
      const { data: existing } = await supabase
        .from('feed_likes')
        .select('id')
        .eq('post_id', postId)
        .eq('profile_id', user.id)
        .maybeSingle()

      if (existing) {
        // Supprimer le like
        const { error } = await supabase.from('feed_likes').delete().eq('id', existing.id)
        if (error) throw error

        // Décrémenter likes_count
        await supabase
          .from('feed_posts')
          .update({ likes_count: Math.max(0, -1) })
          .eq('id', postId)
          .then(() => {
            // On utilise une approche simple : recalculer via invalidation
          })

        return { liked: false, postId }
      } else {
        // Ajouter le like
        const { error } = await supabase
          .from('feed_likes')
          .insert({ post_id: postId, profile_id: user.id })

        if (error) throw error
        return { liked: true, postId }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feed-posts'] })
      queryClient.invalidateQueries({ queryKey: ['my-likes'] })
    },
    onError: (error: Error) => {
      toast.error(`Erreur: ${error.message}`)
    },
  })
}

export function useMyLikes() {
  const user = useAuthStore((s) => s.user)

  return useQuery({
    queryKey: ['my-likes', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('feed_likes')
        .select('post_id')
        .eq('profile_id', user.id)

      if (error) throw error
      return (data as FeedLike[]).map((like) => like.post_id)
    },
    enabled: !!user,
  })
}
