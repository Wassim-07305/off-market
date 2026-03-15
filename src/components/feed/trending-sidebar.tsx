"use client";

import { useTrendingPosts } from "@/hooks/use-feed";
import { Heart, TrendingUp } from "lucide-react";
import type { FeedPost } from "@/types/feed";

function TrendingCard({ post }: { post: FeedPost }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
      {post.author?.avatar_url ? (
        <img
          src={post.author.avatar_url}
          alt=""
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
        <div className="flex items-center gap-1 mt-1 text-red-500">
          <Heart className="w-3 h-3 fill-current" />
          <span className="text-[11px] font-mono">{post.likes_count}</span>
        </div>
      </div>
    </div>
  );
}

export function TrendingSidebar() {
  const { trendingPosts, isLoading } = useTrendingPosts(5);

  return (
    <div
      className="bg-surface rounded-2xl p-4"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-semibold text-foreground">
          Tendances de la semaine
        </h3>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
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
          {trendingPosts.map((post) => (
            <TrendingCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
