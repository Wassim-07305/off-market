"use client";

import { use } from "react";
import Link from "next/link";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

export default function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = use(params);
  const supabase = useSupabase();
  const prefix = useRoutePrefix();

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

  const videoUrl = content?.url || content?.video_url || (lesson as Record<string, unknown>).video_url as string | undefined;
  const youtubeId = videoUrl ? getYouTubeId(videoUrl) : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href={`${prefix}/school/${courseId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au cours
      </Link>

      <div className="bg-surface rounded-2xl p-8" style={{ boxShadow: "var(--shadow-card)" }}>
        <h1 className="text-2xl font-display font-bold text-foreground tracking-tight mb-6">
          {lesson.title}
        </h1>

        {/* YouTube embed */}
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

        {/* Regular video (non-YouTube) */}
        {lesson.content_type === "video" && videoUrl && !youtubeId && (
          <div className="aspect-video bg-black rounded-2xl overflow-hidden mb-6" style={{ boxShadow: "var(--shadow-elevated)" }}>
            <video
              src={videoUrl}
              controls
              className="w-full h-full"
            />
          </div>
        )}

        {lesson.content_type === "text" && content.html && (
          <div
            className="prose prose-stone dark:prose-invert max-w-none prose-headings:font-display prose-headings:tracking-tight"
            dangerouslySetInnerHTML={{ __html: content.html }}
          />
        )}

        {lesson.content_type === "quiz" && (
          <p className="text-muted-foreground text-sm">Quiz a venir...</p>
        )}

        {lesson.content_type === "assignment" && (
          <div>
            <p className="text-sm text-foreground mb-4">{content.instructions ?? "Instructions de l'exercice"}</p>
            <textarea
              placeholder="Ta reponse..."
              className="w-full h-32 p-4 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-shadow"
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button className="h-10 px-4 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2" style={{ boxShadow: "var(--shadow-xs)" }}>
          <ChevronLeft className="w-4 h-4" />
          Precedent
        </button>
        <button className="h-10 px-4 rounded-xl bg-success text-white text-sm font-medium hover:bg-success/90 transition-all active:scale-[0.98] flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Marquer comme termine
        </button>
        <button className="h-10 px-4 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2" style={{ boxShadow: "var(--shadow-xs)" }}>
          Suivant
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
