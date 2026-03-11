"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";

export function useAnalytics() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["analytics"],
    enabled: !!user,
    queryFn: async () => {
      const [
        clientsRes,
        invoicesRes,
        coursesRes,
        checkinsRes,
        lessonsRes,
        progressRes,
      ] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, created_at, role")
          .eq("role", "client"),
        supabase.from("invoices").select("total, status, created_at"),
        supabase.from("courses").select("id, title, status"),
        supabase
          .from("weekly_checkins")
          .select("id, week_start, mood, revenue"),
        supabase.from("lessons").select("id, course_id"),
        supabase.from("lesson_progress").select("id, lesson_id, completed"),
      ]);

      const clients = clientsRes.data ?? [];
      const invoices = invoicesRes.data ?? [];
      const courses = coursesRes.data ?? [];
      const checkins = checkinsRes.data ?? [];
      const lessons = lessonsRes.data ?? [];
      const progress = progressRes.data ?? [];

      // Revenue total
      const totalRevenue = invoices
        .filter((inv) => inv.status === "paid")
        .reduce((sum, inv) => sum + Number(inv.total ?? 0), 0);

      // Revenue by month (last 12 months)
      const months = [
        "Jan",
        "Fev",
        "Mar",
        "Avr",
        "Mai",
        "Juin",
        "Juil",
        "Aout",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const now = new Date();
      const revenueByMonth = [];
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
        const monthRevenue = invoices
          .filter((inv) => {
            if (inv.status !== "paid") return false;
            const invDate = new Date(inv.created_at);
            return invDate >= d && invDate <= monthEnd;
          })
          .reduce((sum, inv) => sum + Number(inv.total ?? 0), 0);
        revenueByMonth.push({
          month: months[d.getMonth()],
          value: monthRevenue,
        });
      }

      // Completion by course
      const completionByCourse = courses
        .filter((c) => c.status === "published")
        .slice(0, 5)
        .map((course) => {
          const courseLessons = lessons.filter(
            (l) => l.course_id === course.id,
          );
          const lessonIds = courseLessons.map((l) => l.id);
          const totalProgress = progress.filter((p) =>
            lessonIds.includes(p.lesson_id),
          );
          const completedProgress = totalProgress.filter((p) => p.completed);
          const rate =
            totalProgress.length > 0
              ? Math.round(
                  (completedProgress.length / totalProgress.length) * 100,
                )
              : 0;
          return { name: course.title.slice(0, 20), completion: rate };
        });

      // Client tag distribution (from student_details)
      const totalClients = clients.length;

      // Average mood from checkins
      const avgMood =
        checkins.length > 0
          ? (
              checkins.reduce((sum, c) => sum + (c.mood ?? 0), 0) /
              checkins.length
            ).toFixed(1)
          : "—";

      // Average completion
      const totalCompleted = progress.filter((p) => p.completed).length;
      const completionRate =
        progress.length > 0
          ? Math.round((totalCompleted / progress.length) * 100)
          : 0;

      return {
        totalRevenue,
        totalClients,
        completionRate,
        avgMood,
        revenueByMonth,
        completionByCourse,
      };
    },
  });
}
