"use client";

import { useCourseProgress, useCourseQuizAverage, useCertificates, useIssueCertificate } from "@/hooks/use-certificates";
import { useAuth } from "@/hooks/use-auth";
import { Award, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Course, Module, Lesson } from "@/types/database";

interface CourseCompletionProps {
  course: Course & { modules: (Module & { lessons: Lesson[] })[] };
}

export function CourseCompletion({ course }: CourseCompletionProps) {
  const { user, profile } = useAuth();
  const { data: progress } = useCourseProgress(course.id);
  const { data: quizAvg } = useCourseQuizAverage(course.id);
  const { data: certificates } = useCertificates();
  const issueCertificate = useIssueCertificate();

  const hasCertificate = certificates?.some((c) => c.course_id === course.id);
  const totalModules = course.modules?.length ?? 0;
  const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0) ?? 0;

  if (!progress || !progress.isComplete) return null;

  const handleIssueCertificate = async () => {
    if (!user || !profile) return;
    try {
      await issueCertificate.mutateAsync({
        studentId: user.id,
        courseId: course.id,
        courseTitle: course.title,
        studentName: profile.full_name ?? "Etudiant",
        totalLessons,
        totalModules,
        quizAverage: quizAvg ?? null,
      });
      toast.success("Certificat obtenu !");
    } catch {
      toast.error("Erreur lors de la generation du certificat");
    }
  };

  return (
    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
          <Check className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Formation terminee !</p>
          <p className="text-xs text-muted-foreground">
            {progress.completedLessons}/{progress.totalLessons} lecons completees
            {quizAvg != null && ` · Moyenne quiz : ${quizAvg}%`}
          </p>
        </div>
      </div>

      {hasCertificate ? (
        <div className="flex items-center gap-2 text-xs text-emerald-600">
          <Award className="w-4 h-4" />
          Certificat deja obtenu
        </div>
      ) : (
        <button
          onClick={handleIssueCertificate}
          disabled={issueCertificate.isPending}
          className="h-9 px-4 bg-emerald-600 text-white rounded-xl text-xs font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 flex items-center gap-1.5"
        >
          {issueCertificate.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Award className="w-3.5 h-3.5" />
          )}
          Obtenir mon certificat
        </button>
      )}
    </div>
  );
}
