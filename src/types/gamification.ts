// ─── XP CONFIG ────────────────────────
export interface XpConfig {
  id: string;
  action: string;
  xp_amount: number;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

// ─── XP TRANSACTIONS ──────────────────
export interface XpTransaction {
  id: string;
  profile_id: string;
  action: string;
  xp_amount: number;
  metadata: Record<string, unknown>;
  created_at: string;
}

// ─── LEVEL CONFIG ─────────────────────
export interface LevelConfig {
  level: number;
  name: string;
  min_xp: number;
  icon: string | null;
  color: string | null;
}

// ─── BADGES ───────────────────────────
export interface Badge {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: BadgeCategory;
  rarity: BadgeRarity;
  condition: Record<string, unknown>;
  xp_reward: number;
  is_active: boolean;
  created_at: string;
}

export type BadgeCategory =
  | "learning"
  | "engagement"
  | "revenue"
  | "social"
  | "special";
export type BadgeRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";

export const RARITY_CONFIG: Record<
  BadgeRarity,
  { label: string; color: string; bg: string }
> = {
  common: { label: "Commun", color: "text-zinc-500", bg: "bg-zinc-500/10" },
  uncommon: {
    label: "Peu commun",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  rare: { label: "Rare", color: "text-blue-500", bg: "bg-blue-500/10" },
  epic: { label: "Epique", color: "text-purple-500", bg: "bg-purple-500/10" },
  legendary: {
    label: "Legendaire",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
};

export const CATEGORY_CONFIG: Record<
  BadgeCategory,
  { label: string; emoji: string }
> = {
  learning: { label: "Formation", emoji: "📚" },
  engagement: { label: "Engagement", emoji: "🔥" },
  revenue: { label: "Chiffre d'affaires", emoji: "💰" },
  social: { label: "Social", emoji: "🤝" },
  special: { label: "Special", emoji: "⭐" },
};

// ─── USER BADGES ──────────────────────
export interface UserBadge {
  id: string;
  profile_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

// ─── CHALLENGES ───────────────────────
export interface Challenge {
  id: string;
  title: string;
  description: string | null;
  challenge_type: ChallengeType;
  condition: Record<string, unknown>;
  xp_reward: number;
  badge_reward: string | null;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  // Client-side
  participant_count?: number;
  is_joined?: boolean;
  my_progress?: number;
  my_completed?: boolean;
}

export type ChallengeType = "weekly" | "monthly" | "community";

export const CHALLENGE_TYPE_CONFIG: Record<
  ChallengeType,
  { label: string; color: string; icon: string }
> = {
  weekly: {
    label: "Hebdomadaire",
    color: "text-blue-500 bg-blue-500/10",
    icon: "📅",
  },
  monthly: {
    label: "Mensuel",
    color: "text-purple-500 bg-purple-500/10",
    icon: "🗓️",
  },
  community: {
    label: "Communautaire",
    color: "text-amber-500 bg-amber-500/10",
    icon: "🌍",
  },
};

// ─── CHALLENGE PARTICIPANTS ──────────
export interface ChallengeParticipant {
  id: string;
  challenge_id: string;
  profile_id: string;
  progress: number;
  completed: boolean;
  completed_at: string | null;
  joined_at: string;
}

// ─── LEADERBOARD ──────────────────────
export interface LeaderboardEntry {
  profile_id: string;
  full_name: string;
  avatar_url: string | null;
  total_xp: number;
  badge_count: number;
  rank: number;
}

// ─── USER XP SUMMARY ─────────────────
export interface UserXpSummary {
  totalXp: number;
  level: LevelConfig;
  nextLevel: LevelConfig | null;
  progressToNext: number; // 0-100
  badges: UserBadge[];
  rank: number;
}

// ─── REWARDS ─────────────────────────
export type RewardType =
  | "session_bonus"
  | "resource_unlock"
  | "badge_exclusive"
  | "custom";

export const REWARD_TYPE_CONFIG: Record<
  RewardType,
  { label: string; icon: string; color: string; bg: string }
> = {
  session_bonus: {
    label: "Session bonus",
    icon: "Video",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  resource_unlock: {
    label: "Ressource",
    icon: "FolderOpen",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  badge_exclusive: {
    label: "Badge exclusif",
    icon: "Award",
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  custom: {
    label: "Special",
    icon: "Sparkles",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
};

export interface Reward {
  id: string;
  title: string;
  description: string | null;
  cost_xp: number;
  type: RewardType;
  stock: number | null; // null = unlimited
  is_active: boolean;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
}

export type RedemptionStatus = "pending" | "fulfilled" | "cancelled";

export const REDEMPTION_STATUS_CONFIG: Record<
  RedemptionStatus,
  { label: string; color: string; bg: string }
> = {
  pending: {
    label: "En attente",
    color: "text-amber-600",
    bg: "bg-amber-500/10",
  },
  fulfilled: {
    label: "Rempli",
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
  },
  cancelled: {
    label: "Annule",
    color: "text-zinc-500",
    bg: "bg-zinc-500/10",
  },
};

export interface RewardRedemption {
  id: string;
  user_id: string;
  reward_id: string;
  xp_spent: number;
  status: RedemptionStatus;
  redeemed_at: string;
  fulfilled_at: string | null;
  fulfilled_by: string | null;
  reward?: Reward;
  profile?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
}

// ─── HALL OF FAME ────────────────────
export interface HallOfFameEntry {
  id: string;
  profile_id: string;
  monthly_revenue: number;
  testimony: string | null;
  niche: string | null;
  achievement_date: string;
  is_visible: boolean;
  created_at: string;
  profile?: {
    id: string;
    full_name: string;
    avatar_url: string | null;
    bio: string | null;
  };
}
