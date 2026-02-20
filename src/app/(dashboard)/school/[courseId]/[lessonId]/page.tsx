"use client";

import { use } from "react";
import Link from "next/link";
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
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-20 bg-muted rounded" />
        <div className="h-96 bg-muted rounded-xl" />
      </div>
    );
  }

  if (!lesson) {
    return <p className="text-center text-muted-foreground py-16">Lecon non trouvee</p>;
  }

  const content = lesson.content as Record<string, string>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href={`/school/${courseId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au cours
      </Link>

      <div className="bg-surface border border-border rounded-xl p-8">
        <h1 className="text-2xl font-semibold text-foreground mb-6">
          {lesson.title}
        </h1>

        {lesson.content_type === "video" && content.url && (
          <div className="aspect-video bg-black rounded-xl overflow-hidden mb-6">
            <video
              src={content.url}
              controls
              className="w-full h-full"
            />
          </div>
        )}

        {lesson.content_type === "text" && content.html && (
          <div
            className="prose prose-zinc max-w-none"
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
              className="w-full h-32 p-4 bg-muted border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button className="h-10 px-4 rounded-[10px] border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2">
          <ChevronLeft className="w-4 h-4" />
          Precedent
        </button>
        <button className="h-10 px-4 rounded-[10px] bg-success text-white text-sm font-medium hover:bg-success/90 transition-all flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Marquer comme termine
        </button>
        <button className="h-10 px-4 rounded-[10px] border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-2">
          Suivant
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
