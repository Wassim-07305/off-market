"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { useCourses, useLessonProgress } from "@/hooks/use-courses";
import { useCourseUnlockStatus } from "@/hooks/use-course-prerequisites";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import {
  BookOpen,
  CheckCircle,
  GraduationCap,
  Clock,
  Layers,
  Lock,
  Search,
  Settings,
} from "lucide-react";

type FilterTab = "all" | "in_progress" | "completed" | "not_started";

function getCourseStats(
  course: {
    modules?: Array<{
      lessons?: Array<{ id: string; estimated_duration?: number | null }>;
    }>;
    estimated_duration?: number | null;
  },
  completedIds: Set<string>,
) {
  const allLessons = course.modules?.flatMap((m) => m.lessons ?? []) ?? [];
  const totalModules = course.modules?.length ?? 0;
  const totalLessons = allLessons.length;
  const totalDuration = course.estimated_duration ?? 0;
  const completedLessons = allLessons.filter((l) =>
    completedIds.has(l.id),
  ).length;
  const percent =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  return {
    totalModules,
    totalLessons,
    totalDuration,
    completedLessons,
    percent,
  };
}

export default function SchoolPage() {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const { data: courses, isLoading } = useCourses("published");
  const { data: progress } = useLessonProgress();
  const { isStaff } = useAuth();
  const prefix = useRoutePrefix();
  const { unlockMap, getCourseTitle } = useCourseUnlockStatus();

  const completedIds = useMemo(() => {
    const set = new Set<string>();
    progress?.forEach((p) => {
      if (p.status === "completed") set.add(p.lesson_id);
    });
    return set;
  }, [progress]);

  const coursesWithStats = useMemo(
    () =>
      (courses ?? []).map((c) => ({
        ...c,
        stats: getCourseStats(c, completedIds),
      })),
    [courses, completedIds],
  );

  const filtered = useMemo(() => {
    let list = coursesWithStats;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((c) => c.title.toLowerCase().includes(q));
    }

    switch (tab) {
      case "in_progress":
        list = list.filter(
          (c) =>
            c.stats.completedLessons > 0 &&
            c.stats.completedLessons < c.stats.totalLessons,
        );
        break;
      case "completed":
        list = list.filter(
          (c) =>
            c.stats.totalLessons > 0 &&
            c.stats.completedLessons === c.stats.totalLessons,
        );
        break;
      case "not_started":
        list = list.filter((c) => c.stats.completedLessons === 0);
        break;
    }

    return list;
  }, [coursesWithStats, search, tab]);

  const tabs: { value: FilterTab; label: string }[] = [
    { value: "all", label: "Toutes" },
    { value: "in_progress", label: "En cours" },
    { value: "completed", label: "Terminées" },
    { value: "not_started", label: "Non commencées" },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={staggerItem}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">
            Formation
          </h1>
          <p className="text-sm text-muted-foreground/80 mt-1.5 leading-relaxed">
            Formez-vous et developpez vos competences
          </p>
        </div>
        {isStaff && (
          <Link
            href={`${prefix}/school/admin`}
            className="h-9 px-4 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all inline-flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Gerer les formations
          </Link>
        )}
      </motion.div>

      {/* Tabs + Search */}
      <motion.div
        variants={staggerItem}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-0.5 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "h-9 px-3.5 text-xs font-medium transition-all relative",
                tab === t.value
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              {tab === t.value && (
                <span className="absolute bottom-0 left-1 right-1 h-0.5 rounded-full bg-gradient-to-r from-[#AF0000] to-[#DC2626]" />
              )}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground/60" />
          <input
            placeholder="Rechercher une formation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground/60 border-0 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
          />
        </div>
      </motion.div>

      {/* Course grid */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white border border-border rounded-xl overflow-hidden"
            >
              <div className="aspect-video bg-muted animate-shimmer" />
              <div className="p-4 space-y-3">
                <div className="h-4 w-2/3 bg-muted rounded animate-shimmer" />
                <div className="h-3 w-full bg-muted rounded animate-shimmer" />
                <div className="h-3 w-1/2 bg-muted rounded animate-shimmer" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground">
            <GraduationCap className="w-12 h-12 opacity-30 mb-4" />
            <p className="text-sm">Aucune formation disponible</p>
          </div>
        ) : (
          filtered.map((course) => {
            const isComplete =
              course.stats.totalLessons > 0 && course.stats.percent === 100;
            const unlock = unlockMap.get(course.id);
            const isLocked = !isStaff && unlock && !unlock.isUnlocked;

            const card = (
              <div
                className={cn(
                  "h-full bg-white dark:bg-surface border border-border rounded-xl overflow-hidden transition-all duration-200",
                  isLocked
                    ? "opacity-70"
                    : "hover:border-zinc-300 dark:hover:border-zinc-600 hover:shadow-lg hover:-translate-y-0.5",
                )}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden rounded-t-xl">
                  {course.cover_image_url ? (
                    <>
                      <div
                        className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                        style={{
                          backgroundImage: `url(${course.cover_image_url})`,
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/5 to-transparent" />
                    </>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#AF0000]/5 via-zinc-100 to-[#DC2626]/5 dark:from-[#AF0000]/10 dark:via-zinc-800 dark:to-[#DC2626]/10">
                      <BookOpen className="w-12 h-12 text-[#AF0000]/30" />
                    </div>
                  )}

                  {isComplete && (
                    <div className="absolute right-2.5 top-2.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full bg-emerald-500 text-white shadow-sm shadow-emerald-500/30">
                        <CheckCircle className="w-3 h-3" />
                        Termine
                      </span>
                    </div>
                  )}

                  {isLocked && (
                    <div className="absolute inset-0 bg-white/70 dark:bg-black/50 backdrop-blur-[3px] flex items-center justify-center">
                      <div className="text-center">
                        <Lock className="w-6 h-6 mx-auto mb-1 text-zinc-500" />
                        <p className="text-[11px] font-medium text-zinc-600 dark:text-zinc-400">
                          Prerequis requis
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Duration badge top-left */}
                  {!isLocked && course.stats.totalDuration > 0 && (
                    <div className="absolute left-2.5 top-2.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-black/50 text-white backdrop-blur-sm">
                        <Clock className="w-2.5 h-2.5" />
                        {Math.round(course.stats.totalDuration / 60)}h
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                  <h3
                    className={cn(
                      "text-sm font-bold line-clamp-1 transition-colors tracking-tight",
                      isLocked
                        ? "text-muted-foreground"
                        : "text-foreground group-hover:text-[#AF0000]",
                    )}
                  >
                    {course.title}
                  </h3>

                  {course.description && (
                    <p className="mt-1.5 text-xs text-muted-foreground/80 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>
                  )}

                  {/* Prerequisite info */}
                  {isLocked && unlock && (
                    <div className="mt-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                      <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                        Terminez d&apos;abord :
                      </p>
                      <ul className="mt-1 space-y-0.5">
                        {unlock.missingPrereqs.map((pid) => (
                          <li
                            key={pid}
                            className="text-[10px] text-amber-600 dark:text-amber-500 flex items-center gap-1"
                          >
                            <Lock className="w-2.5 h-2.5 shrink-0" />
                            {getCourseTitle(pid)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="mt-3 flex items-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      {course.stats.totalModules} modules
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {course.stats.totalLessons} lecons
                    </span>
                  </div>

                  {/* Progress */}
                  {!isLocked && (
                    <div className="mt-auto pt-3">
                      <div className="mb-1.5 flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">
                          {course.stats.completedLessons}/
                          {course.stats.totalLessons} lecons
                        </span>
                        <span className="font-bold font-mono text-foreground">
                          {course.stats.percent}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            course.stats.percent === 100
                              ? "bg-emerald-500"
                              : "bg-gradient-to-r from-[#AF0000] to-[#DC2626]",
                          )}
                          style={{ width: `${course.stats.percent}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );

            if (isLocked) {
              return (
                <div key={course.id} className="cursor-not-allowed">
                  {card}
                </div>
              );
            }

            return (
              <Link
                key={course.id}
                href={`${prefix}/school/${course.id}`}
                className="group"
              >
                {card}
              </Link>
            );
          })
        )}
      </motion.div>
    </motion.div>
  );
}
