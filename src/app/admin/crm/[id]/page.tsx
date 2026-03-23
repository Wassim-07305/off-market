"use client";

import { use, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import {
  useStudent,
  useStudentActivities,
  useStudentNotes,
  useStudentTasks,
  useStudents as useStudentsHook,
  getStudentDetail,
} from "@/hooks/use-students";
import { useAuth } from "@/hooks/use-auth";
import { STUDENT_PIPELINE_STAGES, ACTIVITY_TYPES } from "@/lib/constants";
import { getInitials, formatDate, formatCurrency, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { fadeInUp, defaultTransition } from "@/lib/animations";
import {
  FlagSelector,
  FlagBadge,
  FlagDot,
} from "@/components/crm/flag-indicator";
import {
  EngagementTagBadge,
  EngagementTagSelector,
} from "@/components/crm/engagement-tag";
import { FlagHistory } from "@/components/crm/flag-history";
import {
  ArrowLeft,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  Clock,
  Pin,
  Plus,
  Target,
  TrendingUp,
  Briefcase,
  AlertTriangle,
  Flag,
  History,
  User,
  FileText,
  DollarSign,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

type TabType =
  | "overview"
  | "business"
  | "timeline"
  | "notes"
  | "tasks"
  | "flags";

export default function AdminStudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const prefix = useRoutePrefix();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const { data: student, isLoading } = useStudent(id);
  const { data: activities } = useStudentActivities(id);
  const { notes, addNote, togglePin } = useStudentNotes(id);
  const { tasks, addTask, updateTaskStatus } = useStudentTasks(id);
  const { profile } = useAuth();
  const { updateStudentFlag, updateStudentTag } = useStudentsHook();

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
        <p className="text-muted-foreground">Élève non trouvé</p>
        <Link
          href={`${prefix}/crm`}
          className="text-primary text-sm mt-2 inline-block"
        >
          Retour au CRM
        </Link>
      </div>
    );
  }

  const details = getStudentDetail(student);
  const score = details?.health_score ?? 0;
  const flag = details?.flag ?? ("green" as const);
  const pipelineStage = details?.pipeline_stage ?? ("onboarding" as const);
  const stageConfig = STUDENT_PIPELINE_STAGES.find(
    (s) => s.value === pipelineStage,
  );
  const engagementScore = details?.engagement_score ?? 0;

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

  const handleFlagChange = (
    newFlag: "green" | "yellow" | "orange" | "red",
    reason?: string,
  ) => {
    if (!profile) return;
    updateStudentFlag.mutate({
      profileId: student.id,
      flag: newFlag,
      reason,
    });
  };

  const handleTagChange = (newTag: string) => {
    updateStudentTag.mutate({
      profileId: student.id,
      tag: newTag,
    });
    toast.success("Tag mis à jour");
  };

  const tabs: { key: TabType; label: string; icon: typeof FileText }[] = [
    { key: "overview", label: "Aperçu", icon: User },
    { key: "business", label: "Business", icon: Briefcase },
    { key: "timeline", label: "Timeline", icon: History },
    { key: "notes", label: "Notes", icon: FileText },
    { key: "tasks", label: "Taches", icon: CheckCircle },
    { key: "flags", label: "Drapeaux", icon: Flag },
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
        href={`${prefix}/crm`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour
      </Link>

      {/* Header */}
      <div
        className={cn(
          "bg-surface border rounded-xl p-6",
          flag === "red"
            ? "border-red-200 bg-red-50/20"
            : flag === "orange"
              ? "border-orange-200 bg-orange-50/20"
              : "border-border",
        )}
      >
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl text-primary font-semibold shrink-0">
              {student.avatar_url ? (
                <Image
                  src={student.avatar_url}
                  alt=""
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                getInitials(student.full_name)
              )}
            </div>
            <div className="absolute -bottom-1 -right-1">
              <FlagDot flag={flag} size="lg" pulse={flag === "red"} />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-semibold text-foreground">
                {student.full_name}
              </h1>
              <FlagBadge flag={flag} />
              {details?.tag && <EngagementTagBadge tag={details.tag} />}
              {stageConfig && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[11px] font-medium border",
                    stageConfig.bg,
                    stageConfig.color,
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      stageConfig.dotColor,
                    )}
                  />
                  {stageConfig.label}
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
              {details?.assigned_coach_profile && (
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  Coach: {details.assigned_coach_profile.full_name}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <FlagSelector
              currentFlag={flag}
              onSelect={handleFlagChange}
              isPending={updateStudentFlag.isPending}
            />
            <Link
              href={`${prefix}/messaging?dm=${id}`}
              className="h-9 px-3 rounded-[10px] border border-border text-sm flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </Link>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Score sante</p>
          <p className="text-2xl font-bold">
            <span
              className={
                score >= 70
                  ? "text-emerald-600"
                  : score >= 40
                    ? "text-amber-600"
                    : "text-red-600"
              }
            >
              {score}
            </span>
          </p>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Engagement</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-2xl font-bold text-foreground">
              {engagementScore}
            </p>
            <Zap
              className={cn(
                "w-4 h-4",
                engagementScore >= 70
                  ? "text-emerald-500"
                  : engagementScore >= 40
                    ? "text-amber-500"
                    : "text-red-500",
              )}
            />
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Revenus</p>
          <p className="text-2xl font-bold text-foreground">
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
          <p className="text-xs text-muted-foreground mb-1">
            Dernière activité
          </p>
          <p className="text-sm font-medium text-foreground mt-1">
            {details?.last_engagement_at
              ? formatDate(details.last_engagement_at, "relative")
              : "-"}
          </p>
        </div>
      </div>

      {/* Engagement tag selector */}
      <div className="bg-surface border border-border rounded-xl p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Tag engagement
        </p>
        <EngagementTagSelector
          currentTag={details?.tag ?? "standard"}
          onSelect={handleTagChange}
          isPending={updateStudentTag.isPending}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-border">
        <nav className="flex gap-1 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-4 py-2.5 text-sm font-medium transition-colors relative flex items-center gap-1.5 whitespace-nowrap",
                  activeTab === tab.key
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                {activeTab === tab.key && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      <div className="bg-surface border border-border rounded-xl p-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Objectifs
              </h3>
              <p className="text-sm text-muted-foreground">
                {details?.goals || "Aucun objectif defini"}
              </p>

              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mt-6">
                <Briefcase className="w-4 h-4 text-primary" />
                Programme
              </h3>
              <p className="text-sm text-muted-foreground">
                {details?.program || "Aucun programme assigne"}
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Notes du coach
              </h3>
              <p className="text-sm text-muted-foreground">
                {details?.coach_notes || "Aucune note"}
              </p>

              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mt-6">
                <TrendingUp className="w-4 h-4 text-primary" />
                Parcours
              </h3>
              <div className="flex items-center gap-1">
                {STUDENT_PIPELINE_STAGES.map((stage, i) => {
                  const isActive = stage.value === pipelineStage;
                  const stageIndex = STUDENT_PIPELINE_STAGES.findIndex(
                    (s) => s.value === pipelineStage,
                  );
                  const isPast = i < stageIndex;

                  return (
                    <div
                      key={stage.value}
                      className="flex items-center gap-1 flex-1"
                    >
                      <div className="flex-1 flex flex-col items-center">
                        <div
                          className={cn(
                            "w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold border-2",
                            isActive
                              ? cn("border-current", stage.color, stage.bg)
                              : isPast
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-border bg-muted text-muted-foreground",
                          )}
                        >
                          {isPast ? <CheckCircle className="w-3 h-3" /> : i + 1}
                        </div>
                        <span
                          className={cn(
                            "text-[9px] mt-1 text-center",
                            isActive
                              ? cn("font-semibold", stage.color)
                              : "text-muted-foreground",
                          )}
                        >
                          {stage.label}
                        </span>
                      </div>
                      {i < STUDENT_PIPELINE_STAGES.length - 1 && (
                        <div
                          className={cn(
                            "h-0.5 w-4 mt-[-12px]",
                            isPast ? "bg-emerald-500" : "bg-border",
                          )}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === "business" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-primary" />
                  Informations business
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border border-border">
                    <span className="text-sm text-muted-foreground">Niche</span>
                    <span className="text-sm font-medium text-foreground">
                      {details?.niche || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border border-border">
                    <span className="text-sm text-muted-foreground">
                      CA actuel
                    </span>
                    <span className="text-sm font-medium text-foreground font-mono">
                      {formatCurrency(details?.current_revenue ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border border-border">
                    <span className="text-sm text-muted-foreground">
                      Objectif CA
                    </span>
                    <span className="text-sm font-medium text-foreground font-mono">
                      {formatCurrency(details?.revenue_objective ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border border-border">
                    <span className="text-sm text-muted-foreground">LTV</span>
                    <span className="text-sm font-medium text-foreground font-mono">
                      {formatCurrency(Number(details?.lifetime_value ?? 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50 border border-border">
                    <span className="text-sm text-muted-foreground">
                      Source
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {details?.acquisition_source || "-"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-warning" />
                  Obstacles
                </h3>
                <div className="p-4 rounded-lg bg-muted/50 border border-border min-h-[100px]">
                  <p className="text-sm text-muted-foreground">
                    {details?.obstacles || "Aucun obstacle identifie"}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    Progression vers l&apos;objectif
                  </h3>
                  {(details?.revenue_objective ?? 0) > 0 ? (
                    <div className="p-4 rounded-lg bg-muted/50 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(details?.current_revenue ?? 0)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(details?.revenue_objective ?? 0)}
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
                          style={{
                            width: `${Math.min(100, ((details?.current_revenue ?? 0) / (details?.revenue_objective ?? 1)) * 100)}%`,
                          }}
                        />
                      </div>
                      <p className="text-center text-xs font-medium text-foreground mt-2">
                        {Math.round(
                          ((details?.current_revenue ?? 0) /
                            (details?.revenue_objective ?? 1)) *
                            100,
                        )}
                        %
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-lg bg-muted/50 border border-border text-center">
                      <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden mb-2">
                        <div className="h-full rounded-full bg-muted-foreground/20" style={{ width: "0%" }} />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Aucun objectif de CA defini. Renseignez l&apos;objectif CA ci-dessus pour suivre la progression.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "timeline" && (
          <div className="space-y-4">
            {!activities || activities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune activité
              </p>
            ) : (
              <div className="relative pl-6">
                <div className="absolute left-2 top-2 bottom-2 w-px bg-border" />
                {(
                  activities as Array<{
                    id: string;
                    activity_type: string;
                    created_at: string;
                  }>
                ).map((activity) => {
                  const typeConfig = ACTIVITY_TYPES.find(
                    (t) => t.value === activity.activity_type,
                  );
                  return (
                    <div
                      key={activity.id}
                      className="relative flex items-start gap-3 pb-4 last:pb-0"
                    >
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full border-2 border-background bg-primary" />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">
                          {typeConfig?.label ?? activity.activity_type}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(activity.created_at, "relative")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
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
              (
                notes as Array<{
                  id: string;
                  content: string;
                  is_pinned: boolean;
                  created_at: string;
                  author?: { full_name: string };
                }>
              ).map((note) => (
                <div
                  key={note.id}
                  className="p-4 rounded-lg bg-muted/50 border border-border group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{note.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {note.author && (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {note.author.full_name}
                          </span>
                        )}
                        <span className="text-[11px] text-muted-foreground">
                          {formatDate(note.created_at, "relative")}
                        </span>
                      </div>
                    </div>
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
                          : "text-muted-foreground opacity-0 group-hover:opacity-100",
                      )}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                  </div>
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
              (
                tasks as Array<{
                  id: string;
                  title: string;
                  status: string;
                  due_date: string | null;
                  priority: string;
                }>
              ).map((task) => (
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
                        : "border-border hover:border-primary",
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
                          : "text-foreground",
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
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {task.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "flags" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <Flag className="w-4 h-4 text-primary" />
                Drapeau actuel
              </h3>
              <FlagSelector
                currentFlag={flag}
                onSelect={handleFlagChange}
                isPending={updateStudentFlag.isPending}
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2 mb-3">
                <History className="w-4 h-4 text-primary" />
                Historique des changements
              </h3>
              <FlagHistory studentId={student.id} />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
