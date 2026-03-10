import { useState, useCallback } from 'react'
import { Heart, MessageCircle, Pin, Send, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeDate, getInitials } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton, SkeletonText, SkeletonAvatar } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import {
  useFeedPosts,
  useCreatePost,
  useDeletePost,
  usePostComments,
  useCreateComment,
  useToggleLike,
  useMyLikes,
} from '@/hooks/useFeed'
import { useAuthStore } from '@/stores/auth-store'
import type { FeedPost, FeedComment } from '@/types/database'
import { ITEMS_PER_PAGE } from '@/lib/constants'

// ─── Composeur de post ───────────────────────────────────────────

function PostComposer() {
  const [content, setContent] = useState('')
  const createPost = useCreatePost()

  const handleSubmit = useCallback(() => {
    const trimmed = content.trim()
    if (!trimmed) return
    createPost.mutate(trimmed, {
      onSuccess: () => setContent(''),
    })
  }, [content, createPost])

  return (
    <Card>
      <CardContent className="pt-5">
        <Textarea
          placeholder="Partagez quelque chose avec la communauté..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          autoGrow
          className="min-h-[60px] resize-none border-0 bg-muted/30 focus:ring-1"
        />
        <div className="mt-3 flex justify-end">
          <Button
            size="sm"
            disabled={!content.trim()}
            loading={createPost.isPending}
            onClick={handleSubmit}
            icon={<Send className="h-3.5 w-3.5" />}
          >
            Publier
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Avatar ──────────────────────────────────────────────────────

function UserAvatar({
  name,
  avatarUrl,
  size = 'md',
}: {
  name: string
  avatarUrl?: string | null
  size?: 'sm' | 'md'
}) {
  const sizeClasses = size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={cn('rounded-full object-cover', sizeClasses)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-primary/10 font-semibold text-primary',
        sizeClasses
      )}
    >
      {getInitials(name)}
    </div>
  )
}

// ─── Section commentaires ────────────────────────────────────────

function CommentSection({ postId }: { postId: string }) {
  const { data: comments, isLoading } = usePostComments(postId)
  const createComment = useCreateComment()
  const [commentText, setCommentText] = useState('')

  const handleSubmitComment = useCallback(() => {
    const trimmed = commentText.trim()
    if (!trimmed) return
    createComment.mutate(
      { post_id: postId, content: trimmed },
      { onSuccess: () => setCommentText('') }
    )
  }, [commentText, postId, createComment])

  return (
    <div className="border-t border-border/50 px-6 pb-4 pt-3">
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-2">
              <SkeletonAvatar size="sm" />
              <SkeletonText lines={1} className="flex-1" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {comments?.map((comment: FeedComment) => (
            <div key={comment.id} className="flex gap-2.5">
              <UserAvatar
                name={comment.author?.full_name ?? 'Utilisateur'}
                avatarUrl={comment.author?.avatar_url}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <div className="rounded-xl bg-muted/40 px-3 py-2">
                  <p className="text-xs font-semibold text-foreground">
                    {comment.author?.full_name ?? 'Utilisateur'}
                  </p>
                  <p className="text-sm text-foreground/80 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {formatRelativeDate(comment.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Champ de saisie du commentaire */}
      <div className="mt-3 flex items-center gap-2">
        <Textarea
          placeholder="Écrire un commentaire..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className="min-h-[36px] max-h-[120px] resize-none py-2 text-sm"
          autoGrow
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmitComment()
            }
          }}
        />
        <Button
          variant="ghost"
          size="sm"
          disabled={!commentText.trim()}
          loading={createComment.isPending}
          onClick={handleSubmitComment}
          className="shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

// ─── Carte de post ───────────────────────────────────────────────

function PostCard({
  post,
  isLiked,
}: {
  post: FeedPost
  isLiked: boolean
}) {
  const [showComments, setShowComments] = useState(false)
  const toggleLike = useToggleLike()
  const deletePost = useDeletePost()
  const user = useAuthStore((s) => s.user)
  const isAuthor = user?.id === post.author_id

  return (
    <Card className="overflow-hidden">
      {/* En-tête du post */}
      <div className="flex items-start justify-between px-6 pt-5 pb-2">
        <div className="flex items-center gap-3">
          <UserAvatar
            name={post.author?.full_name ?? 'Utilisateur'}
            avatarUrl={post.author?.avatar_url}
          />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">
                {post.author?.full_name ?? 'Utilisateur'}
              </p>
              {post.is_pinned && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">
                  <Pin className="h-3 w-3" />
                  Épinglé
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {formatRelativeDate(post.created_at)}
            </p>
          </div>
        </div>

        {isAuthor && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
            onClick={() => deletePost.mutate(post.id)}
            loading={deletePost.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Contenu */}
      <CardContent className="pb-3">
        <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </CardContent>

      {/* Compteurs */}
      {(post.likes_count > 0 || post.comments_count > 0) && (
        <div className="flex items-center justify-between px-6 pb-2 text-xs text-muted-foreground">
          <span>
            {post.likes_count > 0
              ? `${post.likes_count} j'aime${post.likes_count > 1 ? '' : ''}`
              : ''}
          </span>
          <span>
            {post.comments_count > 0
              ? `${post.comments_count} commentaire${post.comments_count > 1 ? 's' : ''}`
              : ''}
          </span>
        </div>
      )}

      {/* Boutons d'interaction */}
      <div className="flex items-center border-t border-border/50 px-2">
        <button
          onClick={() => toggleLike.mutate(post.id)}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors rounded-lg mx-1 my-1',
            'hover:bg-muted/60',
            isLiked
              ? 'text-red-500'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Heart
            className={cn('h-4.5 w-4.5', isLiked && 'fill-current')}
          />
          J&apos;aime
        </button>
        <button
          onClick={() => setShowComments(!showComments)}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors rounded-lg mx-1 my-1',
            'text-muted-foreground hover:text-foreground hover:bg-muted/60',
            showComments && 'text-primary'
          )}
        >
          <MessageCircle className="h-4.5 w-4.5" />
          Commenter
        </button>
      </div>

      {/* Section commentaires */}
      {showComments && <CommentSection postId={post.id} />}
    </Card>
  )
}

// ─── Skeleton de post ────────────────────────────────────────────

function PostSkeleton() {
  return (
    <Card>
      <div className="px-6 pt-5 pb-2">
        <div className="flex items-center gap-3">
          <SkeletonAvatar />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
      </div>
      <CardContent>
        <SkeletonText lines={3} />
      </CardContent>
    </Card>
  )
}

// ─── Page Feed ───────────────────────────────────────────────────

export default function FeedPage() {
  const [page, setPage] = useState(1)
  const { data, isLoading, isPending } = useFeedPosts(page)
  const { data: likedPostIds = [] } = useMyLikes()

  const posts = data?.data ?? []
  const totalCount = data?.count ?? 0
  const hasMore = page * ITEMS_PER_PAGE < totalCount

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Communauté</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Échangez avec les autres membres, partagez vos victoires et posez vos questions.
        </p>
      </div>

      {/* Composeur */}
      <PostComposer />

      {/* Liste des posts */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <EmptyState
          icon={<MessageCircle className="h-6 w-6" />}
          title="Aucune publication"
          description="Soyez le premier à publier quelque chose dans la communauté !"
        />
      ) : (
        <div className="space-y-4">
          {posts.map((post: FeedPost) => (
            <PostCard
              key={post.id}
              post={post}
              isLiked={likedPostIds.includes(post.id)}
            />
          ))}

          {/* Charger plus */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="secondary"
                onClick={() => setPage((p) => p + 1)}
                loading={isPending}
              >
                Charger plus
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
