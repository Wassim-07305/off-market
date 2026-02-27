"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useFeed, useComments } from "@/hooks/use-feed";
import { useAuth } from "@/hooks/use-auth";
import { POST_TYPE_CONFIG } from "@/types/feed";
import type { FeedPost, FeedComment, PostType } from "@/types/feed";
import {
  Heart,
  MessageCircle,
  Send,
  Pin,
  Trash2,
  MoreHorizontal,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const TYPE_FILTERS: { label: string; value: PostType | "all" }[] = [
  { label: "Tout", value: "all" },
  { label: "Victoires", value: "victory" },
  { label: "Questions", value: "question" },
  { label: "Experiences", value: "experience" },
  { label: "General", value: "general" },
];

function timeAgo(date: string) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "a l'instant";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes}min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `il y a ${days}j`;
  return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

export default function FeedPage() {
  const { user, profile } = useAuth();
  const [typeFilter, setTypeFilter] = useState<PostType | "all">("all");
  const { posts, isLoading, createPost, deletePost, togglePin, toggleLike } = useFeed(
    typeFilter === "all" ? undefined : typeFilter
  );

  const isStaff = profile?.role === "admin" || profile?.role === "coach";

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">Feed</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Partagez vos victoires et echangez avec la communaute
        </p>
      </motion.div>

      {/* Composer */}
      <motion.div variants={staggerItem}>
        <PostComposer
          onSubmit={(content, postType) => createPost.mutate({ content, post_type: postType })}
          isSubmitting={createPost.isPending}
        />
      </motion.div>

      {/* Filters */}
      <motion.div
        variants={staggerItem}
        className="flex gap-1.5 overflow-x-auto pb-1"
      >
        {TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setTypeFilter(f.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
              typeFilter === f.value
                ? "bg-primary text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {f.value !== "all" && `${POST_TYPE_CONFIG[f.value].emoji} `}
            {f.label}
          </button>
        ))}
      </motion.div>

      {/* Posts */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-surface rounded-2xl p-6" style={{ boxShadow: "var(--shadow-card)" }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-muted animate-shimmer" />
                <div className="space-y-1.5">
                  <div className="h-3 w-24 bg-muted animate-shimmer rounded-lg" />
                  <div className="h-2.5 w-16 bg-muted animate-shimmer rounded-lg" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-muted animate-shimmer rounded-lg" />
                <div className="h-3 w-3/4 bg-muted animate-shimmer rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <motion.div
          variants={staggerItem}
          className="bg-surface rounded-2xl p-12 text-center"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <p className="text-sm text-muted-foreground">
            Aucune publication pour le moment. Soyez le premier a poster !
          </p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                layout
                variants={staggerItem}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <PostCard
                  post={post}
                  isStaff={isStaff}
                  currentUserId={user?.id}
                  onLike={() =>
                    toggleLike.mutate({ postId: post.id, isLiked: post.is_liked ?? false })
                  }
                  onPin={() => togglePin.mutate({ postId: post.id, isPinned: post.is_pinned })}
                  onDelete={() => deletePost.mutate(post.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

// ─── Post Composer ────────────────────
function PostComposer({
  onSubmit,
  isSubmitting,
}: {
  onSubmit: (content: string, postType: PostType) => void;
  isSubmitting: boolean;
}) {
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<PostType>("general");
  const [expanded, setExpanded] = useState(false);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onSubmit(content.trim(), postType);
    setContent("");
    setPostType("general");
    setExpanded(false);
  };

  return (
    <div className="bg-surface rounded-2xl p-4" style={{ boxShadow: "var(--shadow-card)" }}>
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (!expanded && e.target.value) setExpanded(true);
        }}
        onFocus={() => setExpanded(true)}
        placeholder="Partagez quelque chose avec la communaute..."
        rows={expanded ? 4 : 2}
        className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
      />

      {expanded && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <div className="flex gap-1">
            {(Object.entries(POST_TYPE_CONFIG) as [PostType, typeof POST_TYPE_CONFIG.general][]).map(
              ([type, config]) => (
                <button
                  key={type}
                  onClick={() => setPostType(type)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                    postType === type ? config.color : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {config.emoji} {config.label}
                </button>
              )
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="h-8 px-4 bg-primary text-white rounded-xl text-xs font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-1"
          >
            <Send className="w-3 h-3" />
            {isSubmitting ? "..." : "Publier"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Post Card ────────────────────────
function PostCard({
  post,
  isStaff,
  currentUserId,
  onLike,
  onPin,
  onDelete,
}: {
  post: FeedPost;
  isStaff: boolean;
  currentUserId?: string;
  onLike: () => void;
  onPin: () => void;
  onDelete: () => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const isAuthor = currentUserId === post.author_id;
  const typeConfig = POST_TYPE_CONFIG[post.post_type];

  return (
    <div className="bg-surface rounded-2xl" style={{ boxShadow: "var(--shadow-card)" }}>
      {/* Pinned indicator */}
      {post.is_pinned && (
        <div className="px-4 pt-3 flex items-center gap-1 text-xs text-amber-600">
          <Pin className="w-3 h-3" />
          Epingle
        </div>
      )}

      <div className="p-5">
        {/* Author row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {post.author?.avatar_url ? (
              <img
                src={post.author.avatar_url}
                alt=""
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-sm text-primary font-semibold">
                {post.author?.full_name?.charAt(0) ?? "?"}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">
                  {post.author?.full_name ?? "Utilisateur"}
                </p>
                {post.author?.role && (post.author.role === "admin" || post.author.role === "coach") && (
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                    {post.author.role === "admin" ? "Admin" : "Coach"}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">{timeAgo(post.created_at)}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${typeConfig.color}`}>
                  {typeConfig.emoji} {typeConfig.label}
                </span>
              </div>
            </div>
          </div>

          {/* Menu */}
          {(isAuthor || isStaff) && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-8 z-20 bg-surface rounded-xl py-1 min-w-[140px]" style={{ boxShadow: "var(--shadow-elevated)" }}>
                    {isStaff && (
                      <button
                        onClick={() => {
                          onPin();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                      >
                        <Pin className="w-3.5 h-3.5" />
                        {post.is_pinned ? "Desepingler" : "Epingler"}
                      </button>
                    )}
                    {(isAuthor || isStaff) && (
                      <button
                        onClick={() => {
                          onDelete();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-muted transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Supprimer
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
          {post.content}
        </p>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/30">
          <button
            onClick={onLike}
            className={`flex items-center gap-1.5 text-sm transition-all ${
              post.is_liked
                ? "text-red-500 scale-105"
                : "text-muted-foreground hover:text-red-500"
            }`}
          >
            <Heart className={`w-4 h-4 transition-transform ${post.is_liked ? "fill-current scale-110" : ""}`} />
            {post.likes_count > 0 && <span className="font-mono text-xs">{post.likes_count}</span>}
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            {post.comments_count > 0 && <span className="font-mono text-xs">{post.comments_count}</span>}
            {showComments ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-border/30">
          <CommentsSection postId={post.id} />
        </div>
      )}
    </div>
  );
}

// ─── Comments Section ─────────────────
function CommentsSection({ postId }: { postId: string }) {
  const { comments, isLoading, addComment, deleteComment } = useComments(postId);
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!newComment.trim()) return;
    addComment.mutate(
      { content: newComment.trim(), parentId: replyTo ?? undefined },
      {
        onSuccess: () => {
          setNewComment("");
          setReplyTo(null);
        },
      }
    );
  };

  return (
    <div className="p-4 space-y-3">
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-10 bg-muted animate-shimmer rounded-lg" />
          ))}
        </div>
      ) : (
        comments.map((comment) => (
          <div key={comment.id}>
            <CommentItem
              comment={comment}
              currentUserId={user?.id}
              onReply={() => setReplyTo(comment.id)}
              onDelete={() => deleteComment.mutate(comment.id)}
            />
            {/* Replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="ml-8 mt-2 space-y-2 border-l-2 border-border/30 pl-3">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    currentUserId={user?.id}
                    onDelete={() => deleteComment.mutate(reply.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* Comment input */}
      <div className="flex items-start gap-2 pt-2">
        <div className="flex-1">
          {replyTo && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
              Reponse a un commentaire
              <button onClick={() => setReplyTo(null)} className="text-error hover:text-error/80">
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex gap-2">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
              placeholder="Ecrire un commentaire..."
              className="flex-1 h-9 px-3 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
            />
            <button
              onClick={handleSubmit}
              disabled={!newComment.trim() || addComment.isPending}
              className="h-9 w-9 flex items-center justify-center bg-primary text-white rounded-xl hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Comment Item ─────────────────────
function CommentItem({
  comment,
  currentUserId,
  onReply,
  onDelete,
}: {
  comment: FeedComment;
  currentUserId?: string;
  onReply?: () => void;
  onDelete: () => void;
}) {
  const isAuthor = currentUserId === comment.author_id;

  return (
    <div className="flex items-start gap-2 group">
      {comment.author?.avatar_url ? (
        <img
          src={comment.author.avatar_url}
          alt=""
          className="w-7 h-7 rounded-full object-cover mt-0.5"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-[10px] text-primary font-semibold mt-0.5">
          {comment.author?.full_name?.charAt(0) ?? "?"}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="bg-muted/40 rounded-xl px-3 py-2">
          <div className="flex items-center gap-1.5">
            <p className="text-xs font-medium text-foreground">
              {comment.author?.full_name ?? "Utilisateur"}
            </p>
            <span className="text-[10px] text-muted-foreground font-mono">{timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-sm text-foreground mt-0.5">{comment.content}</p>
        </div>
        <div className="flex items-center gap-3 mt-1 ml-1">
          {onReply && (
            <button
              onClick={onReply}
              className="text-[11px] text-muted-foreground hover:text-foreground transition-colors"
            >
              Repondre
            </button>
          )}
          {isAuthor && (
            <button
              onClick={onDelete}
              className="text-[11px] text-muted-foreground hover:text-error transition-colors opacity-0 group-hover:opacity-100"
            >
              Supprimer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
