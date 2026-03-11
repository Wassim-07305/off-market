"use client";

import { use, useMemo, useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { useCourse, useLessonProgress, useMarkLessonComplete } from "@/hooks/use-courses";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { toast } from "sonner";
import type { Lesson, LessonAttachment } from "@/types/database";
import type { QuizConfig } from "@/types/quiz";
import { QuizPlayer } from "@/components/school/quiz-player";
import { AssignmentSubmission } from "@/components/school/assignment-submission";
import { ExerciseReview } from "@/components/school/exercise-review";
import { QuizExerciseStats } from "@/components/school/quiz-exercise-stats";
import { useAuth } from "@/hooks/use-auth";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Loader2,
  Lock,
  FileText,
  Video,
  Headphones,
  File,
  ExternalLink,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Video URL helpers
// ---------------------------------------------------------------------------

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

function getVimeoId(url: string): string | null {
  const match = url.match(/(?:vimeo\.com\/)(\d+)/);
  return match?.[1] ?? null;
}

function getLoomId(url: string): string | null {
  const match = url.match(/(?:loom\.com\/(?:share|embed)\/)([a-f0-9]+)/);
  return match?.[1] ?? null;
}

function getAttachmentIcon(type: string) {
  switch (type) {
    case "video": return Video;
    case "audio": return Headphones;
    case "document": return FileText;
    default: return File;
  }
}

// ---------------------------------------------------------------------------
// Sequential unlock check
// ---------------------------------------------------------------------------

function isLessonUnlocked(
  lesson: Lesson,
  allLessons: Lesson[],
  completedIds: Set<string>
): boolean {
  const idx = allLessons.findIndex((l) => l.id === lesson.id);
  if (idx <= 0) return true;
  return completedIds.has(allLessons[idx - 1].id);
}

// ---------------------------------------------------------------------------
// Page Component
// ---------------------------------------------------------------------------

export default function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = use(params);
  const supabase = useSupabase();
  const prefix = useRoutePrefix();
  const router = useRouter();
  const { isStaff } = useAuth();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [autoCompleted, setAutoCompleted] = useState(false);

  const { data: lesson, isLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .single();
      if (error) throw error;
      return data as Lesson;
    },
  });

  const { data: course } = useCourse(courseId);
  const { data: progress } = useLessonProgress();
  const markComplete = useMarkLessonComplete();

  // Build flat sorted list of all lessons
  const allLessons = useMemo(() => {
    if (!course?.modules) return [];
    return course.modules
      .sort((a, b) => a.sort_order - b.sort_order)
      .flatMap((mod) =>
        (mod.lessons ?? []).sort((a, b) => a.sort_order - b.sort_order)
      );
  }, [course]);

  const completedIds = useMemo(() => {
    const set = new Set<string>();
    progress?.forEach((p) => {
      if (p.status === "completed") set.add(p.lesson_id);
    });
    return set;
  }, [progress]);

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const isCompleted = completedIds.has(lessonId);
  const completedCount = allLessons.filter((l) => completedIds.has(l.id)).length;

  const isNextUnlocked = nextLesson
    ? isLessonUnlocked(nextLesson, allLessons, completedIds) || isCompleted
    : false;

  // Auto-complete at 80% video watch
  const handleTimeUpdate = useCallback(() => {
    if (autoCompleted || isCompleted) return;
    const video = videoRef.current;
    if (!video || !video.duration) return;
    const percent = (video.currentTime / video.duration) * 100;
    if (percent >= 80) {
      setAutoCompleted(true);
      markComplete.mutate(lessonId, {
        onSuccess: () => toast.success("Lecon completee automatiquement !"),
      });
    }
  }, [autoCompleted, isCompleted, lessonId, markComplete]);

  const handleMarkComplete = () => {
    markComplete.mutate(lessonId, {
      onSuccess: () => {
        toast.success("Lecon terminee !");
        if (nextLesson) {
          router.push(`${prefix}/school/${courseId}/${nextLesson.id}`);
        }
      },
      onError: () => toast.error("Erreur lors de la mise a jour"),
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-5 w-28 bg-muted rounded-lg animate-shimmer" />
        <div className="bg-surface rounded-2xl p-8" style={{ boxShadow: "var(--shadow-card)" }}>
          <div className="h-7 w-64 bg-muted rounded-lg animate-shimmer mb-6" />
          <div className="aspect-video bg-muted rounded-xl animate-shimmer" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return <p className="text-center text-muted-foreground py-16">Lecon non trouvee</p>;
  }

  const content = lesson.content as Record<string, string>;
  const videoUrl = lesson.video_url ?? content?.video_url ?? content?.url;
  const youtubeId = videoUrl ? getYouTubeId(videoUrl) : null;
  const vimeoId = videoUrl && !youtubeId ? getVimeoId(videoUrl) : null;
  const loomId = videoUrl && !youtubeId && !vimeoId ? getLoomId(videoUrl) : null;
  const isDirectVideo = videoUrl && !youtubeId && !vimeoId && !loomId;

  const htmlContent = lesson.content_html ?? content?.html;
  const attachments = (lesson.attachments ?? []) as LessonAttachment[];

  // Check if this lesson is locked
  const isLocked = !isLessonUnlocked(lesson, allLessons, completedIds);

  if (isLocked) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          href={`${prefix}/school/${courseId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au cours
        </Link>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Lock className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <h2 className="text-lg font-display font-semibold text-foreground mb-1">
            Lecon verrouillee
          </h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Vous devez terminer la lecon precedente avant d&apos;acceder a celle-ci.
          </p>
          {prevLesson && (
            <Link
              href={`${prefix}/school/${courseId}/${prevLesson.id}`}
              className="mt-4 h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all inline-flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Lecon precedente
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href={`${prefix}/school/${courseId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au cours
        </Link>
        {allLessons.length > 0 && (
          <span className="text-xs text-muted-foreground font-mono">
            {completedCount}/{allLessons.length} terminees
          </span>
        )}
      </div>

      <div className="bg-surface rounded-2xl p-8" style={{ boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
              {lesson.title}
            </h1>
            {lesson.description && (
              <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>
            )}
          </div>
          {isCompleted && (
            <span className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 px-2.5 py-1 rounded-full">
              <CheckCircle className="w-3.5 h-3.5" />
              Terminee
            </span>
          )}
        </div>

        {/* YouTube */}
        {youtubeId && (
          <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-6" style={{ boxShadow: "var(--shadow-elevated)" }}>
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        )}

        {/* Vimeo */}
        {vimeoId && (
          <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-6" style={{ boxShadow: "var(--shadow-elevated)" }}>
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}`}
              title={lesson.title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        )}

        {/* Loom */}
        {loomId && (
          <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-6" style={{ boxShadow: "var(--shadow-elevated)" }}>
            <iframe
              src={`https://www.loom.com/embed/${loomId}`}
              title={lesson.title}
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        )}

        {/* Direct video with auto-complete */}
        {isDirectVideo && (
          <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-6" style={{ boxShadow: "var(--shadow-elevated)" }}>
            <video ref={videoRef} src={videoUrl} controls className="w-full h-full" onTimeUpdate={handleTimeUpdate} />
          </div>
        )}

        {/* HTML content */}
        {lesson.content_type === "text" && htmlContent && (
          <div
            className="prose prose-stone dark:prose-invert max-w-none prose-headings:font-display prose-headings:tracking-tight"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}

        {/* Quiz */}
        {lesson.content_type === "quiz" && (lesson.content as unknown as QuizConfig)?.questions && (
          <QuizPlayer
            lessonId={lesson.id}
            config={lesson.content as unknown as QuizConfig}
            onComplete={(passed) => {
              if (passed) {
                markComplete.mutate(lesson.id);
                toast.success("Quiz reussi ! Lecon marquee comme completee.");
              }
            }}
          />
        )}

        {/* Assignment */}
        {lesson.content_type === "assignment" && (
          <AssignmentSubmission
            lessonId={lesson.id}
            instructions={content?.instructions}
            onComplete={() => {
              markComplete.mutate(lesson.id);
              toast.success("Exercice soumis ! Lecon marquee comme completee.");
            }}
          />
        )}

        {/* Coach/Admin: Quiz & Exercise Stats */}
        {isStaff && (lesson.content_type === "quiz" || lesson.content_type === "assignment") && (
          <div className="mt-6 pt-6 border-t border-border">
            <QuizExerciseStats lessonId={lesson.id} contentType={lesson.content_type} />
          </div>
        )}

        {/* Coach/Admin: Exercise Review */}
        {isStaff && lesson.content_type === "assignment" && (
          <div className="mt-6 pt-6 border-t border-border">
            <ExerciseReview lessonId={lesson.id} lessonTitle={lesson.title} />
          </div>
        )}

        {/* Attachments */}
        {attachments.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-semibold text-foreground mb-3">Ressources</h3>
            <div className="space-y-2">
              {attachments.map((att) => {
                const Icon = getAttachmentIcon(att.type);
                return (
                  <a
                    key={att.url}
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl hover:bg-muted/50 transition-colors group"
                  >
                    <Icon className="w-5 h-5 text-muted-foreground shrink-0" />
                    <span className="text-sm text-foreground flex-1 truncate">{att.name}</span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {prevLesson ? (
          <Link
            href={`${prefix}/school/${courseId}/${prevLesson.id}`}
            className="h-10 px-4 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2"
            style={{ boxShadow: "var(--shadow-xs)" }}
          >
            <ChevronLeft className="w-4 h-4" />
            Precedent
          </Link>
        ) : (
          <div />
        )}

        <button
          onClick={handleMarkComplete}
          disabled={isCompleted || markComplete.isPending}
          className="h-10 px-4 rounded-xl bg-success text-white text-sm font-medium hover:bg-success/90 transition-all active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {markComplete.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          {isCompleted ? "Deja terminee" : "Marquer comme termine"}
        </button>

        {nextLesson ? (
          isNextUnlocked ? (
            <Link
              href={`${prefix}/school/${courseId}/${nextLesson.id}`}
              className="h-10 px-4 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2"
              style={{ boxShadow: "var(--shadow-xs)" }}
            >
              Suivant
              <ChevronRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="h-10 px-4 rounded-xl text-sm text-muted-foreground/50 flex items-center gap-2 cursor-not-allowed">
              <Lock className="w-3.5 h-3.5" />
              Suivant
            </span>
          )
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
