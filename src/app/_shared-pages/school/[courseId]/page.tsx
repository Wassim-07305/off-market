"use client";

import { use, useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import {
  useCourse,
  useLessonProgress,
  useMarkLessonComplete,
} from "@/hooks/use-courses";
import {
  useCoursePrerequisites,
  useCourseUnlockStatus,
} from "@/hooks/use-course-prerequisites";
import { CourseCompletion } from "@/components/school/course-completion";
import { EnhancedVideoPlayer } from "@/components/school/video-player";
import { ActionChecklist } from "@/components/school/action-checklist";
import { useAuth } from "@/hooks/use-auth";
import { useLessonTimer, formatTimeSpent } from "@/hooks/use-lesson-timer";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import type { Lesson } from "@/types/database";
import type { QuizConfig } from "@/types/quiz";
import { QuizPlayer } from "@/components/school/quiz-player";
import { AssignmentSubmission } from "@/components/school/assignment-submission";
import { ExerciseReview } from "@/components/school/exercise-review";
import { QuizExerciseStats } from "@/components/school/quiz-exercise-stats";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Play,
  CheckCircle,
  Circle,
  Lock,
  ChevronDown,
  ChevronRight,
  FileText,
  Video,
  Headphones,
  File,
  Download,
  Loader2,
  Menu,
  X,
  PlayCircle,
  Clock,
  ClipboardList,
  HelpCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// Content type visual config
// ---------------------------------------------------------------------------

const CONTENT_TYPE_ICONS: Record<
  string,
  { icon: LucideIcon; label: string; color: string }
> = {
  video: { icon: Video, label: "Video", color: "text-blue-500" },
  text: { icon: FileText, label: "Texte", color: "text-emerald-500" },
  quiz: { icon: HelpCircle, label: "Quiz", color: "text-amber-500" },
  assignment: {
    icon: ClipboardList,
    label: "Exercice",
    color: "text-purple-500",
  },
  pdf: { icon: File, label: "PDF", color: "text-red-500" },
};

function getContentIcon(type?: string) {
  return CONTENT_TYPE_ICONS[type ?? ""] ?? CONTENT_TYPE_ICONS.text;
}

function getAttachmentIcon(type: string) {
  if (
    type.includes("pdf") ||
    type.includes("document") ||
    type.includes("text")
  )
    return FileText;
  if (type.includes("video")) return Video;
  if (type.includes("audio")) return Headphones;
  return File;
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function CourseViewPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const prefix = useRoutePrefix();
  const { isStaff } = useAuth();
  const { sidebarCollapsed } = useUIStore();

  const { data: course, isLoading } = useCourse(courseId);
  const { data: progress } = useLessonProgress();
  const markComplete = useMarkLessonComplete();
  const { data: prerequisites } = useCoursePrerequisites(courseId);
  const { unlockMap, getCourseTitle } = useCourseUnlockStatus();

  // Flatten lessons
  const flatLessons = useMemo(() => {
    if (!course?.modules) return [];
    return course.modules
      .sort((a, b) => a.sort_order - b.sort_order)
      .flatMap((mod) =>
        (mod.lessons ?? [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((l) => ({
            ...l,
            moduleId: mod.id,
            moduleTitle: mod.title,
          })),
      );
  }, [course]);

  const completedIds = useMemo(() => {
    const set = new Set<string>();
    progress?.forEach((p) => {
      if (p.status === "completed") set.add(p.lesson_id);
    });
    return set;
  }, [progress]);

  const totalLessons = flatLessons.length;
  const completedCount = flatLessons.filter((l) =>
    completedIds.has(l.id),
  ).length;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Sequential unlock
  const isLessonUnlocked = useCallback(
    (lessonId: string): boolean => {
      if (isStaff) return true;
      const idx = flatLessons.findIndex((l) => l.id === lessonId);
      if (idx <= 0) return true;
      return completedIds.has(flatLessons[idx - 1].id);
    },
    [flatLessons, completedIds, isStaff],
  );

  // Find first incomplete lesson
  const firstIncompleteLessonId = useMemo(() => {
    for (const lesson of flatLessons) {
      if (!completedIds.has(lesson.id)) return lesson.id;
    }
    return flatLessons[0]?.id ?? null;
  }, [flatLessons, completedIds]);

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Track time spent on the selected lesson
  useLessonTimer(selectedLessonId ?? undefined);

  // Build a map of time_spent per lesson from progress data
  const timeByLesson = useMemo(() => {
    const map: Record<string, number> = {};
    // progress only has lesson_id, status, completed_at — time is from extended query
    return map;
  }, []);

  // Auto-select first incomplete lesson when course loads
  useEffect(() => {
    if (!selectedLessonId && firstIncompleteLessonId) {
      setSelectedLessonId(firstIncompleteLessonId);
    }
  }, [firstIncompleteLessonId, selectedLessonId]);

  const selectedLesson = useMemo(
    () => flatLessons.find((l) => l.id === selectedLessonId) ?? null,
    [flatLessons, selectedLessonId],
  );

  const selectedLessonIndex = useMemo(
    () => flatLessons.findIndex((l) => l.id === selectedLessonId),
    [flatLessons, selectedLessonId],
  );

  // Expanded modules
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    () => new Set(),
  );

  // Auto-expand modules with progress
  useEffect(() => {
    if (!course?.modules) return;
    const initial = new Set<string>();
    for (const mod of course.modules) {
      const hasIncomplete = mod.lessons?.some((l) => !completedIds.has(l.id));
      const hasCompleted = mod.lessons?.some((l) => completedIds.has(l.id));
      if (hasIncomplete || hasCompleted) initial.add(mod.id);
    }
    if (initial.size === 0 && course.modules.length > 0) {
      initial.add(course.modules[0].id);
    }
    setExpandedModules(initial);
  }, [course, completedIds]);

  // Mobile sidebar
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  function toggleModule(moduleId: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) next.delete(moduleId);
      else next.add(moduleId);
      return next;
    });
  }

  function selectLesson(lessonId: string) {
    if (!isLessonUnlocked(lessonId)) return;
    setSelectedLessonId(lessonId);
    setMobileSidebarOpen(false);
  }

  function handleMarkComplete() {
    if (!selectedLessonId) return;
    if (completedIds.has(selectedLessonId)) return;

    markComplete.mutate(selectedLessonId, {
      onSuccess: () => toast.success("Leçon terminée !"),
      onError: () => toast.error("Erreur lors de la mise à jour"),
    });
  }

  function navigateLesson(direction: "prev" | "next") {
    const newIndex =
      direction === "prev" ? selectedLessonIndex - 1 : selectedLessonIndex + 1;
    if (newIndex < 0 || newIndex >= flatLessons.length) return;
    const target = flatLessons[newIndex];
    if (!isLessonUnlocked(target.id)) return;
    selectLesson(target.id);
  }

  // Loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <p className="text-center text-muted-foreground py-16">
        Cours non trouvé
      </p>
    );
  }

  // Prerequisite gate (staff bypasses)
  const courseUnlock = unlockMap.get(courseId);
  if (!isStaff && courseUnlock && !courseUnlock.isUnlocked) {
    return (
      <div className="max-w-lg mx-auto text-center py-20 px-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-5">
          <Lock className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-xl font-display font-bold text-foreground mb-2">
          Formation verrouillee
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Vous devez terminér les formations suivantes avant d&apos;acceder a ce
          cours :
        </p>
        <div className="space-y-2 mb-8">
          {courseUnlock.missingPrereqs.map((pid) => (
            <Link
              key={pid}
              href={`${prefix}/school/${pid}`}
              className="flex items-center gap-3 p-3 rounded-xl border border-border bg-surface hover:bg-muted/50 transition-colors text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground">
                {getCourseTitle(pid)}
              </span>
              <ArrowRight className="w-4 h-4 text-muted-foreground ml-auto" />
            </Link>
          ))}
        </div>
        <Link
          href={`${prefix}/school`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux formations
        </Link>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Sidebar content
  // ---------------------------------------------------------------------------
  // eslint-disable-next-line react/no-unstable-nested-components -- intentional render helper
  function renderSidebar() {
    if (!course) return null;
    return (
      <>
        {/* Course title + back */}
        <div className="px-4 py-3.5 border-b border-border">
          <Link
            href={`${prefix}/school`}
            className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground mb-2.5 transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Retour aux formations
          </Link>
          <h2 className="text-sm font-semibold leading-snug text-foreground">
            {course.title}
          </h2>
        </div>

        {/* Progress */}
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-foreground font-mono">
              {progressPercent}%
            </span>
            <span className="text-[11px] text-muted-foreground">
              {completedCount}/{totalLessons} terminées
            </span>
          </div>
          <div className="h-1 w-full rounded-full bg-zinc-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Modules */}
        <div className="flex-1 overflow-y-auto">
          <div className="py-2">
            {course.modules
              ?.sort((a, b) => a.sort_order - b.sort_order)
              .map((mod) => {
                const isExpanded = expandedModules.has(mod.id);
                const sortedLessons = (mod.lessons ?? []).sort(
                  (a, b) => a.sort_order - b.sort_order,
                );
                const moduleCompletedCount = sortedLessons.filter((l) =>
                  completedIds.has(l.id),
                ).length;

                return (
                  <div key={mod.id}>
                    <button
                      onClick={() => toggleModule(mod.id)}
                      className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted/40 transition-colors group"
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {isExpanded ? (
                          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        )}
                        <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground group-hover:text-foreground truncate transition-colors">
                          {mod.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-muted-foreground/70 shrink-0 ml-2 font-mono">
                        {moduleCompletedCount}/{sortedLessons.length}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="pb-0.5">
                        {sortedLessons.map((lesson, lessonIdx) => {
                          const completed = completedIds.has(lesson.id);
                          const isActive = selectedLessonId === lesson.id;
                          const unlocked = isLessonUnlocked(lesson.id);
                          const lessonContent = lesson.content as
                            | Record<string, string>
                            | undefined;
                          const hasVideo = !!(
                            lesson.video_url ??
                            lessonContent?.video_url ??
                            lessonContent?.url
                          );
                          const effectiveType =
                            lesson.content_type === "video" && !hasVideo
                              ? "text"
                              : lesson.content_type;
                          const contentConfig = getContentIcon(effectiveType);
                          const ContentIcon = contentConfig.icon;

                          return (
                            <button
                              key={lesson.id}
                              disabled={!unlocked}
                              onClick={() => selectLesson(lesson.id)}
                              className={cn(
                                "w-full flex items-center gap-2.5 pl-6 pr-3 py-2 text-left transition-colors relative",
                                isActive &&
                                  "bg-primary/5 border-l-2 border-primary",
                                !isActive && unlocked && "hover:bg-muted/30",
                                !unlocked && "opacity-35 cursor-not-allowed",
                              )}
                            >
                              <span className="shrink-0 relative">
                                {completed ? (
                                  <CheckCircle className="h-3.5 w-3.5 text-primary" />
                                ) : isActive ? (
                                  <Play className="h-3.5 w-3.5 text-primary" />
                                ) : unlocked ? (
                                  <ContentIcon
                                    className={cn(
                                      "h-3.5 w-3.5",
                                      contentConfig.color,
                                    )}
                                  />
                                ) : (
                                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                                )}
                              </span>

                              <div className="min-w-0 flex-1">
                                <p
                                  className={cn(
                                    "text-[13px] truncate",
                                    isActive && "font-medium text-foreground",
                                    completed &&
                                      !isActive &&
                                      "text-muted-foreground",
                                    !completed &&
                                      !isActive &&
                                      unlocked &&
                                      "text-foreground",
                                  )}
                                >
                                  {lesson.title}
                                </p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                  <span
                                    className={cn(
                                      "text-[10px]",
                                      contentConfig.color,
                                    )}
                                  >
                                    {contentConfig.label}
                                  </span>
                                  {lesson.estimated_duration != null &&
                                    lesson.estimated_duration > 0 && (
                                      <span className="text-[10px] text-muted-foreground/60 flex items-center gap-0.5">
                                        <Clock className="w-2.5 h-2.5" />
                                        {lesson.estimated_duration} min
                                      </span>
                                    )}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </>
    );
  }

  // ---------------------------------------------------------------------------
  // Lesson content helpers
  // ---------------------------------------------------------------------------
  const content = selectedLesson?.content as Record<string, string> | undefined;
  const videoUrl =
    selectedLesson?.video_url ?? content?.video_url ?? content?.url;
  // NOTE: content_html is admin-authored content stored in DB, not user-generated
  const htmlContent = selectedLesson?.content_html ?? content?.html;
  const attachments = (selectedLesson?.attachments ?? []) as Array<{
    name: string;
    url: string;
    type: string;
  }>;

  return (
    <div
      className={cn(
        "fixed top-16 right-0 bottom-0 flex bg-background z-20",
        sidebarCollapsed ? "lg:left-[72px]" : "lg:left-64",
        "left-0",
      )}
    >
      {/* Mobile sidebar toggle */}
      <div className="md:hidden fixed top-[4.5rem] left-4 z-40">
        <button
          onClick={() => setMobileSidebarOpen((v) => !v)}
          className="h-9 px-3 rounded-xl border border-border bg-surface text-sm font-medium shadow-md flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Menu className="h-4 w-4" />
          Menu du cours
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[350px] bg-surface border-r border-border shadow-sm flex flex-col animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-end p-3 border-b border-border">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-1 rounded-md hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderSidebar()}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-[350px] shrink-0 border-r border-border bg-surface flex-col overflow-hidden">
        {renderSidebar()}
      </aside>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-6 pt-14 md:pt-6 max-w-5xl">
          {selectedLesson ? (
            <>
              {/* Video */}
              {videoUrl && <EnhancedVideoPlayer videoUrl={videoUrl} />}

              {/* Title + Mark complete (like builder layout) */}
              <div className="flex items-start gap-3 mt-5">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-semibold text-foreground tracking-tight">
                    {selectedLesson.title}
                  </h1>
                  {selectedLesson.description && (
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                      {selectedLesson.description}
                    </p>
                  )}
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  {completedIds.has(selectedLesson.id) ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl">
                      <CheckCircle className="h-3 w-3" />
                      Terminé
                    </span>
                  ) : (
                    <button
                      onClick={handleMarkComplete}
                      disabled={markComplete.isPending}
                      className="h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {markComplete.isPending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle className="h-3.5 w-3.5" />
                      )}
                      {markComplete.isPending
                        ? "Enregistrement..."
                        : "Marquer comme terminé"}
                    </button>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      className="h-7 px-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={selectedLessonIndex <= 0}
                      onClick={() => navigateLesson("prev")}
                    >
                      <ArrowLeft className="h-3 w-3" />
                      Precedente
                    </button>
                    <button
                      className="h-7 px-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
                      disabled={
                        selectedLessonIndex >= flatLessons.length - 1 ||
                        !isLessonUnlocked(
                          flatLessons[selectedLessonIndex + 1]?.id ?? "",
                        )
                      }
                      onClick={() => navigateLesson("next")}
                    >
                      Suivante
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Quiz */}
              {selectedLesson.content_type === "quiz" &&
                (selectedLesson.content as unknown as QuizConfig)?.questions && (
                  <div className="mt-6">
                    <QuizPlayer
                      lessonId={selectedLesson.id}
                      config={selectedLesson.content as unknown as QuizConfig}
                      onComplete={(passed) => {
                        if (passed) {
                          markComplete.mutate(selectedLesson.id);
                          toast.success("Quiz reussi ! Leçon marquee comme terminee.");
                        }
                      }}
                    />
                  </div>
                )}

              {/* Quiz/Exercise stats (staff only) */}
              {isStaff && selectedLesson.content_type === "quiz" && (
                <div className="mt-4">
                  <QuizExerciseStats lessonId={selectedLesson.id} contentType={selectedLesson.content_type} />
                </div>
              )}

              {/* HTML content — admin-authored, stored in DB */}
              {htmlContent && (
                <div
                  className="prose prose-stone dark:prose-invert max-w-none mt-6 prose-headings:font-display prose-headings:tracking-tight"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(htmlContent),
                  }}
                />
              )}

              {/* Attachments */}
              {attachments.length > 0 && (
                <div>
                  <h3 className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2.5">
                    Ressources
                  </h3>
                  <div className="space-y-1.5">
                    {attachments.map((att, idx) => {
                      const Icon = getAttachmentIcon(att.type);
                      return (
                        <a
                          key={idx}
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2.5 rounded-lg border border-border bg-surface px-3.5 py-2.5 hover:border-zinc-300 transition-colors group"
                        >
                          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <span className="flex-1 text-[13px] font-medium truncate text-foreground">
                            {att.name}
                          </span>
                          <span className="text-[11px] text-primary font-medium group-hover:underline flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            Ouvrir
                          </span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Course completion + certificate */}
              {progressPercent === 100 && course && (
                <div className="mt-6">
                  <CourseCompletion course={course} />
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-80 text-muted-foreground gap-3">
              <PlayCircle className="h-12 w-12 text-muted-foreground/50" />
              <p className="text-sm">Sélectionnez une leçon pour commencer</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
