"use client";

import { use, useState, useMemo } from "react";
import Link from "next/link";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { useCourse, useLessonProgress } from "@/hooks/use-courses";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/types/database";
import {
  ArrowLeft,
  Play,
  FileText,
  File,
  HelpCircle,
  PenTool,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Edit,
  Lock,
} from "lucide-react";

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { data: course, isLoading } = useCourse(courseId);
  const { isStaff } = useAuth();
  const prefix = useRoutePrefix();
  const { data: progress } = useLessonProgress();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  const completedIds = useMemo(() => {
    const set = new Set<string>();
    progress?.forEach((p) => {
      if (p.status === "completed") set.add(p.lesson_id);
    });
    return set;
  }, [progress]);

  // Build flat lesson list for sequential unlock check
  const allLessons = useMemo(() => {
    if (!course?.modules) return [];
    return course.modules
      .sort((a, b) => a.sort_order - b.sort_order)
      .flatMap((mod) =>
        (mod.lessons ?? []).sort((a, b) => a.sort_order - b.sort_order)
      );
  }, [course]);

  const isLessonUnlocked = (lesson: Lesson) => {
    if (isStaff) return true; // Staff can access all
    const idx = allLessons.findIndex((l) => l.id === lesson.id);
    if (idx <= 0) return true;
    return completedIds.has(allLessons[idx - 1].id);
  };

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const lessonIcon = (type: string) => {
    switch (type) {
      case "video": return Play;
      case "text": return FileText;
      case "pdf": return File;
      case "quiz": return HelpCircle;
      case "assignment": return PenTool;
      default: return FileText;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-20 bg-muted rounded" />
        <div className="h-48 bg-muted rounded-xl" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Cours non trouve</p>
      </div>
    );
  }

  const totalLessons = allLessons.length;
  const completedCount = allLessons.filter((l) => completedIds.has(l.id)).length;
  const progressPercent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`${prefix}/school`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
        {isStaff && (
          <Link
            href={`${prefix}/school/builder/${courseId}`}
            className="h-9 px-3 rounded-[10px] border border-border text-sm flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </Link>
        )}
      </div>

      {/* Course header */}
      <div
        className="h-48 rounded-xl relative overflow-hidden flex items-end p-6"
        style={{
          background: course.cover_image_url
            ? `url(${course.cover_image_url}) center/cover`
            : "linear-gradient(135deg, #AF0000 0%, #18181B 100%)",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="relative z-10">
          <h1 className="text-2xl font-semibold text-white">{course.title}</h1>
          {course.description && (
            <p className="text-sm text-white/70 mt-1">{course.description}</p>
          )}
        </div>
        {/* Progress bar */}
        {progressPercent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
            <div className="h-full bg-success transition-all" style={{ width: `${progressPercent}%` }} />
          </div>
        )}
      </div>

      {/* Progress summary */}
      {totalLessons > 0 && (
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-success transition-all rounded-full" style={{ width: `${progressPercent}%` }} />
          </div>
          <span className="text-xs font-mono shrink-0">
            {completedCount}/{totalLessons} ({progressPercent}%)
          </span>
        </div>
      )}

      {/* Modules */}
      <div className="space-y-3">
        {course.modules
          ?.sort((a, b) => a.sort_order - b.sort_order)
          .map((mod) => {
            const isExpanded = expandedModules.has(mod.id);
            const sortedLessons = mod.lessons?.sort(
              (a, b) => a.sort_order - b.sort_order
            ) ?? [];

            const completedInModule = sortedLessons.filter((l) =>
              completedIds.has(l.id)
            ).length;

            return (
              <div
                key={mod.id}
                className="bg-surface border border-border rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/50 transition-colors"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  )}
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-foreground">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {sortedLessons.length} lecon{sortedLessons.length !== 1 ? "s" : ""}
                      {completedInModule > 0 && (
                        <span className="ml-2 text-success">
                          · {completedInModule}/{sortedLessons.length} terminee{completedInModule !== 1 ? "s" : ""}
                        </span>
                      )}
                    </p>
                  </div>
                  {completedInModule === sortedLessons.length && sortedLessons.length > 0 && (
                    <CheckCircle className="w-4 h-4 text-success shrink-0" />
                  )}
                </button>

                {isExpanded && sortedLessons.length > 0 && (
                  <div className="border-t border-border">
                    {sortedLessons.map((lesson) => {
                      const Icon = lessonIcon(lesson.content_type);
                      const lessonCompleted = completedIds.has(lesson.id);
                      const unlocked = isLessonUnlocked(lesson);

                      if (!unlocked) {
                        return (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 opacity-50 cursor-not-allowed"
                          >
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-muted">
                              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                            <span className="text-sm flex-1 text-muted-foreground">
                              {lesson.title}
                            </span>
                          </div>
                        );
                      }

                      return (
                        <Link
                          key={lesson.id}
                          href={`${prefix}/school/${courseId}/${lesson.id}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors border-b border-border last:border-0"
                        >
                          <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center",
                            lessonCompleted ? "bg-success/10" : "bg-muted"
                          )}>
                            {lessonCompleted ? (
                              <CheckCircle className="w-3.5 h-3.5 text-success" />
                            ) : (
                              <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                            )}
                          </div>
                          <span className={cn(
                            "text-sm flex-1",
                            lessonCompleted ? "text-muted-foreground line-through" : "text-foreground"
                          )}>
                            {lesson.title}
                          </span>
                          {lesson.estimated_duration && (
                            <span className="text-xs text-muted-foreground">
                              {lesson.estimated_duration}min
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
