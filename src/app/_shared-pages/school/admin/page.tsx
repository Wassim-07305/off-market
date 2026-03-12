"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { useCourses, useCourseMutations } from "@/hooks/use-courses";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { CourseFormDialog } from "@/components/school/course-form-dialog";
import { CoursePrerequisitesManager } from "@/components/school/course-prerequisites-manager";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  GraduationCap,
  Layers,
  Link2,
  ArrowLeft,
} from "lucide-react";

export default function SchoolAdminPage() {
  const prefix = useRoutePrefix();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: courses, isLoading } = useCourses("all");
  const mutations = useCourseMutations();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<{
    id: string;
    title: string;
    description?: string | null;
    cover_image_url?: string | null;
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [prereqCourse, setPrereqCourse] = useState<{ id: string; title: string } | null>(null);

  function handleCreate() {
    setEditingCourse(null);
    setShowCreateDialog(true);
  }

  function handleEdit(course: {
    id: string;
    title: string;
    description?: string | null;
    cover_image_url?: string | null;
  }) {
    setEditingCourse(course);
    setShowCreateDialog(true);
  }

  function handleTogglePublish(course: { id: string; status: string }) {
    const newStatus = course.status === "published" ? "draft" : "published";
    setTogglingId(course.id);

    // Optimistic update: immediately reflect the new status in the UI
    queryClient.setQueryData(["courses", "all"], (old: typeof courses) =>
      old?.map((c) => (c.id === course.id ? { ...c, status: newStatus } : c)),
    );

    mutations.updateCourse.mutate(
      {
        id: course.id,
        status: newStatus as "draft" | "published",
      },
      {
        onSuccess: () => {
          toast.success(
            course.status === "published"
              ? "Formation depubliee"
              : "Formation publiee",
          );
          setTogglingId(null);
        },
        onError: () => {
          // Rollback optimistic update
          queryClient.setQueryData(["courses", "all"], (old: typeof courses) =>
            old?.map((c) =>
              c.id === course.id ? { ...c, status: course.status } : c,
            ),
          );
          toast.error("Erreur lors de la mise a jour");
          setTogglingId(null);
        },
      },
    );
  }

  function handleDelete(courseId: string, title: string) {
    if (
      !confirm(
        `Supprimer la formation "${title}" ? Cette action est irreversible.`,
      )
    )
      return;

    setDeletingId(courseId);
    mutations.deleteCourse.mutate(courseId, {
      onSuccess: () => {
        toast.success("Formation supprimee");
        setDeletingId(null);
      },
      onError: () => {
        toast.error("Erreur lors de la suppression");
        setDeletingId(null);
      },
    });
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={staggerItem}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <Link
            href={`${prefix}/school`}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour aux formations
          </Link>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            Gestion des formations
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Creez, modifiez et organisez vos formations
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle formation
        </button>
      </motion.div>

      {/* Course grid */}
      <motion.div variants={staggerItem}>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-surface rounded-2xl overflow-hidden"
                style={{ boxShadow: "var(--shadow-card)" }}
              >
                <div className="h-[180px] bg-muted animate-shimmer" />
                <div className="p-5 space-y-3">
                  <div className="h-4 w-2/3 bg-muted rounded-lg animate-shimmer" />
                  <div className="h-3 w-full bg-muted rounded-lg animate-shimmer" />
                </div>
              </div>
            ))}
          </div>
        ) : !courses || courses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <GraduationCap className="h-16 w-16 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-display font-semibold mb-1">
              Aucune formation
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Commencez par creer votre premiere formation
            </p>
            <button
              onClick={handleCreate}
              className="h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Creer une formation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const moduleCount = course.modules?.length ?? 0;
              const lessonCount =
                course.modules?.reduce(
                  (acc, m) => acc + (m.lessons?.length ?? 0),
                  0,
                ) ?? 0;
              const isDeleting = deletingId === course.id;
              const isToggling = togglingId === course.id;

              return (
                <div
                  key={course.id}
                  className={cn(
                    "group bg-surface rounded-2xl overflow-hidden transition-all hover:shadow-lg",
                    isDeleting && "opacity-50 pointer-events-none",
                  )}
                  style={{ boxShadow: "var(--shadow-card)" }}
                >
                  {/* Thumbnail */}
                  <div className="relative h-[180px] overflow-hidden">
                    {course.cover_image_url ? (
                      <div
                        className="w-full h-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${course.cover_image_url})`,
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-gradient-to-br from-primary to-zinc-900">
                        <BookOpen className="h-12 w-12 text-white/20" />
                      </div>
                    )}

                    {/* Status badge */}
                    <div className="absolute top-3 right-3">
                      <span
                        className={cn(
                          "text-[10px] font-medium px-2.5 py-1 rounded-full backdrop-blur-sm",
                          course.status === "published"
                            ? "bg-success/90 text-white"
                            : "bg-black/50 text-white/80",
                        )}
                      >
                        {course.status === "published" ? "Publie" : "Brouillon"}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    {/* Title */}
                    <h3 className="font-display font-semibold text-base text-foreground line-clamp-1">
                      {course.title}
                    </h3>

                    {/* Description */}
                    {course.description ? (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {course.description}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground/50 italic">
                        Aucune description
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5" />
                        {moduleCount} module{moduleCount > 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3.5 w-3.5" />
                        {lessonCount} lecon{lessonCount > 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 pt-3 border-t border-border">
                      {/* Primary: modules & lessons */}
                      <Link
                        href={`${prefix}/school/builder/${course.id}`}
                        className="w-full h-9 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                      >
                        <Layers className="h-3.5 w-3.5" />
                        Modules &amp; Lecons
                      </Link>

                      {/* Secondary actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(course)}
                          className="flex-1 h-8 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center justify-center gap-1.5"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Infos
                        </button>

                        <button
                          onClick={() => setPrereqCourse({ id: course.id, title: course.title })}
                          className="h-8 w-8 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center justify-center"
                          title="Prerequis"
                        >
                          <Link2 className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => handleTogglePublish(course)}
                          disabled={isToggling}
                          className={cn(
                            "h-8 px-3 rounded-xl border text-xs font-medium transition-all disabled:opacity-50",
                            course.status === "published"
                              ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                          )}
                        >
                          {isToggling ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : course.status === "published" ? (
                            "Mettre en prive"
                          ) : (
                            "Publier"
                          )}
                        </button>

                        <button
                          onClick={() => handleDelete(course.id, course.title)}
                          disabled={isDeleting}
                          className="h-8 w-8 rounded-xl border border-border text-muted-foreground hover:text-error hover:border-error/30 hover:bg-error/5 transition-all flex items-center justify-center disabled:opacity-50"
                          title="Supprimer"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Course form dialog (create / edit) */}
      <CourseFormDialog
        open={showCreateDialog}
        onClose={() => {
          setShowCreateDialog(false);
          setEditingCourse(null);
        }}
        isPending={
          editingCourse
            ? mutations.updateCourse.isPending
            : mutations.createCourse.isPending
        }
        course={
          editingCourse as Parameters<typeof CourseFormDialog>[0]["course"]
        }
        onSave={(data) => {
          if (editingCourse) {
            mutations.updateCourse.mutate(
              { id: editingCourse.id, ...data },
              {
                onSuccess: () => {
                  toast.success("Formation mise a jour !");
                  setShowCreateDialog(false);
                  setEditingCourse(null);
                },
                onError: () => toast.error("Erreur lors de la mise a jour"),
              },
            );
          } else {
            mutations.createCourse.mutate(data, {
              onSuccess: (newCourse) => {
                toast.success("Formation creee !");
                setShowCreateDialog(false);
                router.push(`${prefix}/school/builder/${newCourse.id}`);
              },
              onError: () => toast.error("Erreur lors de la creation"),
            });
          }
        }}
      />

      {/* Prerequisites manager dialog */}
      <CoursePrerequisitesManager
        courseId={prereqCourse?.id ?? ""}
        courseTitle={prereqCourse?.title ?? ""}
        open={!!prereqCourse}
        onClose={() => setPrereqCourse(null)}
      />
    </motion.div>
  );
}
