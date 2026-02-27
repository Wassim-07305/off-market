"use client";

import { use, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { useCourse, useLessonProgress, useMarkLessonComplete } from "@/hooks/use-courses";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Loader2,
} from "lucide-react";

export default function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = use(params);
  const supabase = useSupabase();
  const prefix = useRoutePrefix();
  const router = useRouter();

  const { data: lesson, isLoading } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  // Load course to get all lessons for prev/next navigation
  const { data: course } = useCourse(courseId);
  const { data: progress } = useLessonProgress();
  const markComplete = useMarkLessonComplete();

  // Build flat sorted list of all lessons in this course
  const allLessons = useMemo(() => {
    if (!course?.modules) return [];
    return course.modules
      .sort((a, b) => a.sort_order - b.sort_order)
      .flatMap((mod) =>
        (mod.lessons ?? []).sort((a, b) => a.sort_order - b.sort_order)
      );
  }, [course]);

  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  const isCompleted = progress?.some(
    (p) => p.lesson_id === lessonId && p.status === "completed"
  );

  const completedCount =
    progress?.filter(
      (p) =>
        p.status === "completed" &&
        allLessons.some((l) => l.id === p.lesson_id)
    ).length ?? 0;

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
        <div
          className="bg-surface rounded-2xl p-8"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="h-7 w-64 bg-muted rounded-lg animate-shimmer mb-6" />
          <div className="aspect-video bg-muted rounded-xl animate-shimmer" />
        </div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <p className="text-center text-muted-foreground py-16">
        Lecon non trouvee
      </p>
    );
  }

  const content = lesson.content as Record<string, string>;

  // Extract YouTube video ID from URL
  const getYouTubeId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      /^([a-zA-Z0-9_-]{11})$/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const videoUrl =
    content?.url ||
    content?.video_url ||
    ((lesson as Record<string, unknown>).video_url as string | undefined);
  const youtubeId = videoUrl ? getYouTubeId(videoUrl) : null;

  // Lesson content is admin/coach-authored (trusted source)
  const htmlContent = content?.html;

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

      <div
        className="bg-surface rounded-2xl p-8"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-start justify-between gap-4 mb-6">
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            {lesson.title}
          </h1>
          {isCompleted && (
            <span className="shrink-0 flex items-center gap-1.5 text-xs font-medium text-success bg-success/10 px-2.5 py-1 rounded-full">
              <CheckCircle className="w-3.5 h-3.5" />
              Terminee
            </span>
          )}
        </div>

        {/* YouTube embed */}
        {youtubeId && (
          <div
            className="aspect-video bg-black rounded-2xl overflow-hidden mb-6"
            style={{ boxShadow: "var(--shadow-elevated)" }}
          >
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title={lesson.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        )}

        {/* Regular video (non-YouTube) */}
        {lesson.content_type === "video" && videoUrl && !youtubeId && (
          <div
            className="aspect-video bg-black rounded-2xl overflow-hidden mb-6"
            style={{ boxShadow: "var(--shadow-elevated)" }}
          >
            <video src={videoUrl} controls className="w-full h-full" />
          </div>
        )}

        {lesson.content_type === "text" && htmlContent && (
          <div
            className="prose prose-stone dark:prose-invert max-w-none prose-headings:font-display prose-headings:tracking-tight"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}

        {lesson.content_type === "quiz" && (
          <p className="text-muted-foreground text-sm">Quiz a venir...</p>
        )}

        {lesson.content_type === "assignment" && (
          <div>
            <p className="text-sm text-foreground mb-4">
              {content?.instructions ?? "Instructions de l'exercice"}
            </p>
            <textarea
              placeholder="Ta reponse..."
              className="w-full h-32 p-4 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-shadow"
            />
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
          <Link
            href={`${prefix}/school/${courseId}/${nextLesson.id}`}
            className="h-10 px-4 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2"
            style={{ boxShadow: "var(--shadow-xs)" }}
          >
            Suivant
            <ChevronRight className="w-4 h-4" />
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
