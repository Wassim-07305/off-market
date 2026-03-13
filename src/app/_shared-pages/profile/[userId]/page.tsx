"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { useFollowStatus, useFollowCounts } from "@/hooks/use-follows";
import { cn, getInitials } from "@/lib/utils";
import Link from "next/link";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import {
  ArrowLeft,
  Award,
  Calendar,
  Flame,
  Heart,
  Loader2,
  MessageSquare,
  Star,
  Trophy,
  UserPlus,
  UserMinus,
  Users,
  Zap,
} from "lucide-react";
import type { Profile } from "@/types/database";
import type { Badge, LevelConfig } from "@/types/gamification";
import { RARITY_CONFIG, type BadgeRarity } from "@/types/gamification";

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  admin: { label: "Admin", color: "text-red-600 bg-red-500/10" },
  coach: { label: "Coach", color: "text-purple-600 bg-purple-500/10" },
  client: { label: "Membre", color: "text-blue-600 bg-blue-500/10" },
  setter: { label: "Setter", color: "text-amber-600 bg-amber-500/10" },
  closer: { label: "Closer", color: "text-emerald-600 bg-emerald-500/10" },
  sales: { label: "Sales", color: "text-orange-600 bg-orange-500/10" },
};

const POST_TYPE_ICONS: Record<string, string> = {
  victory: "🏆",
  question: "❓",
  experience: "💡",
  general: "💬",
  resource: "📎",
  off_topic: "🎲",
};

export default function PublicProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = use(params);
  const supabase = useSupabase();
  const { user } = useAuth();
  const prefix = useRoutePrefix();
  const { isFollowing, follow, unfollow } = useFollowStatus(userId);
  const { data: followCounts } = useFollowCounts(userId);

  const isSelf = user?.id === userId;

  // Fetch profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["public-profile", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (error) throw error;
      return data as Profile;
    },
  });

  // Fetch XP total
  const { data: xpData } = useQuery({
    queryKey: ["public-xp", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("xp_transactions")
        .select("xp_amount")
        .eq("profile_id", userId);
      if (error) throw error;
      const total = (data as { xp_amount: number }[]).reduce(
        (sum, t) => sum + t.xp_amount,
        0,
      );
      return { total };
    },
  });

  // Fetch level config
  const { data: levels } = useQuery({
    queryKey: ["level-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("level_config")
        .select("*")
        .order("min_xp", { ascending: true });
      if (error) throw error;
      return data as LevelConfig[];
    },
  });

  // Fetch streak
  const { data: streakData } = useQuery({
    queryKey: ["public-streak", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("streaks")
        .select("current_streak, longest_streak, xp_multiplier")
        .eq("profile_id", userId)
        .maybeSingle();
      if (error) return null;
      return data as {
        current_streak: number;
        longest_streak: number;
        xp_multiplier: number;
      } | null;
    },
  });

  // Fetch badges
  const { data: userBadges } = useQuery({
    queryKey: ["public-badges", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_badges")
        .select("*, badge:badges(*)")
        .eq("profile_id", userId)
        .order("earned_at", { ascending: false });
      if (error) throw error;
      return data as { id: string; earned_at: string; badge: Badge }[];
    },
  });

  // Fetch recent posts
  const { data: recentPosts } = useQuery({
    queryKey: ["public-posts", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("feed_posts")
        .select(
          "id, content, post_type, likes_count, comments_count, created_at",
        )
        .eq("author_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data as {
        id: string;
        content: string;
        post_type: string;
        likes_count: number;
        comments_count: number;
        created_at: string;
      }[];
    },
  });

  // Compute level
  const totalXp = xpData?.total ?? 0;
  const allLevels = levels ?? [];
  const currentLevel =
    [...allLevels].reverse().find((l) => totalXp >= l.min_xp) ?? null;
  const nextLevel = allLevels.find((l) => l.min_xp > totalXp) ?? null;
  const progressToNext =
    nextLevel && currentLevel
      ? Math.min(
          Math.round(
            ((totalXp - currentLevel.min_xp) /
              (nextLevel.min_xp - currentLevel.min_xp)) *
              100,
          ),
          100,
        )
      : 100;

  if (profileLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="h-5 w-20 bg-muted rounded animate-shimmer" />
        <div
          className="bg-surface rounded-2xl p-8 space-y-4"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-muted animate-shimmer" />
            <div className="space-y-2">
              <div className="h-6 w-40 bg-muted rounded animate-shimmer" />
              <div className="h-4 w-24 bg-muted rounded animate-shimmer" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Profil non trouve</p>
      </div>
    );
  }

  const role = ROLE_LABELS[profile.role] ?? ROLE_LABELS.client;
  const memberSince = new Date(profile.created_at).toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });
  const hasStreak = streakData && streakData.current_streak > 0;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Back link */}
      <motion.div variants={staggerItem}>
        <Link
          href={`${prefix}/community`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
      </motion.div>

      {/* Profile card */}
      <motion.div
        variants={staggerItem}
        className="bg-surface rounded-2xl overflow-hidden"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5" />

        <div className="px-6 pb-6">
          {/* Avatar + info */}
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-10">
            <div className="shrink-0 relative">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-20 h-20 rounded-2xl object-cover border-4 border-surface"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-primary/10 border-4 border-surface flex items-center justify-center text-2xl text-primary font-bold">
                  {getInitials(profile.full_name)}
                </div>
              )}
              {/* Level icon */}
              {currentLevel?.icon && (
                <span className="absolute -bottom-1 -right-1 text-lg bg-surface rounded-full p-0.5 border border-border">
                  {currentLevel.icon}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-display font-bold text-foreground">
                  {profile.full_name}
                </h1>
                <span
                  className={cn(
                    "text-[10px] font-medium px-2 py-0.5 rounded-full",
                    role.color,
                  )}
                >
                  {role.label}
                </span>
                {/* Streak flame */}
                {hasStreak && (
                  <span className="flex items-center gap-0.5 text-[10px] font-bold text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded-full">
                    🔥 {streakData.current_streak}j
                  </span>
                )}
              </div>
              {profile.bio && (
                <p className="text-sm text-muted-foreground mt-1">
                  {profile.bio}
                </p>
              )}
              {/* Level info */}
              {currentLevel && (
                <p className="text-xs text-muted-foreground mt-1">
                  {currentLevel.icon} Niv. {currentLevel.level} —{" "}
                  {currentLevel.name}
                </p>
              )}
            </div>

            {/* Follow button */}
            {!isSelf && user && (
              <button
                onClick={() =>
                  isFollowing ? unfollow.mutate() : follow.mutate()
                }
                disabled={follow.isPending || unfollow.isPending}
                className={cn(
                  "h-9 px-4 rounded-xl text-sm font-medium transition-all active:scale-[0.98] flex items-center gap-2 shrink-0 disabled:opacity-50",
                  isFollowing
                    ? "border border-border text-muted-foreground hover:text-foreground hover:bg-muted"
                    : "bg-primary text-white hover:bg-primary-hover",
                )}
              >
                {follow.isPending || unfollow.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : isFollowing ? (
                  <UserMinus className="w-4 h-4" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                {isFollowing ? "Abonne" : "Suivre"}
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 sm:gap-6 mt-5 pt-5 border-t border-border flex-wrap">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">
                {followCounts?.followersCount ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground">Abonnes</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">
                {followCounts?.followingCount ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground">Abonnements</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground flex items-center justify-center gap-1">
                <Zap className="w-4 h-4 text-amber-500" />
                {totalXp.toLocaleString("fr-FR")}
              </p>
              <p className="text-[10px] text-muted-foreground">XP</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground flex items-center justify-center gap-1">
                <Award className="w-4 h-4 text-primary" />
                {userBadges?.length ?? 0}
              </p>
              <p className="text-[10px] text-muted-foreground">Badges</p>
            </div>
            {hasStreak && (
              <div className="text-center">
                <p className="text-lg font-bold text-foreground flex items-center justify-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  {streakData.current_streak}
                </p>
                <p className="text-[10px] text-muted-foreground">Streak</p>
              </div>
            )}
            <div className="hidden sm:block text-center ml-auto">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Membre depuis {memberSince}
              </p>
            </div>
          </div>

          {/* XP Progress bar */}
          {nextLevel && currentLevel && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                <span>
                  {currentLevel.icon} Niv. {currentLevel.level}
                </span>
                <span>{progressToNext}%</span>
                <span>
                  {nextLevel.icon} Niv. {nextLevel.level}
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary/70"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Streak card */}
      {streakData &&
        (streakData.current_streak > 0 || streakData.longest_streak > 0) && (
          <motion.div
            variants={staggerItem}
            className="bg-surface rounded-2xl p-5"
            style={{ boxShadow: "var(--shadow-card)" }}
          >
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-orange-500" />
              Streak
            </h2>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-foreground tabular-nums">
                  {streakData.current_streak}
                </p>
                <p className="text-[10px] text-muted-foreground">Actuel</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-display font-bold text-foreground tabular-nums">
                  {streakData.longest_streak}
                </p>
                <p className="text-[10px] text-muted-foreground">Record</p>
              </div>
              {streakData.xp_multiplier > 1 && (
                <div className="text-center">
                  <p className="text-2xl font-display font-bold text-amber-500 tabular-nums flex items-center gap-1">
                    <Zap className="w-5 h-5" />
                    {streakData.xp_multiplier}x
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    Multiplicateur
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

      {/* Badges */}
      {userBadges && userBadges.length > 0 && (
        <motion.div
          variants={staggerItem}
          className="bg-surface rounded-2xl p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-amber-500" />
            Badges ({userBadges.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {userBadges.map((ub) => {
              const rarityConfig =
                RARITY_CONFIG[ub.badge.rarity as BadgeRarity];
              return (
                <div
                  key={ub.id}
                  className="flex flex-col items-center gap-1.5 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border"
                  title={ub.badge.description ?? ub.badge.name}
                >
                  <span className="text-2xl">{ub.badge.icon ?? "🏅"}</span>
                  <span className="text-[10px] text-foreground font-medium text-center leading-tight">
                    {ub.badge.name}
                  </span>
                  {rarityConfig && (
                    <span
                      className={cn(
                        "text-[9px] font-medium px-1.5 py-0.5 rounded-full",
                        rarityConfig.color,
                        rarityConfig.bg,
                      )}
                    >
                      {rarityConfig.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Recent posts */}
      {recentPosts && recentPosts.length > 0 && (
        <motion.div
          variants={staggerItem}
          className="bg-surface rounded-2xl p-6"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-4">
            <MessageSquare className="w-4 h-4 text-muted-foreground" />
            Publications recentes
          </h2>
          <div className="space-y-3">
            {recentPosts.map((post) => (
              <div key={post.id} className="p-3 bg-muted/30 rounded-xl">
                <div className="flex items-start gap-2">
                  <span className="text-sm">
                    {POST_TYPE_ICONS[post.post_type] ?? "💬"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground line-clamp-2">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {post.likes_count}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />{" "}
                        {post.comments_count}
                      </span>
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {new Date(post.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Empty state if no content */}
      {(!userBadges || userBadges.length === 0) &&
        (!recentPosts || recentPosts.length === 0) && (
          <motion.div variants={staggerItem} className="text-center py-8">
            <Star className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Pas encore d&apos;activite
            </p>
          </motion.div>
        )}
    </motion.div>
  );
}
