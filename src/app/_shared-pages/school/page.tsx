"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { useCourses, useCourseMutations, useLessonProgress } from "@/hooks/use-courses";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { CourseFormDialog } from "@/components/school/course-form-dialog";
import {
  GraduationCap,
  Clock,
  BookOpen,
  Users,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Pencil,
} from "lucide-react";

export default function SchoolPage() {
  const [statusFilter, setStatusFilter] = useState("all");
  const { data: courses, isLoading } = useCourses(statusFilter);
  const { data: progress } = useLessonProgress();
  const { isStaff } = useAuth();
  const prefix = useRoutePrefix();
  const router = useRouter();
  const mutations = useCourseMutations();

  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const completedIds = new Set(
    progress?.filter((p) => p.status === "completed").map((p) => p.lesson_id) ?? []
  );

  const filters = [
    { value: "all", label: "Tous" },
    { value: "published", label: "Publies" },
    { value: "draft", label: "Brouillons" },
  ];

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <motion.div
        variants={staggerItem}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground tracking-tight">
            Formation
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {courses?.length ?? 0} cours disponible{(courses?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
        {isStaff && (
          <button
            onClick={() => setShowCreateDialog(true)}
            className="h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nouveau cours
          </button>
        )}
      </motion.div>

      {isStaff && (
        <motion.div
          variants={staggerItem}
          className="flex items-center gap-1.5"
        >
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "h-8 px-3 rounded-full text-xs font-medium transition-all",
                statusFilter === f.value
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </motion.div>
      )}

      <motion.div
        variants={staggerItem}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface rounded-2xl overflow-hidden"
              style={{ boxShadow: "var(--shadow-card)" }}
            >
              <div className="h-40 bg-muted animate-shimmer" />
              <div className="p-5 space-y-3">
                <div className="h-4 w-2/3 bg-muted rounded-lg animate-shimmer" />
                <div className="h-3 w-full bg-muted rounded-lg animate-shimmer" />
                <div className="h-3 w-1/2 bg-muted rounded-lg animate-shimmer" />
              </div>
            </div>
          ))
        ) : !courses || courses.length === 0 ? (
          <div className="col-span-full py-16 text-center">
            <GraduationCap className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              Aucun cours pour le moment
            </p>
          </div>
        ) : (
          courses.map((course) => {
            const totalLessons = course.modules?.reduce(
              (acc, m) => acc + (m.lessons?.length ?? 0),
              0
            ) ?? 0;
            const totalDuration = course.estimated_duration ?? 0;
            const completedInCourse = course.modules?.reduce(
              (acc, m) => acc + (m.lessons?.filter((l) => completedIds.has(l.id)).length ?? 0),
              0
            ) ?? 0;
            const progressPercent = totalLessons > 0
              ? Math.round((completedInCourse / totalLessons) * 100)
              : 0;

            return (
              <div
                key={course.id}
                className="group bg-surface rounded-2xl overflow-hidden transition-all duration-300 hover:translate-y-[-2px] relative"
                style={{ boxShadow: "var(--shadow-card)" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card-hover)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow-card)"; }}
              >
                <Link href={`${prefix}/school/${course.id}`}>
                  <div
                    className="h-40 relative overflow-hidden"
                    style={{
                      background: course.cover_image_url
                        ? `url(${course.cover_image_url}) center/cover`
                        : "linear-gradient(135deg, var(--primary) 0%, #18181B 100%)",
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    <div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" style={{
                      background: course.cover_image_url
                        ? `url(${course.cover_image_url}) center/cover`
                        : "transparent",
                    }} />
                    {isStaff && (
                      <span
                        className={cn(
                          "absolute top-3 right-3 text-[10px] font-medium px-2.5 py-1 rounded-full backdrop-blur-sm z-10",
                          course.status === "published"
                            ? "bg-success/80 text-white"
                            : course.status === "draft"
                              ? "bg-black/50 text-white/80"
                              : "bg-black/40 text-white/70"
                        )}
                      >
                        {course.status === "published"
                          ? "Publie"
                          : course.status === "draft"
                            ? "Brouillon"
                            : "Archive"}
                      </span>
                    )}
                    {/* Progress bar overlay */}
                    {progressPercent > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                        <div
                          className="h-full bg-success transition-all"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-display font-semibold text-foreground group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {course.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span className="font-mono">{totalLessons}</span> lecon{totalLessons !== 1 ? "s" : ""}
                      </span>
                      {totalDuration > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span className="font-mono">{Math.round(totalDuration / 60)}</span>h
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span className="font-mono">{course.modules?.length ?? 0}</span> module{(course.modules?.length ?? 0) !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {completedInCourse > 0 && (
                      <p className="text-[11px] text-success mt-2">
                        {completedInCourse}/{totalLessons} lecons terminees ({progressPercent}%)
                      </p>
                    )}
                  </div>
                </Link>

                {/* Admin actions */}
                {isStaff && (
                  <div className="absolute top-3 left-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        mutations.updateCourse.mutate(
                          { id: course.id, status: course.status === "published" ? "draft" : "published" },
                          {
                            onSuccess: () => toast.success(course.status === "published" ? "Depublie" : "Publie"),
                          }
                        );
                      }}
                      className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 backdrop-blur-sm"
                      title={course.status === "published" ? "Depublier" : "Publier"}
                    >
                      {course.status === "published" ? (
                        <EyeOff className="w-3 h-3" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                    </button>
                    <Link
                      href={`${prefix}/school/builder/${course.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 backdrop-blur-sm"
                      title="Modifier"
                    >
                      <Pencil className="w-3 h-3" />
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (confirm(`Supprimer le cours "${course.title}" ?`)) {
                          mutations.deleteCourse.mutate(course.id, {
                            onSuccess: () => toast.success("Cours supprime"),
                            onError: () => toast.error("Erreur"),
                          });
                        }
                      }}
                      className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-error/80 backdrop-blur-sm"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </motion.div>

      {/* Create course dialog */}
      <CourseFormDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        isPending={mutations.createCourse.isPending}
        onSave={(data) => {
          mutations.createCourse.mutate(data, {
            onSuccess: (newCourse) => {
              toast.success("Cours cree !");
              setShowCreateDialog(false);
              router.push(`${prefix}/school/builder/${newCourse.id}`);
            },
            onError: () => toast.error("Erreur lors de la creation"),
          });
        }}
      />
    </motion.div>
  );
}
