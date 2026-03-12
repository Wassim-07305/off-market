"use client";

import { useState } from "react";
import { useCoursePrerequisites, usePrerequisiteMutations } from "@/hooks/use-course-prerequisites";
import { useCourses } from "@/hooks/use-courses";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  X,
  Plus,
  Link2,
  BookOpen,
  Loader2,
  ChevronDown,
} from "lucide-react";

interface CoursePrerequisitesManagerProps {
  courseId: string;
  courseTitle: string;
  open: boolean;
  onClose: () => void;
}

export function CoursePrerequisitesManager({
  courseId,
  courseTitle,
  open,
  onClose,
}: CoursePrerequisitesManagerProps) {
  const { data: prerequisites, isLoading } = useCoursePrerequisites(courseId);
  const { data: allCourses } = useCourses("all");
  const { addPrerequisite, removePrerequisite } = usePrerequisiteMutations();
  const [selectedCourseId, setSelectedCourseId] = useState("");

  if (!open) return null;

  // Available courses = all courses except self and already-set prerequisites
  const existingPrereqIds = new Set(prerequisites?.map((p) => p.prerequisite_course_id) ?? []);
  const availableCourses = (allCourses ?? []).filter(
    (c) => c.id !== courseId && !existingPrereqIds.has(c.id)
  );

  function handleAdd() {
    if (!selectedCourseId) return;
    addPrerequisite.mutate(
      { courseId, prerequisiteCourseId: selectedCourseId },
      {
        onSuccess: () => {
          toast.success("Prerequis ajoute");
          setSelectedCourseId("");
        },
        onError: () => toast.error("Erreur lors de l'ajout"),
      }
    );
  }

  function handleRemove(id: string) {
    removePrerequisite.mutate(id, {
      onSuccess: () => toast.success("Prerequis supprime"),
      onError: () => toast.error("Erreur lors de la suppression"),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl border border-border shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Link2 className="w-4 h-4 text-primary" />
              Prerequis
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate max-w-[280px]">
              {courseTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Add prerequisite */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full h-9 pl-3 pr-8 rounded-xl bg-muted/50 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow appearance-none"
              >
                <option value="">Selectionner une formation...</option>
                {availableCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
            <button
              onClick={handleAdd}
              disabled={!selectedCourseId || addPrerequisite.isPending}
              className="h-9 px-3 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center gap-1.5 disabled:opacity-50"
            >
              {addPrerequisite.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )}
              Ajouter
            </button>
          </div>

          {/* Existing prerequisites */}
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-12 bg-muted animate-shimmer rounded-xl" />
              ))}
            </div>
          ) : !prerequisites || prerequisites.length === 0 ? (
            <div className="text-center py-6">
              <BookOpen className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">
                Aucun prerequis. Cette formation est accessible a tous.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                Formations requises ({prerequisites.length})
              </p>
              {prerequisites.map((prereq) => (
                <div
                  key={prereq.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-border bg-muted/30"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-foreground truncate">
                    {prereq.prerequisite?.title ?? "Formation supprimee"}
                  </span>
                  <button
                    onClick={() => handleRemove(prereq.id)}
                    disabled={removePrerequisite.isPending}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-error hover:bg-error/10 transition-colors disabled:opacity-50"
                    title="Supprimer ce prerequis"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Info */}
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Les eleves devront terminer toutes les formations prerequises avant de pouvoir acceder a cette formation.
          </p>
        </div>
      </div>
    </div>
  );
}
