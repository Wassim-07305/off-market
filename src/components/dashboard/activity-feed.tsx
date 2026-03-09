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
  module_completed: "a termine un module",
  lesson_completed: "a termine une lecon",
  form_submitted: "a soumis un formulaire",
  message_sent: "a envoye un message",
  login: "s'est connecte",
  milestone_reached: "a atteint un jalon",
  note_added: "note ajoutee",
  call_scheduled: "appel planifie",
  payment_received: "paiement recu",
};

const activityDotColors: Record<string, string> = {
  module_completed: "bg-success",
  lesson_completed: "bg-success",
  payment_received: "bg-success",
  milestone_reached: "bg-warning",
  message_sent: "bg-info",
  form_submitted: "bg-info",
  call_scheduled: "bg-primary",
};

export function ActivityFeed() {
  const supabase = useSupabase();

  const { data: activities, isLoading } = useQuery({
    queryKey: ["recent-activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_activities")
        .select("*, student:profiles!student_activities_student_id_fkey(full_name, avatar_url)")
        .order("created_at", { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div
        className="bg-surface rounded-2xl p-6"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <h3 className="text-[13px] font-semibold text-foreground mb-4">
          Activite recente
        </h3>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full animate-shimmer" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-48 animate-shimmer rounded-lg" />
                <div className="h-2.5 w-20 animate-shimmer rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-surface rounded-2xl p-6"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <h3 className="text-[13px] font-semibold text-foreground mb-4">
        Activite recente
      </h3>
      <div className="relative max-h-96 overflow-y-auto">
        {/* Timeline line */}
        {activities && activities.length > 0 && (
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
        )}

        <div className="space-y-4">
          {(!activities || activities.length === 0) ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune activite recente
            </p>
          ) : (
            activities.map((activity) => {
              const Icon =
                activityIcons[activity.activity_type] || BookOpen;
              const student = activity.student as { full_name: string; avatar_url: string | null } | null;
              const dotColor = activityDotColors[activity.activity_type] || "bg-primary";
              return (
                <div key={activity.id} className="flex items-start gap-3 relative group hover:bg-muted/30 -mx-2 px-2 py-1 rounded-lg transition-colors duration-200">
                  <div className="relative z-10 w-8 h-8 rounded-full bg-surface flex items-center justify-center shrink-0">
                    <div className={cn("w-2.5 h-2.5 rounded-full", dotColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-foreground">
                      <span className="font-medium">
                        {student?.full_name ?? "Utilisateur"}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        {activityLabels[activity.activity_type] ?? activity.activity_type}
                      </span>
                    </p>
                    <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                      {formatDate(activity.created_at, "relative")}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
