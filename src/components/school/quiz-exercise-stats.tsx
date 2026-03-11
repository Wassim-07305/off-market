"use client";

import { useQuizStats, useExerciseSubmissions } from "@/hooks/use-quizzes";
import {
  Trophy,
  Users,
  Target,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
} from "lucide-react";

interface QuizExerciseStatsProps {
  lessonId: string;
  contentType: string;
}

export function QuizExerciseStats({
  lessonId,
  contentType,
}: QuizExerciseStatsProps) {
  if (contentType === "quiz") return <QuizStats lessonId={lessonId} />;
  if (contentType === "assignment")
    return <ExerciseStats lessonId={lessonId} />;
  return null;
}

function QuizStats({ lessonId }: { lessonId: string }) {
  const { data: stats, isLoading } = useQuizStats(lessonId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-muted animate-shimmer rounded-xl" />
        ))}
      </div>
    );
  }

  if (!stats || stats.totalAttempts === 0) {
    return (
      <div className="text-center py-6">
        <Trophy className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Aucune tentative pour le moment
        </p>
      </div>
    );
  }

  const cards = [
    {
      label: "Tentatives",
      value: stats.totalAttempts,
      icon: Target,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Etudiants",
      value: stats.uniqueStudents,
      icon: Users,
      color: "text-blue-600 bg-blue-500/10",
    },
    {
      label: "Taux de reussite",
      value: `${Math.round(stats.passRate)}%`,
      icon: TrendingUp,
      color:
        stats.passRate >= 70
          ? "text-emerald-600 bg-emerald-500/10"
          : "text-amber-600 bg-amber-500/10",
    },
    {
      label: "Score moyen",
      value: `${stats.averageScore}%`,
      icon: Trophy,
      color:
        stats.averageScore >= 70
          ? "text-emerald-600 bg-emerald-500/10"
          : "text-amber-600 bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Statistiques du quiz
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-surface border border-border rounded-xl p-3"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${card.color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-lg font-bold text-foreground">{card.value}</p>
              <p className="text-[10px] text-muted-foreground">{card.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExerciseStats({ lessonId }: { lessonId: string }) {
  const { data: submissions, isLoading } = useExerciseSubmissions(lessonId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 bg-muted animate-shimmer rounded-xl" />
        ))}
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-6">
        <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Aucune soumission pour le moment
        </p>
      </div>
    );
  }

  const submitted = submissions.filter((s) => s.status === "submitted").length;
  const reviewed = submissions.filter((s) => s.status === "reviewed").length;
  const revisionRequested = submissions.filter(
    (s) => s.status === "revision_requested",
  ).length;
  const avgGrade =
    submissions.filter((s) => s.grade !== null).length > 0
      ? Math.round(
          submissions
            .filter((s) => s.grade !== null)
            .reduce((sum, s) => sum + (s.grade ?? 0), 0) /
            submissions.filter((s) => s.grade !== null).length,
        )
      : null;

  const cards = [
    {
      label: "Total soumissions",
      value: submissions.length,
      icon: FileText,
      color: "text-primary bg-primary/10",
    },
    {
      label: "En attente",
      value: submitted,
      icon: Clock,
      color: "text-amber-600 bg-amber-500/10",
    },
    {
      label: "Corrigees",
      value: reviewed,
      icon: CheckCircle,
      color: "text-emerald-600 bg-emerald-500/10",
    },
    {
      label: avgGrade !== null ? "Note moyenne" : "Revisions",
      value: avgGrade !== null ? `${avgGrade}/100` : revisionRequested,
      icon: avgGrade !== null ? TrendingUp : AlertCircle,
      color:
        avgGrade !== null
          ? avgGrade >= 50
            ? "text-emerald-600 bg-emerald-500/10"
            : "text-red-600 bg-red-500/10"
          : "text-red-600 bg-red-500/10",
    },
  ];

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Statistiques des exercices
      </h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-surface border border-border rounded-xl p-3"
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${card.color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>
              <p className="text-lg font-bold text-foreground">{card.value}</p>
              <p className="text-[10px] text-muted-foreground">{card.label}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
