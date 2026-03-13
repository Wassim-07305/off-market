"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "./use-supabase";
import { useAuth } from "./use-auth";

export interface ClientDashboardData {
  // Formation
  totalLessons: number;
  completedLessons: number;
  formationProgress: number;
  enrolledCourses: number;

  // Coaching
  upcomingSessions: number;
  nextSession: { title: string; scheduled_at: string } | null;
  activeGoals: number;
  completedGoals: number;

  // Gamification
  totalXp: number;
  leaderboardRank: number;
  badgeCount: number;
  currentStreak: number;

  // Engagement
  recentCheckins: number;
  unreadNotifications: number;

  // Community
  recentWins: { full_name: string; action: string; created_at: string }[];
}

export function useClientDashboard() {
  const supabase = useSupabase();
  const { user } = useAuth();

  return useQuery({
    queryKey: ["client-dashboard", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<ClientDashboardData> => {
      const now = new Date();
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);

      const [
        completionsRes,
        enrollmentsRes,
        sessionsRes,
        goalsRes,
        xpRes,
        rankRes,
        badgesRes,
        streakRes,
        checkinsRes,
        notificationsRes,
        winsRes,
      ] = await Promise.all([
        // Lesson completions for this user
        supabase
          .from("lesson_completions")
          .select("id", { count: "exact", head: true })
          .eq("profile_id", user!.id),
        // Enrolled courses (all published)
        supabase
          .from("courses")
          .select("id, modules(id, lessons(id))")
          .eq("status", "published"),
        // Upcoming sessions
        supabase
          .from("sessions")
          .select("id, title, scheduled_at")
          .eq("client_id", user!.id)
          .eq("status", "scheduled")
          .gte("scheduled_at", now.toISOString())
          .order("scheduled_at", { ascending: true })
          .limit(5),
        // Coaching goals
        supabase
          .from("coaching_goals")
          .select("id, status")
          .eq("client_id", user!.id),
        // XP total
        supabase
          .from("xp_transactions")
          .select("xp_amount")
          .eq("profile_id", user!.id),
        // Leaderboard rank
        supabase
          .from("leaderboard")
          .select("rank")
          .eq("profile_id", user!.id)
          .single(),
        // Badge count
        supabase
          .from("user_badges")
          .select("id", { count: "exact", head: true })
          .eq("profile_id", user!.id),
        // Streak
        supabase
          .from("streaks")
          .select("current_streak")
          .eq("profile_id", user!.id)
          .single(),
        // Recent check-ins (last 4 weeks)
        supabase
          .from("weekly_checkins")
          .select("id", { count: "exact", head: true })
          .eq("client_id", user!.id)
          .gte("created_at", weekAgo.toISOString()),
        // Unread notifications
        supabase
          .from("notifications")
          .select("id", { count: "exact", head: true })
          .eq("recipient_id", user!.id)
          .eq("is_read", false),
        // Community wins (recent milestones)
        supabase
          .from("student_activities")
          .select(
            "activity_type, created_at, student:profiles!student_activities_student_id_fkey(full_name)",
          )
          .in("activity_type", [
            "milestone_reached",
            "module_completed",
            "payment_received",
          ])
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      // Formation progress
      const courses = (enrollmentsRes.data ?? []) as {
        id: string;
        modules: { id: string; lessons: { id: string }[] }[];
      }[];
      const totalLessons = courses.reduce(
        (sum, c) =>
          sum + c.modules.reduce((ms, m) => ms + (m.lessons?.length ?? 0), 0),
        0,
      );
      const completedLessons = completionsRes.count ?? 0;
      const formationProgress =
        totalLessons > 0
          ? Math.min(Math.round((completedLessons / totalLessons) * 100), 100)
          : 0;

      // Sessions
      const sessions = sessionsRes.data ?? [];
      const nextSession =
        sessions.length > 0
          ? {
              title: sessions[0].title,
              scheduled_at: sessions[0].scheduled_at,
            }
          : null;

      // Goals
      const goals = goalsRes.data ?? [];
      const activeGoals = goals.filter(
        (g) => g.status === "in_progress" || g.status === "not_started",
      ).length;
      const completedGoals = goals.filter(
        (g) => g.status === "completed",
      ).length;

      // XP
      const totalXp = (xpRes.data ?? []).reduce(
        (sum, t) => sum + (t.xp_amount ?? 0),
        0,
      );

      // Community wins
      const recentWins = (winsRes.data ?? []).map((w) => {
        const studentData = w.student as {
          full_name: string;
        } | null;
        const actionLabels: Record<string, string> = {
          milestone_reached: "a atteint un jalon",
          module_completed: "a termine un module",
          payment_received: "a recu un paiement",
        };
        return {
          full_name: studentData?.full_name ?? "Utilisateur",
          action: actionLabels[w.activity_type] ?? w.activity_type,
          created_at: w.created_at,
        };
      });

      return {
        totalLessons,
        completedLessons,
        formationProgress,
        enrolledCourses: courses.length,
        upcomingSessions: sessions.length,
        nextSession,
        activeGoals,
        completedGoals,
        totalXp,
        leaderboardRank: (rankRes.data as { rank: number } | null)?.rank ?? 0,
        badgeCount: badgesRes.count ?? 0,
        currentStreak:
          (streakRes.data as { current_streak: number } | null)
            ?.current_streak ?? 0,
        recentCheckins: checkinsRes.count ?? 0,
        unreadNotifications: notificationsRes.count ?? 0,
        recentWins,
      };
    },
    staleTime: 3 * 60 * 1000,
  });
}
