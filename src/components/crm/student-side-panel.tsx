"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { useSupabase } from "@/hooks/use-supabase";
import { useQueryClient } from "@tanstack/react-query";
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
  X,
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
  Pencil,
  Save,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

type TabType =
  | "overview"
  | "business"
  | "timeline"
  | "notes"
  | "tasks"
  | "flags";

interface StudentSidePanelProps {
  studentId: string;
  onClose: () => void;
}

export function StudentSidePanel({
  studentId,
  onClose,
}: StudentSidePanelProps) {
  const prefix = useRoutePrefix();
  const supabase = useSupabase();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const { data: student, isLoading } = useStudent(studentId);
  const { data: activities } = useStudentActivities(studentId);
  const { notes, addNote, togglePin } = useStudentNotes(studentId);
  const { tasks, addTask, updateTaskStatus } = useStudentTasks(studentId);
  const { profile } = useAuth();
  const { updateStudentFlag, updateStudentDetails } = useStudentsHook();

  const [selectedTag, setSelectedTag] = useState<string>("standard");
  const [newNote, setNewNote] = useState("");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    goals: "",
    program: "",
    coach_notes: "",
    niche: "",
    current_revenue: 0,
    revenue_objective: 0,
    obstacles: "",
    acquisition_source: "",
  });

  useEffect(() => {
    if (student) {
      const d = getStudentDetail(student);
      setSelectedTag(d?.tag ?? "standard");
      setEditForm({
        full_name: student.full_name ?? "",
        email: student.email ?? "",
        phone: student.phone ?? "",
        goals: d?.goals ?? "",
        program: d?.program ?? "",
        coach_notes: d?.coach_notes ?? "",
        niche: d?.niche ?? "",
        current_revenue: d?.current_revenue ?? 0,
        revenue_objective: d?.revenue_objective ?? 0,
        obstacles: d?.obstacles ?? "",
        acquisition_source: d?.acquisition_source ?? "",
      });
    }
  }, [student]);

  const handleSave = async () => {
    if (!student) return;
    setSaving(true);
    try {
      // Update profile (name, email, phone)
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: editForm.full_name,
          email: editForm.email,
          phone: editForm.phone || null,
        })
        .eq("id", student.id);
      if (profileError) throw profileError;

      // Update student_details
      updateStudentDetails.mutate({
        profileId: student.id,
        updates: {
          goals: editForm.goals,
          program: editForm.program,
          coach_notes: editForm.coach_notes,
          niche: editForm.niche,
          current_revenue: editForm.current_revenue,
          revenue_objective: editForm.revenue_objective,
          obstacles: editForm.obstacles,
          acquisition_source: editForm.acquisition_source,
        } as never,
      });

      queryClient.invalidateQueries({ queryKey: ["student", studentId] });
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setIsEditing(false);
      toast.success("Informations mises a jour");
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const details = student ? getStudentDetail(student) : undefined;
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
    if (!profile || !student) return;
    updateStudentFlag.mutate(
      {
        profileId: student.id,
        flag: newFlag,
        reason,
      },
      {
        onSuccess: () => {
          toast.success("Drapeau mis a jour");
          queryClient.invalidateQueries({ queryKey: ["student", student.id] });
          queryClient.invalidateQueries({ queryKey: ["students"] });
        },
        onError: (err) => {
          console.error("[Flag]", err);
          toast.error("Erreur changement de drapeau");
        },
      },
    );
  };

  const handleTagChange = async (newTag: string) => {
    if (!student) return;
    const oldTag = selectedTag;
    setSelectedTag(newTag);
    try {
      // Ensure row exists
      const { data: existing } = await supabase
        .from("student_details")
        .select("id")
        .eq("profile_id", student.id)
        .maybeSingle();
      if (!existing) {
        await supabase
          .from("student_details")
          .insert({ profile_id: student.id, tag: newTag });
      } else {
        await supabase
          .from("student_details")
          .update({ tag: newTag })
          .eq("profile_id", student.id);
      }
      toast.success("Tag mis a jour");
    } catch {
      setSelectedTag(oldTag);
      toast.error("Erreur lors de la mise a jour du tag");
    }
  };

  const tabs: { key: TabType; label: string; icon: typeof FileText }[] = [
    { key: "overview", label: "Apercu", icon: User },
    { key: "business", label: "Business", icon: Briefcase },
    { key: "timeline", label: "Timeline", icon: History },
    { key: "notes", label: "Notes", icon: FileText },
    { key: "tasks", label: "Taches", icon: CheckCircle },
    { key: "flags", label: "Drapeaux", icon: Flag },
  ];

  return (
    <>
      {/* Backdrop — transparent, no blur */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed inset-y-0 right-0 w-full max-w-xl bg-background border-l border-border z-50 overflow-y-auto shadow-2xl"
      >
        {/* Header */}
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm border-b border-border z-10 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Fiche eleve
            </h2>
            <div className="flex items-center gap-1.5">
              {!isLoading &&
                student &&
                (isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="h-8 px-3 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="h-8 px-3 rounded-lg bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-colors flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {saving ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Save className="w-3 h-3" />
                      )}
                      Sauvegarder
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="h-8 px-3 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1.5"
                  >
                    <Pencil className="w-3 h-3" />
                    Modifier
                  </button>
                ))}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 pb-8 space-y-5">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-muted" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-48 bg-muted rounded" />
                </div>
              </div>
            </div>
          ) : !student ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Eleve non trouve
            </p>
          ) : (
            <>
              {/* Profile header */}
              <div
                className={cn(
                  "border rounded-xl p-4",
                  flag === "red"
                    ? "border-red-200 bg-red-50/20"
                    : flag === "orange"
                      ? "border-orange-200 bg-orange-50/20"
                      : "border-border",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-lg text-primary font-semibold shrink-0">
                      {student.avatar_url ? (
                        <Image
                          src={student.avatar_url}
                          alt=""
                          width={56}
                          height={56}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        getInitials(student.full_name)
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5">
                      <FlagDot flag={flag} size="lg" pulse={flag === "red"} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="space-y-2">
                        <input
                          value={editForm.full_name}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              full_name: e.target.value,
                            }))
                          }
                          className="w-full h-8 px-2.5 bg-muted border border-border rounded-lg text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                          placeholder="Nom complet"
                        />
                        <div className="flex gap-2">
                          <div className="flex-1 flex items-center gap-1.5">
                            <Mail className="w-3 h-3 text-muted-foreground shrink-0" />
                            <input
                              value={editForm.email}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  email: e.target.value,
                                }))
                              }
                              className="w-full h-7 px-2 bg-muted border border-border rounded text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                              placeholder="Email"
                            />
                          </div>
                          <div className="flex-1 flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                            <input
                              value={editForm.phone}
                              onChange={(e) =>
                                setEditForm((f) => ({
                                  ...f,
                                  phone: e.target.value,
                                }))
                              }
                              className="w-full h-7 px-2 bg-muted border border-border rounded text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                              placeholder="Telephone"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-semibold text-foreground">
                            {student.full_name}
                          </h3>
                        </div>
                        {details?.enrollment_date && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            Membre depuis le{" "}
                            {new Date(
                              details.enrollment_date,
                            ).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {student.email}
                          </span>
                          {student.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {student.phone}
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <FlagSelector
                    currentFlag={flag}
                    onSelect={handleFlagChange}
                    isPending={updateStudentFlag.isPending}
                  />
                  <Link
                    href={`${prefix}/messaging`}
                    className="h-8 px-3 rounded-lg border border-border text-xs flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Message
                  </Link>
                  {stageConfig && (
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 h-6 px-2 rounded-full text-[10px] font-medium border ml-auto",
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
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-surface border border-border rounded-lg p-3 text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">
                    Score
                  </p>
                  <p
                    className={cn(
                      "text-lg font-bold",
                      score >= 70
                        ? "text-emerald-600"
                        : score >= 40
                          ? "text-amber-600"
                          : "text-red-600",
                    )}
                  >
                    {score}
                  </p>
                </div>
                <div className="bg-surface border border-border rounded-lg p-3 text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">
                    Engagement
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    <p className="text-lg font-bold text-foreground">
                      {engagementScore}
                    </p>
                    <Zap
                      className={cn(
                        "w-3.5 h-3.5",
                        engagementScore >= 70
                          ? "text-emerald-500"
                          : engagementScore >= 40
                            ? "text-amber-500"
                            : "text-red-500",
                      )}
                    />
                  </div>
                </div>
                <div className="bg-surface border border-border rounded-lg p-3 text-center">
                  <p className="text-[10px] text-muted-foreground mb-0.5">
                    Revenus
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {formatCurrency(Number(details?.revenue ?? 0))}
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-border -mx-6 px-6">
                <nav className="flex gap-0.5 overflow-x-auto">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={cn(
                          "px-3 py-2 text-xs font-medium transition-colors relative flex items-center gap-1 whitespace-nowrap",
                          activeTab === tab.key
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Icon className="w-3 h-3" />
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
              <div>
                {activeTab === "overview" && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                        <Target className="w-3.5 h-3.5 text-primary" />
                        Objectifs
                      </h3>
                      {isEditing ? (
                        <textarea
                          value={editForm.goals}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              goals: e.target.value,
                            }))
                          }
                          rows={2}
                          className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                          placeholder="Objectifs de l'eleve..."
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {details?.goals || "Aucun objectif defini"}
                        </p>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-primary" />
                        Programme
                      </h3>
                      {isEditing ? (
                        <input
                          value={editForm.program}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              program: e.target.value,
                            }))
                          }
                          className="w-full h-8 px-2.5 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                          placeholder="Programme assigne..."
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {details?.program || "Aucun programme assigne"}
                        </p>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                        <FileText className="w-3.5 h-3.5 text-primary" />
                        Notes du coach
                      </h3>
                      {isEditing ? (
                        <textarea
                          value={editForm.coach_notes}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              coach_notes: e.target.value,
                            }))
                          }
                          rows={3}
                          className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                          placeholder="Notes du coach..."
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {details?.coach_notes || "Aucune note"}
                        </p>
                      )}
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-primary" />
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
                                    "w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold border-2",
                                    isActive
                                      ? cn(
                                          "border-current",
                                          stage.color,
                                          stage.bg,
                                        )
                                      : isPast
                                        ? "border-emerald-500 bg-emerald-500 text-white"
                                        : "border-border bg-muted text-muted-foreground",
                                  )}
                                >
                                  {isPast ? (
                                    <CheckCircle className="w-2.5 h-2.5" />
                                  ) : (
                                    i + 1
                                  )}
                                </div>
                                <span
                                  className={cn(
                                    "text-[8px] mt-0.5 text-center leading-tight",
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
                                    "h-0.5 w-3 mt-[-10px]",
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
                  <div className="space-y-3">
                    {isEditing ? (
                      <>
                        <div className="p-2.5 rounded-lg bg-muted/50 border border-border space-y-1">
                          <label className="text-xs text-muted-foreground">
                            Niche
                          </label>
                          <input
                            value={editForm.niche}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                niche: e.target.value,
                              }))
                            }
                            className="w-full h-8 px-2.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="Niche..."
                          />
                        </div>
                        <div className="p-2.5 rounded-lg bg-muted/50 border border-border space-y-1">
                          <label className="text-xs text-muted-foreground">
                            CA actuel (€)
                          </label>
                          <input
                            type="number"
                            value={editForm.current_revenue}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                current_revenue: Number(e.target.value),
                              }))
                            }
                            className="w-full h-8 px-2.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>
                        <div className="p-2.5 rounded-lg bg-muted/50 border border-border space-y-1">
                          <label className="text-xs text-muted-foreground">
                            Objectif CA (€)
                          </label>
                          <input
                            type="number"
                            value={editForm.revenue_objective}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                revenue_objective: Number(e.target.value),
                              }))
                            }
                            className="w-full h-8 px-2.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>
                        <div className="p-2.5 rounded-lg bg-muted/50 border border-border space-y-1">
                          <label className="text-xs text-muted-foreground">
                            Source d&apos;acquisition
                          </label>
                          <input
                            value={editForm.acquisition_source}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                acquisition_source: e.target.value,
                              }))
                            }
                            className="w-full h-8 px-2.5 bg-background border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                            placeholder="Source..."
                          />
                        </div>
                      </>
                    ) : (
                      [
                        { label: "Niche", value: details?.niche },
                        {
                          label: "CA actuel",
                          value: formatCurrency(details?.current_revenue ?? 0),
                        },
                        {
                          label: "Objectif CA",
                          value: formatCurrency(
                            details?.revenue_objective ?? 0,
                          ),
                        },
                        {
                          label: "LTV",
                          value: formatCurrency(
                            Number(details?.lifetime_value ?? 0),
                          ),
                        },
                        { label: "Source", value: details?.acquisition_source },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex justify-between items-center p-2.5 rounded-lg bg-muted/50 border border-border"
                        >
                          <span className="text-xs text-muted-foreground">
                            {item.label}
                          </span>
                          <span className="text-xs font-medium text-foreground">
                            {item.value || "-"}
                          </span>
                        </div>
                      ))
                    )}
                    <div>
                      <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5 mt-3">
                        <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                        Obstacles
                      </h4>
                      {isEditing ? (
                        <textarea
                          value={editForm.obstacles}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              obstacles: e.target.value,
                            }))
                          }
                          rows={3}
                          className="w-full px-2.5 py-1.5 bg-muted border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                          placeholder="Obstacles identifies..."
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/50 border border-border">
                          {details?.obstacles || "Aucun obstacle identifie"}
                        </p>
                      )}
                    </div>
                    {(details?.revenue_objective ?? 0) > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-1.5">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                          Progression
                        </h4>
                        <div className="p-3 rounded-lg bg-muted/50 border border-border">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] text-muted-foreground">
                              {formatCurrency(details?.current_revenue ?? 0)}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {formatCurrency(details?.revenue_objective ?? 0)}
                            </span>
                          </div>
                          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all"
                              style={{
                                width: `${Math.min(100, ((details?.current_revenue ?? 0) / (details?.revenue_objective ?? 1)) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "timeline" && (
                  <div className="space-y-3">
                    {!activities || activities.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
                        Aucune activite
                      </p>
                    ) : (
                      <div className="relative pl-5">
                        <div className="absolute left-1.5 top-2 bottom-2 w-px bg-border" />
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
                              className="relative flex items-start gap-2.5 pb-3 last:pb-0"
                            >
                              <div className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full border-2 border-background bg-primary" />
                              <div>
                                <p className="text-xs text-foreground">
                                  {typeConfig?.label ?? activity.activity_type}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
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
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Ajouter une note..."
                        className="flex-1 h-9 px-3 bg-muted border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        onKeyDown={(e) => e.key === "Enter" && handleAddNote()}
                      />
                      <button
                        onClick={handleAddNote}
                        disabled={!newNote.trim()}
                        className="h-9 px-3 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-hover transition-all disabled:opacity-50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {notes.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
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
                          className="p-3 rounded-lg bg-muted/50 border border-border group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-foreground">
                                {note.content}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                {note.author && (
                                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                    <User className="w-2.5 h-2.5" />
                                    {note.author.full_name}
                                  </span>
                                )}
                                <span className="text-[10px] text-muted-foreground">
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
                                "w-6 h-6 rounded flex items-center justify-center transition-colors shrink-0",
                                note.is_pinned
                                  ? "text-primary"
                                  : "text-muted-foreground opacity-0 group-hover:opacity-100",
                              )}
                            >
                              <Pin className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "tasks" && (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        placeholder="Nouvelle tache..."
                        className="flex-1 h-9 px-3 bg-muted border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                        onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                      />
                      <button
                        onClick={handleAddTask}
                        disabled={!newTaskTitle.trim()}
                        className="h-9 px-3 bg-primary text-white rounded-lg text-xs font-medium hover:bg-primary-hover transition-all disabled:opacity-50"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {tasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-6">
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
                          className="flex items-center gap-2.5 p-2.5 rounded-lg bg-muted/50 border border-border"
                        >
                          <button
                            onClick={() =>
                              updateTaskStatus.mutate({
                                taskId: task.id,
                                status:
                                  task.status === "done" ? "todo" : "done",
                              })
                            }
                            className={cn(
                              "w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                              task.status === "done"
                                ? "bg-success border-success"
                                : "border-border hover:border-primary",
                            )}
                          >
                            {task.status === "done" && (
                              <CheckCircle className="w-2.5 h-2.5 text-white" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <p
                              className={cn(
                                "text-xs",
                                task.status === "done"
                                  ? "text-muted-foreground line-through"
                                  : "text-foreground",
                              )}
                            >
                              {task.title}
                            </p>
                            {task.due_date && (
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {formatDate(task.due_date)}
                              </p>
                            )}
                          </div>
                          <span
                            className={cn(
                              "text-[10px] px-1.5 py-0.5 rounded-full",
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
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
                        <Flag className="w-3.5 h-3.5 text-primary" />
                        Drapeau actuel
                      </h3>
                      <FlagSelector
                        currentFlag={flag}
                        onSelect={handleFlagChange}
                        isPending={updateStudentFlag.isPending}
                      />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5 mb-2">
                        <History className="w-3.5 h-3.5 text-primary" />
                        Historique
                      </h3>
                      <FlagHistory studentId={student.id} />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}
