"use client";

import Image from "next/image";
import { useTrendingPosts } from "@/hooks/use-feed";
import { Heart, MessageCircle, TrendingUp, Flame } from "lucide-react";
import type { FeedPost } from "@/types/feed";

function TrendingCard({
  post,
  rank,
  onClick,
}: {
  post: FeedPost;
  rank: number;
  onClick?: () => void;
}) {
  const isTop = rank === 1;

  return (
    <button
      onClick={onClick}
      className="w-full flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors text-left"
    >
      {/* Rank indicator */}
      <div className="flex-shrink-0 flex items-center justify-center w-6 h-6 mt-0.5">
        {isTop ? (
          <Flame className="w-4 h-4 text-orange-500" />
        ) : (
          <span className="text-[11px] font-bold text-muted-foreground font-mono">
            #{rank}
          </span>
        )}
      </div>

      {post.author?.avatar_url ? (
        <Image
          src={post.author.avatar_url}
          alt=""
          width={32}
          height={32}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-xs text-primary font-semibold flex-shrink-0">
          {post.author?.full_name?.charAt(0) ?? "?"}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-foreground">
          {post.author?.full_name ?? "Utilisateur"}
        </p>
        <p className="text-xs text-muted-foreground truncate mt-0.5">
          {post.content}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1 text-red-500">
            <Heart className="w-3 h-3 fill-current" />
            <span className="text-[11px] font-mono">{post.likes_count}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <MessageCircle className="w-3 h-3" />
            <span className="text-[11px] font-mono">{post.comments_count}</span>
          </div>
        </div>
      </div>
    </button>
  );
}

interface TrendingSidebarProps {
  onPostClick?: (postId: string) => void;
}

export function TrendingSidebar({ onPostClick }: TrendingSidebarProps) {
  const { trendingPosts, isLoading } = useTrendingPosts(5);

  return (
    <div
      className="bg-surface rounded-2xl p-4"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-[#DC2626]" />
        <h3 className="text-sm font-semibold text-foreground">Tendances</h3>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <div className="w-6 h-6 rounded bg-muted animate-shimmer" />
              <div className="w-8 h-8 rounded-full bg-muted animate-shimmer" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-20 bg-muted animate-shimmer rounded-lg" />
                <div className="h-2.5 w-full bg-muted animate-shimmer rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : trendingPosts.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          Aucune tendance cette semaine
        </p>
      ) : (
        <div className="space-y-1">
          {trendingPosts.map((post, index) => (
            <TrendingCard
              key={post.id}
              post={post}
              rank={index + 1}
              onClick={() => onPostClick?.(post.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
