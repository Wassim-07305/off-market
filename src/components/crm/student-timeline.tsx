"use client";

import { useMemo } from "react";
import { useStudentActivities, useStudentNotes } from "@/hooks/use-students";
import { useStudentFlagHistory } from "@/hooks/use-students";
import { ACTIVITY_TYPES, STUDENT_FLAGS } from "@/lib/constants";
import { cn, formatDate, getInitials } from "@/lib/utils";
import type { StudentFlag } from "@/types/database";
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
  ArrowRight,
  Clock,
  Activity,
} from "lucide-react";

const ACTIVITY_ICONS: Record<string, typeof BookOpen> = {
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

interface TimelineEntry {
  id: string;
  type: "activity" | "note" | "flag_change";
  date: string;
  activityType?: string;
  content?: string;
  author?: string;
  oldFlag?: StudentFlag | null;
  newFlag?: StudentFlag;
  reason?: string;
  metadata?: Record<string, unknown>;
}

interface StudentTimelineProps {
  studentId: string;
}

export function StudentTimeline({ studentId }: StudentTimelineProps) {
  const { data: activities } = useStudentActivities(studentId, 50);
  const { notes } = useStudentNotes(studentId);
  const { data: flagHistory } = useStudentFlagHistory(studentId);

  // Merge all events into a single sorted timeline
  const timeline = useMemo(() => {
    const entries: TimelineEntry[] = [];

    // Activities
    if (activities) {
      for (const a of activities as Array<{
        id: string;
        activity_type: string;
        created_at: string;
        metadata?: Record<string, unknown>;
      }>) {
        entries.push({
          id: `activity-${a.id}`,
          type: "activity",
          date: a.created_at,
          activityType: a.activity_type,
          metadata: a.metadata,
        });
      }
    }

    // Notes
    if (notes) {
      for (const n of notes as Array<{
        id: string;
        content: string;
        created_at: string;
        author?: { full_name: string };
      }>) {
        entries.push({
          id: `note-${n.id}`,
          type: "note",
          date: n.created_at,
          content: n.content,
          author: n.author?.full_name,
        });
      }
    }

    // Flag changes
    if (flagHistory) {
      for (const f of flagHistory) {
        entries.push({
          id: `flag-${f.id}`,
          type: "flag_change",
          date: f.created_at,
          oldFlag: f.previous_flag,
          newFlag: f.new_flag,
          reason: f.reason ?? undefined,
          author: f.author?.full_name ?? undefined,
        });
      }
    }

    // Sort by date descending
    entries.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    return entries;
  }, [activities, notes, flagHistory]);

  // Group by day
  const groupedByDay = useMemo(() => {
    const groups: { date: string; label: string; entries: TimelineEntry[] }[] =
      [];
    const map = new Map<string, TimelineEntry[]>();

    for (const entry of timeline) {
      const day = new Date(entry.date).toISOString().slice(0, 10);
      if (!map.has(day)) map.set(day, []);
      map.get(day)!.push(entry);
    }

    for (const [day, entries] of map) {
      const d = new Date(day);
      const isToday = d.toDateString() === new Date().toDateString();
      const isYesterday =
        d.toDateString() === new Date(Date.now() - 86400000).toDateString();

      groups.push({
        date: day,
        label: isToday
          ? "Aujourd'hui"
          : isYesterday
            ? "Hier"
            : d.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              }),
        entries,
      });
    }

    return groups;
  }, [timeline]);

  if (timeline.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 text-center">
        <Activity className="w-10 h-10 text-muted-foreground/20 mb-3" />
        <p className="text-sm text-muted-foreground">
          Aucune activité enregistree
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupedByDay.map((group) => (
        <div key={group.date}>
          <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-3 sticky top-0 bg-surface py-1 z-10">
            {group.label}
          </h4>
          <div className="relative pl-6 space-y-3">
            {/* Vertical line */}
            <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />

            {group.entries.map((entry) => (
              <div key={entry.id} className="relative">
                {/* Dot */}
                <div
                  className={cn(
                    "absolute -left-6 top-3 w-3 h-3 rounded-full border-2 border-surface",
                    entry.type === "activity"
                      ? "bg-primary"
                      : entry.type === "note"
                        ? "bg-amber-500"
                        : "bg-red-500",
                  )}
                />

                <div className="bg-muted/50 border border-border rounded-xl p-3">
                  {entry.type === "activity" && (
                    <TimelineActivityItem entry={entry} />
                  )}
                  {entry.type === "note" && <TimelineNoteItem entry={entry} />}
                  {entry.type === "flag_change" && (
                    <TimelineFlagItem entry={entry} />
                  )}
                  <p className="text-[10px] text-muted-foreground/60 mt-1.5 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {new Date(entry.date).toLocaleTimeString("fr-FR", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    &middot; {formatDate(entry.date, "relative")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelineActivityItem({ entry }: { entry: TimelineEntry }) {
  const typeConfig = ACTIVITY_TYPES.find((t) => t.value === entry.activityType);
  const Icon = ACTIVITY_ICONS[entry.activityType ?? ""] ?? Activity;

  return (
    <div className="flex items-center gap-2">
      <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-3 h-3 text-primary" />
      </div>
      <p className="text-sm text-foreground">
        {typeConfig?.label ?? entry.activityType}
      </p>
    </div>
  );
}

function TimelineNoteItem({ entry }: { entry: TimelineEntry }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-md bg-amber-500/10 flex items-center justify-center shrink-0">
          <StickyNote className="w-3 h-3 text-amber-600" />
        </div>
        <p className="text-xs font-medium text-foreground">
          Note ajoutee
          {entry.author && (
            <span className="text-muted-foreground font-normal">
              {" "}
              par {entry.author}
            </span>
          )}
        </p>
      </div>
      <p className="text-sm text-muted-foreground ml-8 line-clamp-2">
        {entry.content}
      </p>
    </div>
  );
}

function TimelineFlagItem({ entry }: { entry: TimelineEntry }) {
  const prevConfig = STUDENT_FLAGS.find((f) => f.value === entry.oldFlag);
  const newConfig = STUDENT_FLAGS.find((f) => f.value === entry.newFlag);

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <div className="w-6 h-6 rounded-md bg-red-500/10 flex items-center justify-center shrink-0">
          <Flag className="w-3 h-3 text-red-500" />
        </div>
        <p className="text-xs font-medium text-foreground">
          Drapeau modifie
          {entry.author && (
            <span className="text-muted-foreground font-normal">
              {" "}
              par {entry.author}
            </span>
          )}
        </p>
      </div>
      <div className="flex items-center gap-1.5 ml-8">
        {prevConfig ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border",
              prevConfig.bgColor,
              prevConfig.textColor,
              prevConfig.borderColor,
            )}
          >
            <span
              className={cn("w-1.5 h-1.5 rounded-full", prevConfig.dotColor)}
            />
            {prevConfig.label}
          </span>
        ) : (
          <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-muted border border-border">
            Aucun
          </span>
        )}
        <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
        {newConfig && (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border",
              newConfig.bgColor,
              newConfig.textColor,
              newConfig.borderColor,
            )}
          >
            <span
              className={cn("w-1.5 h-1.5 rounded-full", newConfig.dotColor)}
            />
            {newConfig.label}
          </span>
        )}
      </div>
      {entry.reason && (
        <p className="text-[11px] text-muted-foreground mt-1 ml-8 italic">
          &quot;{entry.reason}&quot;
        </p>
      )}
    </div>
  );
}
