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
      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">
          Activite recente
        </h3>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-muted" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-48 bg-muted rounded" />
                <div className="h-2.5 w-20 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">
        Activite recente
      </h3>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {(!activities || activities.length === 0) ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Aucune activite recente
          </p>
        ) : (
          activities.map((activity) => {
            const Icon =
              activityIcons[activity.activity_type] || BookOpen;
            const student = activity.student as { full_name: string; avatar_url: string | null } | null;
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">
                      {student?.full_name ?? "Utilisateur"}
                    </span>{" "}
                    {activityLabels[activity.activity_type] ?? activity.activity_type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(activity.created_at, "relative")}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
