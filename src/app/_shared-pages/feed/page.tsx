"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useFeed } from "@/hooks/use-feed";
import { useAuth } from "@/hooks/use-auth";
import { POST_TYPE_CONFIG } from "@/types/feed";
import type { FeedPost, PostType, FeedSortMode } from "@/types/feed";
import {
  Heart,
  MessageCircle,
  Send,
  Pin,
  Trash2,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Clock,
  TrendingUp,
  ThumbsUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ReportButton } from "@/components/feed/report-modal";
import { CommentThread } from "@/components/feed/comment-thread";
import { TrendingSidebar } from "@/components/feed/trending-sidebar";

const TYPE_FILTERS: { label: string; value: PostType | "all" }[] = [
  { label: "Tout", value: "all" },
  { label: "Victoires", value: "victory" },
  { label: "Questions", value: "question" },
  { label: "Experiences", value: "experience" },
  { label: "General", value: "general" },
];

const SORT_OPTIONS: {
  label: string;
  value: FeedSortMode;
  icon: typeof Clock;
}[] = [
  { label: "Recents", value: "recent", icon: Clock },
  { label: "Tendances", value: "trending", icon: TrendingUp },
  { label: "Plus aimes", value: "most_liked", icon: ThumbsUp },
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
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
  });
}

export default function FeedPage() {
  const { user, profile } = useAuth();
  const [typeFilter, setTypeFilter] = useState<PostType | "all">("all");
  const [sortMode, setSortMode] = useState<FeedSortMode>("recent");
  const feedPostType = typeFilter === "all" ? undefined : typeFilter;
  const { posts, isLoading, createPost, deletePost, togglePin, toggleLike } =
    useFeed(feedPostType, sortMode);

  const isStaff = profile?.role === "admin" || profile?.role === "coach";

  // Scroll to a specific post when clicking from trending sidebar
  const scrollToPost = useCallback((postId: string) => {
    const el = document.getElementById(`post-${postId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-primary/30");
      setTimeout(() => el.classList.remove("ring-2", "ring-primary/30"), 2000);
    }
  }, []);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
          Feed
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Partagez vos victoires et echangez avec la communaute
        </p>
      </motion.div>

      {/* Main layout: Feed + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Feed column */}
        <div className="space-y-6">
          {/* Composer */}
          <motion.div variants={staggerItem}>
            <PostComposer
              onSubmit={(content, postType) =>
                createPost.mutate({ content, post_type: postType })
              }
              isSubmitting={createPost.isPending}
            />
          </motion.div>

          {/* Filters + Sort */}
          <motion.div
            variants={staggerItem}
            className="flex flex-col sm:flex-row sm:items-center gap-3"
          >
            {/* Type filters */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 flex-1">
              {TYPE_FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setTypeFilter(f.value)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all",
                    typeFilter === f.value
                      ? "bg-[#DC2626] text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f.value !== "all" && `${POST_TYPE_CONFIG[f.value].emoji} `}
                  {f.label}
                </button>
              ))}
            </div>

            {/* Sort controls */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-0.5 flex-shrink-0">
              {SORT_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSortMode(opt.value)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all",
                      sortMode === opt.value
                        ? "bg-white text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Icon className="w-3 h-3" />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Posts list */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-[14px] border border-border p-6"
                >
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
              className="bg-white rounded-[14px] border border-border p-12 text-center"
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
                    id={`post-${post.id}`}
                    layout
                    variants={staggerItem}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="transition-all duration-300 rounded-[14px]"
                  >
                    <PostCard
                      post={post}
                      isStaff={isStaff}
                      currentUserId={user?.id}
                      onLike={() =>
                        toggleLike.mutate({
                          postId: post.id,
                          isLiked: post.is_liked ?? false,
                        })
                      }
                      onPin={() =>
                        togglePin.mutate({
                          postId: post.id,
                          isPinned: post.is_pinned,
                        })
                      }
                      onDelete={() => deletePost.mutate(post.id)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Trending sidebar (always visible on desktop) */}
        <div className="hidden lg:block">
          <div className="sticky top-6">
            <TrendingSidebar onPostClick={scrollToPost} />
          </div>
        </div>
      </div>
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
    <div className="bg-white rounded-[14px] border border-border p-4">
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (!expanded && e.target.value) setExpanded(true);
        }}
        onFocus={() => setExpanded(true)}
        placeholder="Partagez quelque chose avec la communaute..."
        rows={expanded ? 4 : 2}
        className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-shadow"
      />

      {expanded && (
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <div className="flex gap-1">
            {(
              Object.entries(POST_TYPE_CONFIG) as [
                PostType,
                typeof POST_TYPE_CONFIG.general,
              ][]
            ).map(([type, config]) => (
              <button
                key={type}
                onClick={() => setPostType(type)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                  postType === type
                    ? config.color
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                {config.emoji} {config.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="h-8 px-4 bg-[#DC2626] text-white rounded-[10px] text-xs font-medium hover:bg-[#B91C1C] transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-1"
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
    <div className="bg-white rounded-[14px] border border-border">
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
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-sm text-primary font-medium">
                {post.author?.full_name?.charAt(0) ?? "?"}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-foreground">
                  {post.author?.full_name ?? "Utilisateur"}
                </p>
                {post.author?.role &&
                  (post.author.role === "admin" ||
                    post.author.role === "coach") && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      {post.author.role === "admin" ? "Admin" : "Coach"}
                    </span>
                  )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-mono">
                  {timeAgo(post.created_at)}
                </span>
                <span
                  className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${typeConfig.color}`}
                >
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
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-8 z-20 bg-white rounded-[10px] border border-border py-1 min-w-[140px] shadow-sm">
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
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-muted transition-colors"
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
        <div className="flex items-center gap-1 mt-4 pt-3 border-t border-border/50">
          <button
            onClick={onLike}
            className={`flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium transition-all ${
              post.is_liked
                ? "text-red-500 bg-red-500/5"
                : "text-muted-foreground hover:text-red-500 hover:bg-red-500/5"
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-transform ${post.is_liked ? "fill-current" : ""}`}
            />
            {post.likes_count > 0 && (
              <span className="text-xs">{post.likes_count}</span>
            )}
          </button>
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            {post.comments_count > 0 && (
              <span className="text-xs">{post.comments_count}</span>
            )}
            {showComments ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
          {!isAuthor && <ReportButton postId={post.id} />}
        </div>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="border-t border-border/30">
          <CommentThread postId={post.id} />
        </div>
      )}
    </div>
  );
}
