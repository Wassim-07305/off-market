export interface FeedPost {
  id: string;
  author_id: string;
  content: string;
  post_type: PostType;
  media_urls: string[];
  is_pinned: boolean;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  // Joined
  author?: { id: string; full_name: string; avatar_url: string | null; role: string };
  // Client-side
  is_liked?: boolean;
}

export type PostType = "victory" | "question" | "experience" | "general";

export const POST_TYPE_CONFIG: Record<PostType, { label: string; color: string; emoji: string }> = {
  victory: { label: "Victoire", color: "text-emerald-600 bg-emerald-500/10", emoji: "🏆" },
  question: { label: "Question", color: "text-blue-600 bg-blue-500/10", emoji: "❓" },
  experience: { label: "Experience", color: "text-purple-600 bg-purple-500/10", emoji: "💡" },
  general: { label: "General", color: "text-zinc-600 bg-zinc-500/10", emoji: "💬" },
};

export interface FeedLike {
  id: string;
  post_id: string;
  profile_id: string;
  created_at: string;
}

export interface FeedComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  author?: { id: string; full_name: string; avatar_url: string | null; role: string };
  // Client-side
  replies?: FeedComment[];
}
