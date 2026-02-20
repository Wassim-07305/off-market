"use client";

import { use } from "react";
import Link from "next/link";
import { useCourse } from "@/hooks/use-courses";
import { ArrowLeft } from "lucide-react";

export default function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = use(params);
  const { data: course, isLoading } = useCourse(courseId);

  if (isLoading) {
    return <div className="h-64 bg-muted rounded-xl animate-pulse" />;
  }

  if (!course) {
    return <p className="text-center text-muted-foreground py-16">Cours non trouve</p>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href={`/school/${courseId}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au cours
      </Link>

      <div className="bg-surface border border-border rounded-xl p-6">
        <h1
          className="text-2xl font-semibold text-foreground"
          style={{ fontFamily: "Instrument Serif, serif" }}
        >
          Modifier : {course.title}
        </h1>
        <p className="text-sm text-muted-foreground mt-2">
          L&apos;editeur de cours complet sera disponible prochainement.
          Utilisez le builder pour creer de nouveaux cours.
        </p>
      </div>
    </div>
  );
}
