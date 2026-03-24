"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { PageTransition } from "@/components/ui/page-transition";
import {
  GraduationCap,
  BookOpen,
  CheckCircle,
  TrendingDown,
  BarChart3,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ── Types ────────────────────────────────────────────────────

interface LessonRow {
  id: string;
  title: string;
  sort_order: number;
  module_id: string;
  modules: {
    id: string;
    title: string;
    course_id: string;
    courses: {
      id: string;
      title: string;
    };
  };
}

interface ProgressRow {
  id: string;
  lesson_id: string;
  student_id: string;
  status: string;
  completed_at: string | null;
}

// ── Data hook ────────────────────────────────────────────────

function useFormationAnalytics() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["admin-formation-analytics"],
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const [lessonsRes, progressRes, coursesRes] = await Promise.all([
        supabase
          .from("lessons")
          .select("id, title, sort_order, module_id, modules!inner(id, title, course_id, courses!inner(id, title))")
          .returns<LessonRow[]>(),
        supabase
          .from("lesson_progress")
          .select("id, lesson_id, student_id, status, completed_at")
          .returns<ProgressRow[]>(),
        supabase
          .from("courses")
          .select("id, title")
          .eq("status", "published"),
      ]);

      if (lessonsRes.error) throw lessonsRes.error;
      if (progressRes.error) throw progressRes.error;
      if (coursesRes.error) throw coursesRes.error;

      return {
        lessons: lessonsRes.data ?? [],
        progress: progressRes.data ?? [],
        courses: coursesRes.data ?? [],
      };
    },
  });
}

// ── KPI Card ─────────────────────────────────────────────────

function KpiCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="bg-surface border border-border rounded-xl p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#AF0000]/10">
          <Icon className="h-5 w-5 text-[#AF0000]" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold font-heading text-foreground">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────

export default function FormationAnalyticsPage() {
  const { data, isLoading } = useFormationAnalytics();

  // ── Derived analytics ──────────────────────────────────────

  const analytics = useMemo(() => {
    if (!data) return null;

    const { lessons, progress, courses } = data;

    // Index: lesson_id -> lesson
    const lessonMap = new Map<string, LessonRow>();
    for (const l of lessons) lessonMap.set(l.id, l);

    // Completed progress only
    const completed = progress.filter((p) => p.status === "completed");

    // All unique students
    const allStudents = new Set(progress.map((p) => p.student_id));

    // 1. Total KPIs
    const totalCourses = courses.length;
    const totalLessons = lessons.length;
    const totalCompletions = completed.length;
    const globalCompletionRate =
      totalLessons > 0 && allStudents.size > 0
        ? Math.min(
            Math.round(
              (totalCompletions / (totalLessons * allStudents.size)) * 100,
            ),
            100,
          )
        : 0;

    // 2. Top 10 most completed lessons
    const completionsByLesson = new Map<string, number>();
    for (const p of completed) {
      completionsByLesson.set(
        p.lesson_id,
        (completionsByLesson.get(p.lesson_id) ?? 0) + 1,
      );
    }
    const topLessons = [...completionsByLesson.entries()]
      .map(([lessonId, count]) => {
        const lesson = lessonMap.get(lessonId);
        return {
          name: lesson
            ? lesson.title.length > 30
              ? lesson.title.slice(0, 27) + "..."
              : lesson.title
            : lessonId.slice(0, 8),
          fullName: lesson?.title ?? lessonId,
          completions: count,
        };
      })
      .sort((a, b) => b.completions - a.completions)
      .slice(0, 10);

    // 3. Completion rate per course
    // Group lessons by course
    const courseMap = new Map<
      string,
      { title: string; lessonIds: string[] }
    >();
    for (const l of lessons) {
      const courseId = l.modules?.courses?.id;
      const courseTitle = l.modules?.courses?.title;
      if (!courseId || !courseTitle) continue;
      if (!courseMap.has(courseId)) {
        courseMap.set(courseId, { title: courseTitle, lessonIds: [] });
      }
      courseMap.get(courseId)!.lessonIds.push(l.id);
    }

    const courseCompletionRates = [...courseMap.entries()]
      .map(([courseId, { title, lessonIds }]) => {
        const totalPossible = lessonIds.length * allStudents.size;
        const courseCompletions = completed.filter((p) =>
          lessonIds.includes(p.lesson_id),
        ).length;
        const rate =
          totalPossible > 0
            ? Math.round((courseCompletions / totalPossible) * 100)
            : 0;
        return {
          id: courseId,
          title,
          totalLessons: lessonIds.length,
          completions: courseCompletions,
          rate,
        };
      })
      .sort((a, b) => b.rate - a.rate);

    // 4. Drop-off points: last completed lesson per student
    // Group completions by student, find the last one by completed_at
    const studentLastLesson = new Map<string, { lessonId: string; completedAt: string }>();
    for (const p of completed) {
      if (!p.completed_at) continue;
      const current = studentLastLesson.get(p.student_id);
      if (!current || p.completed_at > current.completedAt) {
        studentLastLesson.set(p.student_id, {
          lessonId: p.lesson_id,
          completedAt: p.completed_at,
        });
      }
    }

    // Count how many students stopped at each lesson
    const dropOffCounts = new Map<string, number>();
    for (const [, { lessonId }] of studentLastLesson) {
      dropOffCounts.set(lessonId, (dropOffCounts.get(lessonId) ?? 0) + 1);
    }

    const dropOffPoints = [...dropOffCounts.entries()]
      .map(([lessonId, count]) => {
        const lesson = lessonMap.get(lessonId);
        const moduleName = lesson?.modules?.title ?? "";
        const courseName = lesson?.modules?.courses?.title ?? "";
        return {
          lessonId,
          lessonTitle: lesson?.title ?? lessonId,
          moduleName,
          courseName,
          studentCount: count,
        };
      })
      .sort((a, b) => b.studentCount - a.studentCount)
      .slice(0, 15);

    return {
      totalCourses,
      totalLessons,
      totalCompletions,
      globalCompletionRate,
      topLessons,
      courseCompletionRates,
      dropOffPoints,
    };
  }, [data]);

  // ── Render ─────────────────────────────────────────────────

  if (isLoading || !analytics) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <div className="h-8 w-64 bg-muted rounded animate-shimmer" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 bg-surface border border-border rounded-xl animate-shimmer"
              />
            ))}
          </div>
          <div className="h-80 bg-surface border border-border rounded-xl animate-shimmer" />
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={staggerItem}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#AF0000]/10">
              <GraduationCap className="h-5 w-5 text-[#AF0000]" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground tracking-tight">
                Analytiques Formation
              </h1>
              <p className="text-sm text-muted-foreground/80">
                Suivi de la progression et engagement des apprenants
              </p>
            </div>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div
          variants={staggerItem}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <KpiCard
            label="Total cours"
            value={analytics.totalCourses}
            icon={BookOpen}
          />
          <KpiCard
            label="Total lecons"
            value={analytics.totalLessons}
            icon={BarChart3}
          />
          <KpiCard
            label="Taux completion global"
            value={`${analytics.globalCompletionRate}%`}
            icon={CheckCircle}
          />
          <KpiCard
            label="Lecons completees"
            value={analytics.totalCompletions}
            icon={GraduationCap}
          />
        </motion.div>

        {/* Bar Chart: Top 10 lecons les plus completees */}
        <motion.div
          variants={staggerItem}
          className="bg-surface border border-border rounded-xl p-5"
        >
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#AF0000]" />
            Top 10 lecons les plus completees
          </h2>
          {analytics.topLessons.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune donnee de completion disponible
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={analytics.topLessons}
                layout="vertical"
                margin={{ left: 10, right: 20, top: 5, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis type="number" allowDecimals={false} fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={180}
                  fontSize={11}
                  tick={{ fill: "var(--color-muted-foreground)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [
                    `${value} completions`,
                    "Completions",
                  ]}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  labelFormatter={(label: any) => {
                    const item = analytics.topLessons.find(
                      (l) => l.name === String(label),
                    );
                    return item?.fullName ?? String(label);
                  }}
                />
                <Bar
                  dataKey="completions"
                  fill="#AF0000"
                  radius={[0, 4, 4, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Table: Taux de completion par cours */}
        <motion.div
          variants={staggerItem}
          className="bg-surface border border-border rounded-xl p-5"
        >
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-[#AF0000]" />
            Taux de completion par cours
          </h2>
          {analytics.courseCompletionRates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucun cours disponible
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 pr-4 text-xs font-medium text-muted-foreground">
                      Cours
                    </th>
                    <th className="pb-3 pr-4 text-xs font-medium text-muted-foreground text-right">
                      Lecons
                    </th>
                    <th className="pb-3 pr-4 text-xs font-medium text-muted-foreground text-right">
                      Completions
                    </th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground text-right">
                      Taux
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.courseCompletionRates.map((course) => (
                    <tr
                      key={course.id}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-3 pr-4 font-medium text-foreground">
                        {course.title}
                      </td>
                      <td className="py-3 pr-4 text-right text-muted-foreground tabular-nums">
                        {course.totalLessons}
                      </td>
                      <td className="py-3 pr-4 text-right text-muted-foreground tabular-nums">
                        {course.completions}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all",
                                course.rate >= 75
                                  ? "bg-emerald-500"
                                  : course.rate >= 40
                                    ? "bg-amber-500"
                                    : "bg-[#AF0000]",
                              )}
                              style={{ width: `${course.rate}%` }}
                            />
                          </div>
                          <span className="font-mono text-xs font-semibold text-foreground w-10 text-right">
                            {course.rate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Table: Points de decrochage */}
        <motion.div
          variants={staggerItem}
          className="bg-surface border border-border rounded-xl p-5"
        >
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-[#AF0000]" />
            Points de decrochage
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Derniere lecon completee par les apprenants — identifie ou les
            etudiants s&apos;arretent.
          </p>
          {analytics.dropOffPoints.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune donnee de decrochage disponible
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="pb-3 pr-4 text-xs font-medium text-muted-foreground">
                      Lecon
                    </th>
                    <th className="pb-3 pr-4 text-xs font-medium text-muted-foreground">
                      Module
                    </th>
                    <th className="pb-3 pr-4 text-xs font-medium text-muted-foreground">
                      Cours
                    </th>
                    <th className="pb-3 text-xs font-medium text-muted-foreground text-right">
                      Etudiants arretes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.dropOffPoints.map((point) => (
                    <tr
                      key={point.lessonId}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-3 pr-4 font-medium text-foreground">
                        {point.lessonTitle}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {point.moduleName}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {point.courseName}
                      </td>
                      <td className="py-3 text-right">
                        <span
                          className={cn(
                            "inline-flex items-center justify-center min-w-[2rem] px-2 py-0.5 rounded-full text-xs font-semibold",
                            point.studentCount >= 5
                              ? "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400"
                              : point.studentCount >= 3
                                ? "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
                          )}
                        >
                          {point.studentCount}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>
    </PageTransition>
  );
}
