"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useStreak } from "@/hooks/use-streaks";
import { useXp } from "@/hooks/use-xp";
import { useCoachingGoals } from "@/hooks/use-coaching-goals";
import { useCourses, useLessonProgress } from "@/hooks/use-courses";
import { useTodayRituals, isCompletedToday } from "@/hooks/use-rituals";
import { useJournal } from "@/hooks/use-journal";
import { useMyUpsellOffers } from "@/hooks/use-upsell";
import { useAnnouncements } from "@/hooks/useAnnouncements";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { OnboardingBanner } from "@/components/onboarding/onboarding-banner";
import { OnboardingChecklist } from "@/components/onboarding/onboarding-checklist";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { cn } from "@/lib/utils";
import {
  Flame,
  Zap,
  Trophy,
  Target,
  GraduationCap,
  BookOpen,
  ChevronRight,
  Sparkles,
  Star,
  PenLine,
  Gift,
  Megaphone,
  Clock,
} from "lucide-react";

// --- Greeting helper ---

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon apres-midi";
  return "Bonsoir";
}

// --- Main component ---

export function ClientDashboard() {
  const { profile } = useAuth();
  const prefix = useRoutePrefix();
  const firstName = profile?.full_name?.split(" ")[0] ?? "";

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Page title with greeting */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-[#AF0000] via-[#DC2626] to-[#AF0000] bg-clip-text text-transparent tracking-tight">
          {getGreeting()} {firstName} !
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Voici ton espace personnel — ta progression, tes prochaines etapes et
          ton activite.
        </p>
      </motion.div>

      {/* Onboarding banner */}
      <motion.div variants={staggerItem}>
        <OnboardingBanner />
      </motion.div>

      {/* Top section: Streak + XP + Quick stats */}
      <motion.div variants={staggerItem}>
        <TopStatsSection prefix={prefix} />
      </motion.div>

      {/* Onboarding checklist */}
      <motion.div variants={staggerItem}>
        <OnboardingChecklist />
      </motion.div>

      {/* Middle section: Next actions */}
      <motion.div variants={staggerItem}>
        <NextActionsSection prefix={prefix} />
      </motion.div>

      {/* Bottom section: Recent activity */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        <CourseProgressSection prefix={prefix} />
        <GoalProgressSection prefix={prefix} />
        <RecentJournalSection prefix={prefix} />
      </motion.div>

      {/* Side widgets: Upsell + Announcements */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <BadgesSection />
        <CommunitySection prefix={prefix} />
      </motion.div>
    </motion.div>
  );
}

// ===================================================================
// TOP STATS SECTION
// ===================================================================

function TopStatsSection({ prefix }: { prefix: string }) {
  const { streak, isLoading: streakLoading } = useStreak();
  const { summary, isLoading: xpLoading } = useXp();
  const { goals } = useCoachingGoals();
  const { data: courses } = useCourses("published");
  const { data: lessonProgress } = useLessonProgress();

  const currentStreak = streak?.current_streak ?? 0;
  const multiplier = streak?.xp_multiplier ?? 1;

  // Compute formations completed
  const completedFormations = useMemo(() => {
    if (!courses || !lessonProgress) return 0;
    let count = 0;
    for (const course of courses) {
      const totalLessons =
        course.modules?.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0) ??
        0;
      if (totalLessons === 0) continue;
      const completedLessons =
        course.modules?.reduce((acc, m) => {
          return (
            acc +
            (m.lessons?.filter((l) =>
              lessonProgress.some(
                (p) => p.lesson_id === l.id && p.status === "completed",
              ),
            ).length ?? 0)
          );
        }, 0) ?? 0;
      if (completedLessons >= totalLessons) count++;
    }
    return count;
  }, [courses, lessonProgress]);

  const achievedGoals = goals.filter((g) => g.status === "completed").length;
  const isLoading = streakLoading || xpLoading;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white border border-zinc-200 rounded-2xl p-5 animate-pulse"
          >
            <div className="h-4 w-24 bg-zinc-100 rounded mb-4" />
            <div className="h-7 w-16 bg-zinc-100 rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Streak card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-white border border-orange-200/50 rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/5 hover:-translate-y-0.5">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-orange-100/40 to-transparent rounded-bl-full" />
        <div className="flex items-center gap-3 mb-3">
          <div className="size-9 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-sm shadow-orange-500/20">
            <Flame className="size-4 text-white" />
          </div>
          <span className="text-sm text-muted-foreground font-medium">
            Streak
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-foreground tabular-nums">
            {currentStreak}
          </span>
          <span className="text-sm text-muted-foreground">
            jour{currentStreak !== 1 ? "s" : ""}
          </span>
        </div>
        {multiplier > 1 && (
          <div className="flex items-center gap-1 mt-1.5">
            <Zap className="size-3 text-amber-500" />
            <span className="text-xs font-semibold text-amber-600">
              {multiplier}x XP
            </span>
          </div>
        )}
      </div>

      {/* XP / Level card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-red-50/50 to-white border border-red-200/30 rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-[#AF0000]/5 hover:-translate-y-0.5">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-red-100/30 to-transparent rounded-bl-full" />
        <div className="flex items-center gap-3 mb-3">
          <div className="size-9 rounded-xl bg-gradient-to-br from-[#AF0000] to-[#DC2626] flex items-center justify-center shadow-sm shadow-[#AF0000]/20">
            <Star className="size-4 text-white" />
          </div>
          <span className="text-sm text-muted-foreground font-medium">
            Niveau
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl font-bold text-foreground tabular-nums">
            {summary.level.level}
          </span>
          <span className="text-sm text-muted-foreground">
            {summary.level.name}
          </span>
        </div>
        {/* XP progress bar */}
        <div className="h-2 bg-red-100/60 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#AF0000] to-[#DC2626] rounded-full transition-all duration-700"
            style={{ width: `${summary.progressToNext}%` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          {summary.totalXp} XP · {summary.progressToNext}% vers niveau{" "}
          {summary.nextLevel ? summary.nextLevel.level : "max"}
        </p>
      </div>

      {/* Formations completed */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-50 to-white border border-emerald-200/50 rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/5 hover:-translate-y-0.5">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-emerald-100/40 to-transparent rounded-bl-full" />
        <div className="flex items-center gap-3 mb-3">
          <div className="size-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm shadow-emerald-500/20">
            <GraduationCap className="size-4 text-white" />
          </div>
          <span className="text-sm text-muted-foreground font-medium">
            Formations terminees
          </span>
        </div>
        <div className="text-2xl font-bold text-foreground tracking-tight">
          {completedFormations}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          sur {courses?.length ?? 0} disponible
          {(courses?.length ?? 0) !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Goals achieved */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-50 to-white border border-amber-200/50 rounded-2xl p-5 transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/5 hover:-translate-y-0.5">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-amber-100/40 to-transparent rounded-bl-full" />
        <div className="flex items-center gap-3 mb-3">
          <div className="size-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-sm shadow-amber-500/20">
            <Target className="size-4 text-white" />
          </div>
          <span className="text-sm text-muted-foreground font-medium">
            Objectifs atteints
          </span>
        </div>
        <div className="text-2xl font-bold text-foreground tracking-tight">
          {achievedGoals}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          sur {goals.length} objectif{goals.length !== 1 ? "s" : ""}
        </p>
      </div>
    </div>
  );
}

// ===================================================================
// NEXT ACTIONS SECTION
// ===================================================================

function NextActionsSection({ prefix }: { prefix: string }) {
  const { data: todayRituals } = useTodayRituals();
  const { data: courses } = useCourses("published");
  const { data: lessonProgress } = useLessonProgress();

  // Find incomplete ritual for today
  const incompleteRitual = useMemo(() => {
    if (!todayRituals) return null;
    return todayRituals.find((r) => !isCompletedToday(r)) ?? null;
  }, [todayRituals]);

  // Find next lesson to complete
  const nextLesson = useMemo(() => {
    if (!courses || !lessonProgress) return null;
    const completedIds = new Set(
      lessonProgress
        .filter((p) => p.status === "completed")
        .map((p) => p.lesson_id),
    );
    for (const course of courses) {
      for (const mod of course.modules ?? []) {
        for (const lesson of mod.lessons ?? []) {
          if (!completedIds.has(lesson.id)) {
            return { lesson, course };
          }
        }
      }
    }
    return null;
  }, [courses, lessonProgress]);

  const actions = useMemo(() => {
    const items: {
      id: string;
      icon: typeof Clock;
      iconBg: string;
      iconColor: string;
      title: string;
      description: string;
      href: string;
    }[] = [];

    if (incompleteRitual) {
      items.push({
        id: "ritual",
        icon: Clock,
        iconBg: "bg-gradient-to-br from-amber-400 to-amber-500",
        iconColor: "text-white",
        title: incompleteRitual.title,
        description: `Rituel ${incompleteRitual.frequency} a completer`,
        href: `${prefix}/rituals`,
      });
    }

    if (nextLesson) {
      items.push({
        id: "lesson",
        icon: BookOpen,
        iconBg: "bg-gradient-to-br from-[#AF0000] to-[#DC2626]",
        iconColor: "text-white",
        title: nextLesson.lesson.title,
        description: `Suite de : ${nextLesson.course.title}`,
        href: `${prefix}/school`,
      });
    }

    // Always add a "journal" action
    items.push({
      id: "journal",
      icon: PenLine,
      iconBg: "bg-gradient-to-br from-zinc-600 to-zinc-700",
      iconColor: "text-white",
      title: "Ecrire dans ton journal",
      description: "Partage tes reflexions du jour",
      href: `${prefix}/journal`,
    });

    return items.slice(0, 4);
  }, [incompleteRitual, nextLesson, prefix]);

  if (actions.length === 0) return null;

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-100 bg-gradient-to-r from-zinc-50/80 to-transparent">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-lg bg-gradient-to-br from-[#AF0000] to-[#DC2626] flex items-center justify-center">
            <Sparkles className="size-3.5 text-white" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            Prochaines etapes
          </h3>
        </div>
      </div>

      {/* Action items */}
      <div className="divide-y divide-zinc-100">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.id}
              href={action.href}
              className="flex items-center gap-4 px-5 py-4 hover:bg-zinc-50/80 transition-all group"
            >
              <div
                className={cn(
                  "size-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                  action.iconBg,
                )}
              >
                <Icon className={cn("size-4", action.iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {action.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground/50 shrink-0 group-hover:text-[#AF0000] group-hover:translate-x-0.5 transition-all" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ===================================================================
// COURSE PROGRESS SECTION
// ===================================================================

function CourseProgressSection({ prefix }: { prefix: string }) {
  const { data: courses, isLoading } = useCourses("published");
  const { data: lessonProgress } = useLessonProgress();

  // Compute progress for each course
  const courseProgress = useMemo(() => {
    if (!courses || !lessonProgress) return [];
    const completedIds = new Set(
      lessonProgress
        .filter((p) => p.status === "completed")
        .map((p) => p.lesson_id),
    );
    return courses
      .map((course) => {
        const totalLessons =
          course.modules?.reduce(
            (acc, m) => acc + (m.lessons?.length ?? 0),
            0,
          ) ?? 0;
        if (totalLessons === 0) return null;
        const completedLessons =
          course.modules?.reduce(
            (acc, m) =>
              acc +
              (m.lessons?.filter((l) => completedIds.has(l.id)).length ?? 0),
            0,
          ) ?? 0;
        const percent = Math.round((completedLessons / totalLessons) * 100);
        return { course, completedLessons, totalLessons, percent };
      })
      .filter(Boolean)
      .filter((c) => c!.percent > 0 && c!.percent < 100)
      .sort((a, b) => b!.percent - a!.percent)
      .slice(0, 3) as {
      course: (typeof courses)[number];
      completedLessons: number;
      totalLessons: number;
      percent: number;
    }[];
  }, [courses, lessonProgress]);

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <div className="size-7 rounded-lg bg-gradient-to-br from-[#AF0000] to-[#DC2626] flex items-center justify-center">
            <GraduationCap className="size-3.5 text-white" />
          </div>
          Formations en cours
        </h3>
        <Link
          href={`${prefix}/school`}
          className="text-xs text-[#AF0000] hover:text-[#DC2626] transition-colors font-medium"
        >
          Voir tout
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 w-40 bg-zinc-100 rounded mb-2" />
              <div className="h-2 bg-zinc-100 rounded-full" />
            </div>
          ))}
        </div>
      ) : courseProgress.length > 0 ? (
        <div className="space-y-4">
          {courseProgress.map(
            ({ course, completedLessons, totalLessons, percent }) => (
              <div key={course.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-medium text-foreground truncate max-w-[180px]">
                    {course.title}
                  </p>
                  <span className="text-xs font-mono text-muted-foreground tabular-nums">
                    {completedLessons}/{totalLessons}
                  </span>
                </div>
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#AF0000] to-[#DC2626] rounded-full transition-all duration-700"
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {percent}% complete
                </p>
              </div>
            ),
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Commence une formation pour voir ta progression ici.
        </p>
      )}
    </div>
  );
}

// ===================================================================
// GOAL PROGRESS SECTION
// ===================================================================

function GoalProgressSection({ prefix }: { prefix: string }) {
  const { activeGoals, isLoading } = useCoachingGoals();

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <div className="size-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
            <Target className="size-3.5 text-white" />
          </div>
          Objectifs actifs
        </h3>
        <Link
          href={`${prefix}/goals`}
          className="text-xs text-[#AF0000] hover:text-[#DC2626] transition-colors font-medium"
        >
          Voir tout
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-12 bg-zinc-50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : activeGoals.length > 0 ? (
        <div className="space-y-3">
          {activeGoals.slice(0, 3).map((goal) => {
            const progress =
              goal.target_value && goal.target_value > 0
                ? Math.min(
                    Math.round(
                      ((goal.current_value ?? 0) / goal.target_value) * 100,
                    ),
                    100,
                  )
                : 0;

            return (
              <div
                key={goal.id}
                className="p-3 rounded-xl bg-zinc-50/80 border border-zinc-100"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                    {goal.title}
                  </p>
                  {goal.target_value ? (
                    <span className="text-xs font-mono text-muted-foreground tabular-nums">
                      {goal.current_value ?? 0}/{goal.target_value}
                      {goal.unit ? ` ${goal.unit}` : ""}
                    </span>
                  ) : null}
                </div>
                {goal.target_value ? (
                  <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground">
                    {goal.description ?? "Pas de cible definie"}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Aucun objectif actif. Definis-en un pour suivre ta progression.
        </p>
      )}
    </div>
  );
}

// ===================================================================
// RECENT JOURNAL SECTION
// ===================================================================

function RecentJournalSection({ prefix }: { prefix: string }) {
  const { entries, isLoading } = useJournal();
  const recentEntries = entries.slice(0, 3);

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <div className="size-7 rounded-lg bg-gradient-to-br from-zinc-600 to-zinc-700 flex items-center justify-center">
            <PenLine className="size-3.5 text-white" />
          </div>
          Journal recent
        </h3>
        <Link
          href={`${prefix}/journal`}
          className="text-xs text-[#AF0000] hover:text-[#DC2626] transition-colors font-medium"
        >
          Voir tout
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-12 bg-zinc-50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : recentEntries.length > 0 ? (
        <div className="space-y-2">
          {recentEntries.map((entry) => {
            const dateStr = new Date(entry.created_at).toLocaleDateString(
              "fr-FR",
              { day: "numeric", month: "short" },
            );
            return (
              <div
                key={entry.id}
                className="p-3 rounded-xl bg-zinc-50/80 border border-zinc-100 hover:border-zinc-200 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
                    {entry.title}
                  </p>
                  <span className="text-[10px] text-muted-foreground shrink-0">
                    {dateStr}
                  </span>
                </div>
                {entry.tags && entry.tags.length > 0 && (
                  <div className="flex items-center gap-1 mt-1">
                    {entry.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#AF0000]/5 text-[#AF0000] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-3">
            Aucune entree de journal.
          </p>
          <Link
            href={`${prefix}/journal`}
            className="text-xs text-[#AF0000] font-medium hover:text-[#DC2626] transition-colors"
          >
            Ecrire une premiere entree
          </Link>
        </div>
      )}
    </div>
  );
}

// ===================================================================
// BADGES SECTION
// ===================================================================

function BadgesSection() {
  const { summary, isLoading } = useXp();
  const { data: offers } = useMyUpsellOffers();
  const badges = summary.badges;
  const recentBadges = badges.slice(0, 5);

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <div className="size-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
          <Trophy className="size-3.5 text-white" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">
          Badges obtenus
        </h3>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums bg-zinc-100 px-2 py-0.5 rounded-full">
          {badges.length} badge{badges.length !== 1 ? "s" : ""}
        </span>
      </div>

      {isLoading ? (
        <div className="flex gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="size-12 bg-zinc-50 rounded-xl animate-pulse"
            />
          ))}
        </div>
      ) : recentBadges.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {recentBadges.map((userBadge) => (
            <div
              key={userBadge.id}
              className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-gradient-to-b from-amber-50/80 to-white border border-amber-200/40 hover:border-amber-300/60 hover:shadow-sm transition-all"
              title={userBadge.badge?.description ?? userBadge.badge?.name}
            >
              <div className="size-11 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center text-lg shadow-inner">
                {userBadge.badge?.icon ?? "\ud83c\udfc5"}
              </div>
              <span className="text-[9px] font-semibold text-foreground text-center max-w-[60px] truncate">
                {userBadge.badge?.name ?? "Badge"}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Continue ta progression pour debloquer des badges !
        </p>
      )}

      {/* Upsell offer card */}
      {offers && offers.length > 0 && (
        <div className="mt-4 pt-4 border-t border-zinc-200">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#AF0000]/5 to-transparent border border-[#AF0000]/10 hover:border-[#AF0000]/20 transition-colors">
            <div className="size-9 rounded-xl bg-gradient-to-br from-[#AF0000] to-[#DC2626] flex items-center justify-center shrink-0 shadow-sm shadow-[#AF0000]/20">
              <Gift className="size-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground">
                {offers[0].rule?.offer_title ?? "Offre speciale disponible"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {offers[0].rule?.offer_description ??
                  "Decouvre notre offre exclusive"}
              </p>
            </div>
            <ChevronRight className="size-4 text-[#AF0000]/50 shrink-0" />
          </div>
        </div>
      )}
    </div>
  );
}

// ===================================================================
// COMMUNITY HIGHLIGHTS SECTION
// ===================================================================

function CommunitySection({ prefix }: { prefix: string }) {
  const { data: announcements, isLoading } = useAnnouncements();
  const recentAnnouncements = (announcements ?? []).slice(0, 3);

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 transition-all duration-200 hover:shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <div className="size-7 rounded-lg bg-gradient-to-br from-[#AF0000] to-[#DC2626] flex items-center justify-center">
            <Megaphone className="size-3.5 text-white" />
          </div>
          Actualites
        </h3>
        <Link
          href={`${prefix}/community`}
          className="text-xs text-[#AF0000] hover:text-[#DC2626] transition-colors font-medium"
        >
          Voir tout
        </Link>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-12 bg-zinc-50 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : recentAnnouncements.length > 0 ? (
        <div className="space-y-2">
          {recentAnnouncements.map((ann) => {
            const dateStr = new Date(ann.created_at).toLocaleDateString(
              "fr-FR",
              { day: "numeric", month: "short" },
            );
            return (
              <div
                key={ann.id}
                className="p-3 rounded-xl bg-zinc-50/80 border border-zinc-100 flex items-start gap-3 hover:border-zinc-200 transition-colors"
              >
                <div
                  className={cn(
                    "size-8 rounded-lg flex items-center justify-center shrink-0",
                    ann.type === "info"
                      ? "bg-gradient-to-br from-blue-100 to-blue-50"
                      : ann.type === "success"
                        ? "bg-gradient-to-br from-emerald-100 to-emerald-50"
                        : ann.type === "warning"
                          ? "bg-gradient-to-br from-amber-100 to-amber-50"
                          : "bg-zinc-100",
                  )}
                >
                  <Megaphone
                    className={cn(
                      "size-4",
                      ann.type === "info"
                        ? "text-blue-500"
                        : ann.type === "success"
                          ? "text-emerald-500"
                          : ann.type === "warning"
                            ? "text-amber-500"
                            : "text-muted-foreground",
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {ann.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground">{dateStr}</p>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Aucune annonce pour le moment.
        </p>
      )}
    </div>
  );
}
