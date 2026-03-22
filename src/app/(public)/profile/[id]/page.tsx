import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Award,
  BookOpen,
  Lock,
  Shield,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────

interface ProfileData {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  role: string;
  leaderboard_anonymous: boolean;
}

interface BadgeData {
  id: string;
  earned_at: string;
  badge: {
    id: string;
    name: string;
    description: string | null;
    icon: string | null;
    rarity: string;
    category: string;
  } | null;
}

interface XpData {
  xp_amount: number;
}

interface LevelConfig {
  level: number;
  name: string;
  min_xp: number;
  icon: string | null;
  color: string | null;
}

interface FormationProgress {
  id: string;
  completed: boolean;
  formation: {
    id: string;
    title: string;
  } | null;
}

// ─── Rarity colors ──────────────────────────────────────────

const RARITY_STYLES: Record<string, { border: string; text: string; bg: string }> = {
  common: { border: "border-zinc-600", text: "text-zinc-400", bg: "bg-zinc-500/10" },
  uncommon: { border: "border-emerald-600", text: "text-emerald-400", bg: "bg-emerald-500/10" },
  rare: { border: "border-blue-600", text: "text-blue-400", bg: "bg-blue-500/10" },
  epic: { border: "border-purple-600", text: "text-purple-400", bg: "bg-purple-500/10" },
  legendary: { border: "border-amber-600", text: "text-amber-400", bg: "bg-amber-500/10" },
};

// ─── Page ───────────────────────────────────────────────────

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const admin = createAdminClient();

  // Fetch profile
  const { data: profile, error } = await admin
    .from("profiles")
    .select("id, full_name, avatar_url, bio, role, leaderboard_anonymous")
    .eq("id", id)
    .single();

  if (error || !profile) {
    notFound();
  }

  const profileData = profile as ProfileData;

  // If user has anonymous mode on, show private page
  if (profileData.leaderboard_anonymous) {
    return <PrivateProfilePage />;
  }

  // Fetch badges, XP, formations in parallel
  const [badgesRes, xpRes, levelsRes, formationsRes] = await Promise.all([
    admin
      .from("user_badges")
      .select("id, earned_at, badge:badges(id, name, description, icon, rarity, category)")
      .eq("profile_id", id)
      .order("earned_at", { ascending: false }),
    admin
      .from("xp_transactions")
      .select("xp_amount")
      .eq("profile_id", id),
    admin
      .from("level_config")
      .select("level, name, min_xp, icon, color")
      .order("min_xp", { ascending: true }),
    admin
      .from("formation_enrollments")
      .select("id, completed, formation:formations(id, title)")
      .eq("user_id", id)
      .eq("completed", true),
  ]);

  const badges = (badgesRes.data ?? []) as unknown as BadgeData[];
  const xpTransactions = (xpRes.data ?? []) as unknown as XpData[];
  const levels = (levelsRes.data ?? []) as unknown as LevelConfig[];
  const completedFormations = (formationsRes.data ?? []) as unknown as FormationProgress[];

  const totalXp = xpTransactions.reduce((sum, t) => sum + t.xp_amount, 0);

  // Calculate level
  let currentLevel: LevelConfig = levels[0] ?? { level: 1, name: "Debutant", min_xp: 0, icon: null, color: null };
  let nextLevel: LevelConfig | null = null;
  for (let i = 0; i < levels.length; i++) {
    if (totalXp >= levels[i].min_xp) {
      currentLevel = levels[i];
      nextLevel = levels[i + 1] ?? null;
    }
  }

  const progressToNext = nextLevel
    ? Math.min(
        100,
        Math.round(
          ((totalXp - currentLevel.min_xp) /
            (nextLevel.min_xp - currentLevel.min_xp)) *
            100,
        ),
      )
    : 100;

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10 space-y-8">
        {/* Profile header */}
        <div className="flex items-start gap-5">
          {profileData.avatar_url ? (
            <img
              src={profileData.avatar_url}
              alt={profileData.full_name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-zinc-800"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
              <span className="text-2xl font-bold text-zinc-400">
                {profileData.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white truncate">
              {profileData.full_name}
            </h1>
            {profileData.bio && (
              <p className="text-sm text-zinc-400 mt-1 line-clamp-3">
                {profileData.bio}
              </p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            icon={<Zap className="w-5 h-5 text-amber-400" />}
            label="XP total"
            value={totalXp.toLocaleString("fr-FR")}
          />
          <StatCard
            icon={<Star className="w-5 h-5 text-purple-400" />}
            label="Niveau"
            value={`${currentLevel.level} - ${currentLevel.name}`}
          />
          <StatCard
            icon={<Trophy className="w-5 h-5 text-emerald-400" />}
            label="Badges"
            value={String(badges.length)}
          />
        </div>

        {/* XP progress bar */}
        {nextLevel && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-zinc-300">
                Progression vers le niveau {nextLevel.level}
              </span>
              <span className="text-xs text-zinc-500">
                {totalXp.toLocaleString("fr-FR")} / {nextLevel.min_xp.toLocaleString("fr-FR")} XP
              </span>
            </div>
            <div className="h-2.5 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
                style={{ width: `${progressToNext}%` }}
              />
            </div>
          </div>
        )}

        {/* Badges */}
        {badges.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Badges obtenus
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {badges.map((ub) => {
                const badge = ub.badge;
                if (!badge) return null;
                const rarity = RARITY_STYLES[badge.rarity] ?? RARITY_STYLES.common;
                return (
                  <div
                    key={ub.id}
                    className={`rounded-xl border p-4 ${rarity.border} ${rarity.bg}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{badge.icon ?? "🏅"}</span>
                      <span className={`text-xs font-semibold uppercase ${rarity.text}`}>
                        {badge.rarity}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white truncate">
                      {badge.name}
                    </p>
                    {badge.description && (
                      <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                        {badge.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Completed formations */}
        {completedFormations.length > 0 && (
          <section>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-400" />
              Formations completees
            </h2>
            <div className="space-y-2">
              {completedFormations.map((fp) => (
                <div
                  key={fp.id}
                  className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
                >
                  <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-sm text-white truncate">
                    {fp.formation?.title ?? "Formation"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Empty state */}
        {badges.length === 0 && completedFormations.length === 0 && (
          <div className="text-center py-12">
            <Star className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">
              Cet utilisateur n&apos;a pas encore de badges ni de formations completees.
            </p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.04] py-4 text-center">
        <p className="text-xs text-zinc-600">
          Propulse par{" "}
          <span className="text-zinc-400 font-medium">Off Market</span>
        </p>
      </footer>
    </div>
  );
}

// ─── Private profile fallback ──────────────────────────────

function PrivateProfilePage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <header className="border-b border-white/[0.06] bg-zinc-950/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </Link>
        </div>
      </header>

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-zinc-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Profil prive</h1>
          <p className="text-zinc-400 max-w-sm">
            Cet utilisateur a choisi de garder son profil prive. Ses informations ne sont pas visibles publiquement.
          </p>
        </div>
      </div>

      <footer className="border-t border-white/[0.04] py-4 text-center">
        <p className="text-xs text-zinc-600">
          Propulse par{" "}
          <span className="text-zinc-400 font-medium">Off Market</span>
        </p>
      </footer>
    </div>
  );
}

// ─── Stat card component ────────────────────────────────────

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
    </div>
  );
}
