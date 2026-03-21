"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { staggerItem } from "@/lib/animations";
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
  Loader2,
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { ReportButton } from "@/components/feed/report-modal";
import { CommentThread } from "@/components/feed/comment-thread";
import { TrendingSidebar } from "@/components/feed/trending-sidebar";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { Megaphone, Info, AlertTriangle, CheckCircle2, Sparkles, Zap } from "lucide-react";

const TYPE_FILTERS: { label: string; value: PostType | "all" | "announcements"; emoji?: string }[] = [
  { label: "Tout", value: "all" },
  { label: "Annonces", value: "announcements", emoji: "📢" },
  { label: "Victoires", value: "victory" },
  { label: "Questions", value: "question" },
  { label: "Experiences", value: "experience" },
  { label: "General", value: "general" },
];

const ANNOUNCEMENT_ICONS: Record<string, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  update: Sparkles,
  urgent: Zap,
};

const ANNOUNCEMENT_COLORS: Record<string, string> = {
  info: "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30",
  warning: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30",
  success: "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30",
  update: "border-purple-200 bg-purple-50 dark:border-purple-900 dark:bg-purple-950/30",
  urgent: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30",
};

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
  const [typeFilter, setTypeFilter] = useState<PostType | "all" | "announcements">("all");
  const [sortMode, setSortMode] = useState<FeedSortMode>("recent");
  const { data: announcements } = useAnnouncements();
  const showAnnouncementsOnly = typeFilter === "announcements";
  const feedPostType = typeFilter === "all" || typeFilter === "announcements" ? undefined : typeFilter;
  const {
    posts,
    isLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    createPost,
    deletePost,
    togglePin,
    toggleLike,
  } = useFeed(feedPostType, sortMode);

  const isStaff = profile?.role === "admin" || profile?.role === "coach";

  // Infinite scroll observer
  const loadMoreRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!loadMoreRef.current || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) fetchNextPage(); },
      { threshold: 0.1 },
    );
    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Scroll to a specific post when clicking from trending sidebar
  const scrollToPost = useCallback((postId: string) => {
    const el = document.getElementById(`post-${postId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-2", "ring-[#AF0000]/30");
      setTimeout(
        () => el.classList.remove("ring-2", "ring-[#AF0000]/30"),
        2000,
      );
    }
  }, []);

  return (
    <motion.div
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }}
      initial="visible"
      animate="visible"
      className="max-w-5xl mx-auto space-y-8"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#AF0000] via-[#DC2626] to-[#AF0000] bg-clip-text text-transparent tracking-tight">
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
                      ? "bg-gradient-to-r from-[#AF0000] to-[#DC2626] text-white shadow-sm shadow-[#AF0000]/20"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f.emoji ? `${f.emoji} ` : f.value !== "all" && f.value !== "announcements" ? `${POST_TYPE_CONFIG[f.value as PostType].emoji} ` : ""}
                  {f.label}
                  {f.value === "announcements" && announcements?.length ? ` (${announcements.length})` : ""}
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
                        ? "bg-surface text-foreground shadow-sm"
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

          {/* Announcements */}
          {(showAnnouncementsOnly || typeFilter === "all") && announcements && announcements.length > 0 && (
            <div className="space-y-3">
              {(showAnnouncementsOnly ? announcements : announcements.slice(0, 2)).map((a) => {
                const Icon = ANNOUNCEMENT_ICONS[a.type] ?? Megaphone;
                return (
                  <div
                    key={a.id}
                    className={cn(
                      "rounded-2xl border-2 p-4 flex items-start gap-3",
                      ANNOUNCEMENT_COLORS[a.type] ?? ANNOUNCEMENT_COLORS.info,
                    )}
                  >
                    <div className="w-9 h-9 rounded-xl bg-surface/80 flex items-center justify-center shrink-0 shadow-sm">
                      <Megaphone className="w-4 h-4 text-[#AF0000]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#AF0000]/10 text-[#AF0000] font-semibold uppercase tracking-wider">
                          Annonce
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(a.created_at, "relative")}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{a.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{a.content}</p>
                    </div>
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0 mt-1" />
                  </div>
                );
              })}
            </div>
          )}

          {/* Posts list */}
          {showAnnouncementsOnly ? null : isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="bg-surface rounded-2xl border border-border p-6"
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
              className="bg-surface rounded-2xl border border-border p-12 text-center"
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
                    className="transition-all duration-300 rounded-2xl"
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

              {/* Infinite scroll sentinel */}
              <div ref={loadMoreRef} className="h-4" />
              {isFetchingNextPage && (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              )}
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
    <div className="bg-surface rounded-2xl border border-border p-4 shadow-sm transition-all duration-200 hover:shadow-md">
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (!expanded && e.target.value) setExpanded(true);
        }}
        onFocus={() => setExpanded(true)}
        placeholder="Partagez quelque chose avec la communaute..."
        rows={expanded ? 4 : 2}
        className="w-full bg-muted/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#AF0000]/20 resize-none transition-shadow"
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
            className="h-8 px-4 bg-gradient-to-r from-[#AF0000] to-[#DC2626] text-white rounded-xl text-xs font-medium hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50 shadow-sm shadow-[#AF0000]/20 flex items-center gap-1"
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
  const isVictory = post.post_type === "victory";

  return (
    <div
      className={cn(
        "bg-surface rounded-2xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
        isVictory
          ? "border-amber-200/60 bg-gradient-to-br from-amber-50/30 to-surface shadow-sm shadow-amber-100/30"
          : "border-border",
      )}
    >
      {/* Pinned indicator */}
      {post.is_pinned && (
        <div className="px-4 pt-3 flex items-center gap-1 text-xs text-amber-600 font-medium">
          <Pin className="w-3 h-3" />
          Epingle
        </div>
      )}

      <div className="p-5">
        {/* Author row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {post.author?.avatar_url ? (
              <Image
                src={post.author.avatar_url}
                alt=""
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-[#AF0000]/10 ring-offset-1"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#AF0000] to-[#DC2626] flex items-center justify-center text-sm text-white font-medium ring-2 ring-[#AF0000]/10 ring-offset-1">
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
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-gradient-to-r from-[#AF0000]/10 to-[#DC2626]/10 text-[#AF0000]">
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
                  <div className="absolute right-0 top-8 z-20 bg-surface rounded-xl border border-border py-1 min-w-[140px] shadow-lg">
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
            className={cn(
              "flex items-center gap-1.5 h-8 px-2.5 rounded-lg text-xs font-medium transition-all",
              post.is_liked
                ? "text-[#AF0000] bg-[#AF0000]/5"
                : "text-muted-foreground hover:text-[#AF0000] hover:bg-[#AF0000]/5",
            )}
          >
            <Heart
              className={cn(
                "w-3.5 h-3.5 transition-transform",
                post.is_liked ? "fill-current scale-110" : "",
              )}
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
