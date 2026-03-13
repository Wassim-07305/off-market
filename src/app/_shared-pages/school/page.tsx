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
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            Formation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
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
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-center gap-1.5">
          {tabs.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={cn(
                "h-8 px-3 rounded-full text-xs font-medium transition-all",
                tab === t.value
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Rechercher une formation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl bg-muted/50 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
          />
        </div>
      </motion.div>

      {/* Course grid */}
      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface rounded-2xl overflow-hidden"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="aspect-video bg-muted animate-shimmer" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-2/3 bg-muted rounded-lg animate-shimmer" />
                <div className="h-3 w-full bg-muted rounded-lg animate-shimmer" />
                <div className="h-3 w-1/2 bg-muted rounded-lg animate-shimmer" />
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
                  "h-full bg-surface rounded-2xl overflow-hidden transition-all duration-200",
                  isLocked
                    ? "opacity-75"
                    : "hover:scale-[1.02] hover:shadow-lg",
                )}
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  {course.cover_image_url ? (
                    <div
                      className="w-full h-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                      style={{
                        backgroundImage: `url(${course.cover_image_url})`,
                      }}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-zinc-900">
                      <BookOpen className="w-12 h-12 text-white/20" />
                    </div>
                  )}

                  {isComplete && (
                    <div className="absolute right-3 top-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-success text-white">
                        <CheckCircle className="w-3 h-3" />
                        Termine
                      </span>
                    </div>
                  )}

                  {isLocked && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="text-center text-white">
                        <Lock className="w-8 h-8 mx-auto mb-1.5 opacity-90" />
                        <p className="text-xs font-medium">Prerequis requis</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                  <h3
                    className={cn(
                      "text-base font-display font-semibold line-clamp-1 transition-colors",
                      isLocked
                        ? "text-muted-foreground"
                        : "text-foreground group-hover:text-primary",
                    )}
                  >
                    {course.title}
                  </h3>

                  {course.description && (
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                      {course.description}
                    </p>
                  )}

                  {/* Prerequisite info */}
                  {isLocked && unlock && (
                    <div className="mt-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <p className="text-[11px] text-amber-700 font-medium">
                        Terminez d&apos;abord :
                      </p>
                      <ul className="mt-1 space-y-0.5">
                        {unlock.missingPrereqs.map((pid) => (
                          <li
                            key={pid}
                            className="text-[11px] text-amber-600 flex items-center gap-1"
                          >
                            <Lock className="w-3 h-3 shrink-0" />
                            {getCourseTitle(pid)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <span>{course.stats.totalModules} modules</span>
                    <span aria-hidden="true">&middot;</span>
                    <span>{course.stats.totalLessons} lecons</span>
                    {course.stats.totalDuration > 0 && (
                      <>
                        <span aria-hidden="true">&middot;</span>
                        <span>
                          {Math.round(course.stats.totalDuration / 60)}h
                        </span>
                      </>
                    )}
                  </div>

                  {/* Progress */}
                  {!isLocked && (
                    <div className="mt-auto pt-4">
                      <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          {course.stats.completedLessons}/
                          {course.stats.totalLessons} lecons
                        </span>
                        <span className="font-medium font-mono">
                          {course.stats.percent}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-all duration-500"
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
