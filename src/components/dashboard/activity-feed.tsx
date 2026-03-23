"use client";

import { useQuery } from "@tanstack/react-query";
import { useSupabase } from "@/hooks/use-supabase";
import { formatDate } from "@/lib/utils";
import {
  BookOpen,
  CheckCircle,
  Check,
  FileText,
  MessageSquare,
  LogIn,
  Flag,
  StickyNote,
  Phone,
  CreditCard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const activityIcons: Record<string, LucideIcon> = {
  module_started: BookOpen,
  module_completed: CheckCircle,
  lesson_completed: Check,
  form_submitted: FileText,
  message_sent: MessageSquare,
  login: LogIn,
  milestone_reached: Flag,
  note_added: StickyNote,
  call_scheduled: Phone,
  payment_received: CreditCard,
};

const activityLabels: Record<string, string> = {
  module_started: "a commence un module",
  module_completed: "a terminé un module",
  lesson_completed: "a terminé une leçon",
  form_submitted: "a soumis un formulaire",
  message_sent: "a envoye un message",
  login: "s'est connecte",
  milestone_reached: "a atteint un jalon",
  note_added: "note ajoutee",
  call_scheduled: "appel planifie",
  payment_received: "paiement recu",
};

const activityDotColors: Record<string, string> = {
  module_started: "bg-blue-500",
  module_completed: "bg-success",
  lesson_completed: "bg-success",
  payment_received: "bg-success",
  milestone_reached: "bg-primary",
  message_sent: "bg-blue-500",
  form_submitted: "bg-blue-500",
  call_scheduled: "bg-primary",
  login: "bg-primary",
  note_added: "bg-primary",
};

export function ActivityFeed() {
  const supabase = useSupabase();

  interface StudentActivity {
    id: string;
    student_id: string;
    activity_type: string;
    metadata: Record<string, unknown> | null;
    created_at: string;
    student: { full_name: string; avatar_url: string | null } | null;
  }

  const { data: activities, isLoading } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any)
        .from("student_activities")
        .select(
          "*, student:profiles!student_activities_student_id_fkey(full_name, avatar_url)",
        )
        .order("created_at", { ascending: false })
        .limit(15);
      if (error) throw error;
      return (data ?? []) as StudentActivity[];
    },
  });

  if (isLoading) {
    return (
      <div className="bg-surface border border-border rounded-lg p-4">
        <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
          Activité récente
        </h3>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="size-1.5 rounded-full animate-shimmer shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-3 w-48 animate-shimmer rounded" />
                <div className="h-2.5 w-20 animate-shimmer rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-4">
      <h3 className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3">
        Activité récente
      </h3>
      <div className="relative max-h-96 overflow-y-auto">
        <div className="space-y-1">
          {!activities || activities.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-8">
              Aucune activité recente
            </p>
          ) : (
            activities.map((activity) => {
              const student = activity.student as {
                full_name: string;
                avatar_url: string | null;
              } | null;
              const dotColor =
                activityDotColors[activity.activity_type] || "bg-primary";
              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 py-1.5 px-1 rounded-md hover:bg-muted/30 transition-colors duration-150"
                >
                  <div
                    className={cn("size-1.5 rounded-full shrink-0", dotColor)}
                  />
                  <p className="flex-1 text-xs text-foreground min-w-0 truncate">
                    <span className="font-medium">
                      {student?.full_name ?? "Utilisateur"}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {activityLabels[activity.activity_type] ??
                        activity.activity_type}
                    </span>
                  </p>
                  <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                    {formatDate(activity.created_at, "relative")}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
