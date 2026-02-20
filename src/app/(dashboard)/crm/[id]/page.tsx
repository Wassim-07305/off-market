"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useStudent, useStudentActivities, useStudentNotes, useStudentTasks } from "@/hooks/use-students";
import { useAuth } from "@/hooks/use-auth";
import { STUDENT_TAGS, ACTIVITY_TYPES } from "@/lib/constants";
import { getInitials, formatDate, formatCurrency, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { fadeInUp, defaultTransition } from "@/lib/animations";
import {
  ArrowLeft,
  Mail,
  Phone,
  MessageSquare,
  Calendar,
  CheckCircle,
  Clock,
  Pin,
  Plus,
  Send,
} from "lucide-react";
import { toast } from "sonner";

type TabType = "overview" | "timeline" | "notes" | "tasks";

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const { data: student, isLoading } = useStudent(id);
  const { data: activities } = useStudentActivities(id);
  const { notes, addNote, togglePin } = useStudentNotes(id);
  const { tasks, addTask, updateTaskStatus } = useStudentTasks(id);
  const { profile } = useAuth();

  const [newNote, setNewNote] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-32 bg-muted rounded" />
        <div className="bg-surface border border-border rounded-xl p-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-5 w-40 bg-muted rounded" />
              <div className="h-3 w-60 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Eleve non trouve</p>
        <Link href="/crm" className="text-primary text-sm mt-2 inline-block">
          Retour au CRM
        </Link>
      </div>
    );
  }

  const details = student.student_details?.[0];
  const tag = STUDENT_TAGS.find((t) => t.value === details?.tag);
  const score = details?.health_score ?? 0;

  const handleAddNote = async () => {
    if (!newNote.trim() || !profile) return;
    await addNote.mutateAsync({ content: newNote, authorId: profile.id });
    setNewNote("");
    toast.success("Note ajoutee");
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim() || !profile) return;
    await addTask.mutateAsync({
      title: newTaskTitle,
      assigned_by: profile.id,
    });
    setNewTaskTitle("");
    toast.success("Tache ajoutee");
  };

  const tabs: { key: TabType; label: string }[] = [
    { key: "overview", label: "Apercu" },
    { key: "timeline", label: "Timeline" },
    { key: "notes", label: "Notes" },
    { key: "tasks", label: "Taches" },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeInUp}
      transition={defaultTransition}
      className="space-y-6"
    >
      {/* Back button */}
      <Link
        href="/crm"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Link>

      {/* Header */}
      <div className="bg-surface border border-border rounded-xl p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl text-primary font-semibold shrink-0">
            {getInitials(student.full_name)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold text-foreground">
                {student.full_name}
              </h1>
              {tag && (
                <span
                  className={cn(
                    "inline-flex items-center h-6 px-2.5 rounded-full text-xs font-medium border",
                    tag.color
                  )}
                >
                  {tag.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" />
                {student.email}
              </span>
              {student.phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" />
                  {student.phone}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/messaging"
              className="h-9 px-3 rounded-[10px] border border-border text-sm flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </Link>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Score</p>
          <p
            className="text-2xl font-semibold font-bold"
          >
            <span
              className={
                score >= 70
                  ? "text-success"
                  : score >= 40
                    ? "text-warning"
                    : "text-error"
              }
            >
              {score}
            </span>
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Revenus</p>
          <p
            className="text-2xl font-semibold text-foreground font-bold"
          >
            {formatCurrency(Number(details?.revenue ?? 0))}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Inscription</p>
          <p className="text-sm font-medium text-foreground mt-1">
            {details?.enrollment_date
              ? formatDate(details.enrollment_date)
              : "-"}
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Derniere activite</p>
          <p className="text-sm font-medium text-foreground mt-1">
            {details?.last_engagement_at
              ? formatDate(details.last_engagement_at, "relative")
              : "-"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium transition-colors relative",
                activeTab === tab.key
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label}
              {activeTab === tab.key && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div className="bg-surface border border-border rounded-xl p-6">
        {activeTab === "overview" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Objectifs</h3>
            <p className="text-sm text-muted-foreground">
              {details?.goals || "Aucun objectif defini"}
            </p>
            <h3 className="text-sm font-semibold text-foreground mt-6">
              Programme
            </h3>
            <p className="text-sm text-muted-foreground">
              {details?.program || "Aucun programme assigne"}
            </p>
            <h3 className="text-sm font-semibold text-foreground mt-6">
              Notes du coach
            </h3>
            <p className="text-sm text-muted-foreground">
              {details?.coach_notes || "Aucune note"}
            </p>
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="space-y-4">
            {!activities || activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune activite
              </p>
            ) : (
              activities.map((activity) => {
                const typeConfig = ACTIVITY_TYPES.find(
                  (t) => t.value === activity.activity_type
                );
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 pb-4 border-b border-border last:border-0"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground">
                        {typeConfig?.label ?? activity.activity_type}
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
        )}

        {activeTab === "notes" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Ajouter une note..."
                className="flex-1 h-10 px-4 bg-muted border border-border rounded-[10px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="h-10 px-4 bg-primary text-white rounded-[10px] text-sm font-medium hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {notes.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune note
              </p>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-lg bg-muted/50 border border-border group"
                >
                  <div className="flex items-start justify-between">
                    <p className="text-sm text-foreground">{note.content}</p>
                    <button
                      onClick={() =>
                        togglePin.mutate({
                          noteId: note.id,
                          isPinned: note.is_pinned,
                        })
                      }
                      className={cn(
                        "w-7 h-7 rounded flex items-center justify-center transition-colors shrink-0",
                        note.is_pinned
                          ? "text-primary"
                          : "text-muted-foreground opacity-0 group-hover:opacity-100"
                      )}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {formatDate(note.created_at, "relative")}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "tasks" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Nouvelle tache..."
                className="flex-1 h-10 px-4 bg-muted border border-border rounded-[10px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              />
              <button
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim()}
                className="h-10 px-4 bg-primary text-white rounded-[10px] text-sm font-medium hover:bg-primary-hover transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {tasks.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune tache
              </p>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border"
                >
                  <button
                    onClick={() =>
                      updateTaskStatus.mutate({
                        taskId: task.id,
                        status: task.status === "done" ? "todo" : "done",
                      })
                    }
                    className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                      task.status === "done"
                        ? "bg-success border-success"
                        : "border-border hover:border-primary"
                    )}
                  >
                    {task.status === "done" && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </button>
                  <div className="flex-1">
                    <p
                      className={cn(
                        "text-sm",
                        task.status === "done"
                          ? "text-muted-foreground line-through"
                          : "text-foreground"
                      )}
                    >
                      {task.title}
                    </p>
                    {task.due_date && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" />
                        {formatDate(task.due_date)}
                      </p>
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full",
                      task.priority === "urgent"
                        ? "bg-error/10 text-error"
                        : task.priority === "high"
                          ? "bg-warning/10 text-warning"
                          : "bg-muted text-muted-foreground"
                    )}
                  >
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
