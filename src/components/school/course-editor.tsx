"use client";

import { useState, useCallback, useEffect } from "react";
import { useCourseMutations } from "@/hooks/use-courses";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ModuleFormDialog } from "./module-form-dialog";
import { LessonFormDialog } from "./lesson-form-dialog";
import { CourseFormDialog } from "./course-form-dialog";
import { FileUpload } from "./file-upload";
import type { Course, Module, Lesson, LessonAttachment } from "@/types/database";
import {
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  Play,
  Clock,
  BookOpen,
  Settings,
  Save,
  Video,
  FileText,
  ExternalLink,
  X,
} from "lucide-react";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Sortable Module Item
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Sortable Lesson Item
// ---------------------------------------------------------------------------

function SortableLessonItem({
  lesson,
  isSelected,
  onSelect,
  onDelete,
}: {
  lesson: Lesson;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-1 px-2 py-1.5 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border last:border-0",
        isSelected && "bg-primary/5",
        isDragging && "opacity-50 bg-primary/5"
      )}
      onClick={onSelect}
    >
      <button
        {...attributes}
        {...listeners}
        className="w-5 h-5 flex items-center justify-center text-muted-foreground/30 hover:text-muted-foreground cursor-grab shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-2.5 h-2.5" />
      </button>
      <Play className="w-3 h-3 text-muted-foreground/50 shrink-0" />
      <span className="text-xs text-foreground truncate flex-1">{lesson.title}</span>
      {lesson.estimated_duration && (
        <span className="text-[10px] text-muted-foreground shrink-0">
          {lesson.estimated_duration}min
        </span>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="w-5 h-5 flex items-center justify-center text-muted-foreground/30 hover:text-error transition-colors shrink-0"
      >
        <Trash2 className="w-2.5 h-2.5" />
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sortable Module Item
// ---------------------------------------------------------------------------

function SortableModuleItem({
  module: mod,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  onEdit,
  onDelete,
  onAddLesson,
  onSelectLesson,
  onDeleteLesson,
  onReorderLessons,
  selectedLessonId,
  lessons,
}: {
  module: Module;
  isExpanded: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onAddLesson: () => void;
  onSelectLesson: (id: string) => void;
  onDeleteLesson: (id: string) => void;
  onReorderLessons: (moduleId: string, orderedIds: string[]) => void;
  selectedLessonId: string | null;
  lessons: Lesson[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: mod.id });

  const lessonSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const sortedLessons = [...lessons].sort((a, b) => a.sort_order - b.sort_order);

  const handleLessonDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = sortedLessons.findIndex((l) => l.id === active.id);
      const newIndex = sortedLessons.findIndex((l) => l.id === over.id);
      const reordered = arrayMove(sortedLessons, oldIndex, newIndex);
      onReorderLessons(mod.id, reordered.map((l) => l.id));
    },
    [sortedLessons, mod.id, onReorderLessons]
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-xl border transition-all",
        isDragging ? "opacity-50 border-primary/30 bg-primary/5" : "border-border",
        isSelected && !isDragging ? "ring-2 ring-primary/20" : ""
      )}
    >
      {/* Module header */}
      <div className="flex items-center gap-1 px-2 py-2">
        <button
          {...attributes}
          {...listeners}
          className="w-6 h-6 flex items-center justify-center text-muted-foreground/50 hover:text-muted-foreground cursor-grab shrink-0"
        >
          <GripVertical className="w-3.5 h-3.5" />
        </button>
        <button onClick={onToggle} className="shrink-0 text-muted-foreground">
          {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={onSelect}
          className="flex-1 text-left text-sm font-medium text-foreground truncate hover:text-primary transition-colors"
        >
          {mod.title}
        </button>
        <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
          {lessons.length}
        </span>
        <button
          onClick={onEdit}
          className="w-6 h-6 flex items-center justify-center text-muted-foreground/50 hover:text-foreground transition-colors shrink-0"
        >
          <Pencil className="w-3 h-3" />
        </button>
        <button
          onClick={onDelete}
          className="w-6 h-6 flex items-center justify-center text-muted-foreground/50 hover:text-error transition-colors shrink-0"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Lessons with DnD */}
      {isExpanded && (
        <div className="border-t border-border">
          <DndContext sensors={lessonSensors} collisionDetection={closestCenter} onDragEnd={handleLessonDragEnd}>
            <SortableContext items={sortedLessons.map((l) => l.id)} strategy={verticalListSortingStrategy}>
              {sortedLessons.map((lesson) => (
                <SortableLessonItem
                  key={lesson.id}
                  lesson={lesson}
                  isSelected={selectedLessonId === lesson.id}
                  onSelect={() => onSelectLesson(lesson.id)}
                  onDelete={() => onDeleteLesson(lesson.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
          <button
            onClick={onAddLesson}
            className="w-full flex items-center gap-1.5 px-3 py-2 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="w-3 h-3" />
            Ajouter une lecon
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Lesson Editor Panel (right side)
// ---------------------------------------------------------------------------

function LessonEditorPanel({
  lesson,
  onSave,
  onAddAttachment,
  onRemoveAttachment,
  isPending,
}: {
  lesson: Lesson;
  onSave: (updates: Partial<Lesson>) => void;
  onAddAttachment: (att: LessonAttachment) => void;
  onRemoveAttachment: (url: string) => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description ?? "");
  const [videoUrl, setVideoUrl] = useState(
    lesson.video_url ?? (lesson.content as Record<string, string>)?.video_url ?? (lesson.content as Record<string, string>)?.url ?? ""
  );
  const [contentHtml, setContentHtml] = useState(
    lesson.content_html ?? (lesson.content as Record<string, string>)?.html ?? ""
  );
  const [duration, setDuration] = useState(lesson.estimated_duration ?? 0);
  const [contentType, setContentType] = useState(lesson.content_type);

  useEffect(() => {
    setTitle(lesson.title);
    setDescription(lesson.description ?? "");
    setVideoUrl(
      lesson.video_url ?? (lesson.content as Record<string, string>)?.video_url ?? (lesson.content as Record<string, string>)?.url ?? ""
    );
    setContentHtml(
      lesson.content_html ?? (lesson.content as Record<string, string>)?.html ?? ""
    );
    setDuration(lesson.estimated_duration ?? 0);
    setContentType(lesson.content_type);
  }, [lesson]);

  const handleSave = () => {
    const updates: Partial<Lesson> = {
      title,
      description: description || null,
      content_type: contentType,
      estimated_duration: duration || null,
      video_url: videoUrl || null,
      content_html: contentHtml || null,
      content: {
        ...(videoUrl ? { url: videoUrl, video_url: videoUrl } : {}),
        ...(contentHtml ? { html: contentHtml } : {}),
      },
    };
    onSave(updates);
  };

  const inputClass =
    "w-full h-10 px-4 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow";

  const attachments = (lesson.attachments ?? []) as LessonAttachment[];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-display font-semibold text-foreground">
          Modifier la lecon
        </h3>
        <button
          onClick={handleSave}
          disabled={isPending}
          className="h-8 px-3 rounded-xl bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          Sauvegarder
        </button>
      </div>

      {/* Title */}
      <div>
        <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
          Titre
        </label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </div>

      {/* Description */}
      <div>
        <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-4 py-3 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-shadow"
          placeholder="Description (optionnelle)"
        />
      </div>

      {/* Content Type */}
      <div>
        <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
          Type de contenu
        </label>
        <div className="flex flex-wrap gap-1.5">
          {[
            { value: "video", label: "Video", icon: Video },
            { value: "text", label: "Texte", icon: FileText },
            { value: "pdf", label: "PDF", icon: FileText },
          ].map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setContentType(t.value as Lesson["content_type"])}
              className={cn(
                "h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all",
                contentType === t.value
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              <t.icon className="w-3 h-3" />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Video URL */}
      {(contentType === "video") && (
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            URL de la video
          </label>
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=... ou URL directe"
            className={inputClass}
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            YouTube, Vimeo, Loom ou URL directe du fichier video
          </p>
          {!videoUrl && (
            <div className="mt-2">
              <FileUpload
                bucket="course-assets"
                path="videos"
                accept="video/*"
                maxSizeMB={500}
                label="Ou televersez une video"
                onUpload={(url) => setVideoUrl(url)}
              />
            </div>
          )}
        </div>
      )}

      {/* Text/HTML Content */}
      {(contentType === "text") && (
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            Contenu texte (HTML)
          </label>
          <textarea
            value={contentHtml}
            onChange={(e) => setContentHtml(e.target.value)}
            rows={8}
            placeholder="Contenu de la lecon (HTML supporte)"
            className="w-full px-4 py-3 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y transition-shadow font-mono"
          />
        </div>
      )}

      {/* Duration */}
      <div>
        <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
          Duree (minutes)
        </label>
        <input
          type="number"
          min={0}
          value={duration || ""}
          onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
          placeholder="0"
          className="w-32 h-10 px-4 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow"
        />
      </div>

      {/* Attachments */}
      <div>
        <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
          Ressources / Fichiers joints
        </label>
        {attachments.length > 0 && (
          <div className="space-y-1.5 mb-3">
            {attachments.map((att) => (
              <div
                key={att.url}
                className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg"
              >
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-xs text-foreground truncate flex-1">{att.name}</span>
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={() => onRemoveAttachment(att.url)}
                  className="text-muted-foreground hover:text-error"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <FileUpload
          bucket="course-assets"
          path="resources"
          maxSizeMB={100}
          label="Ajouter un fichier"
          onUpload={(url, name) => {
            const ext = name.split(".").pop()?.toLowerCase() ?? "";
            let type = "document";
            if (["mp4", "webm", "mov"].includes(ext)) type = "video";
            if (["mp3", "wav", "ogg"].includes(ext)) type = "audio";
            if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) type = "image";
            onAddAttachment({ name, url, type });
          }}
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Module Editor Panel (right side)
// ---------------------------------------------------------------------------

function ModuleEditorPanel({
  module: mod,
  onSave,
  isPending,
}: {
  module: Module;
  onSave: (updates: { title: string; description: string | null }) => void;
  isPending: boolean;
}) {
  const [title, setTitle] = useState(mod.title);
  const [description, setDescription] = useState(mod.description ?? "");

  useEffect(() => {
    setTitle(mod.title);
    setDescription(mod.description ?? "");
  }, [mod]);

  const inputClass =
    "w-full h-10 px-4 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow";

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-display font-semibold text-foreground">
          Modifier le module
        </h3>
        <button
          onClick={() => onSave({ title, description: description || null })}
          disabled={isPending}
          className="h-8 px-3 rounded-xl bg-primary text-white text-xs font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5"
        >
          <Save className="w-3.5 h-3.5" />
          Sauvegarder
        </button>
      </div>

      <div>
        <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
          Titre
        </label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </div>

      <div>
        <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Description du module"
          className="w-full px-4 py-3 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-shadow"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Course Editor
// ---------------------------------------------------------------------------

interface CourseEditorProps {
  course: Course & { modules: (Module & { lessons: Lesson[] })[] };
  routePrefix: string;
}

export function CourseEditor({ course, routePrefix }: CourseEditorProps) {
  const mutations = useCourseMutations();

  // Local state for modules (for optimistic DnD reordering)
  const [modules, setModules] = useState(
    [...(course.modules ?? [])].sort((a, b) => a.sort_order - b.sort_order)
  );

  // Update modules when course data changes (e.g. after mutation)
  useEffect(() => {
    setModules([...(course.modules ?? [])].sort((a, b) => a.sort_order - b.sort_order));
  }, [course.modules]);

  const [expandedModules, setExpandedModules] = useState<Set<string>>(() => {
    const set = new Set<string>();
    if (modules.length > 0) set.add(modules[0].id);
    return set;
  });
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  // Dialogs
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [showLessonDialog, setShowLessonDialog] = useState(false);
  const [addLessonModuleId, setAddLessonModuleId] = useState<string | null>(null);

  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleModuleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = modules.findIndex((m) => m.id === active.id);
      const newIndex = modules.findIndex((m) => m.id === over.id);
      const reordered = arrayMove(modules, oldIndex, newIndex);
      setModules(reordered);

      mutations.reorderModules.mutate(
        { courseId: course.id, orderedIds: reordered.map((m) => m.id) },
        { onError: () => toast.error("Erreur lors du reordonnancement") }
      );
    },
    [modules, mutations.reorderModules, course.id]
  );

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Find selected entities
  const selectedModule = selectedModuleId
    ? modules.find((m) => m.id === selectedModuleId) ?? null
    : null;
  const selectedLesson = selectedLessonId
    ? modules.flatMap((m) => m.lessons ?? []).find((l) => l.id === selectedLessonId) ?? null
    : null;

  // Stats
  const totalLessons = modules.reduce((acc, m) => acc + (m.lessons?.length ?? 0), 0);

  // Sidebar content
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Course header */}
      <div className="p-4 border-b border-border">
        <Link
          href={`${routePrefix}/school`}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3"
        >
          <ArrowLeft className="w-3 h-3" />
          Formations
        </Link>
        <h2 className="text-sm font-display font-bold text-foreground truncate">
          {course.title}
        </h2>
        <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {modules.length} module{modules.length !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1">
            <Play className="w-3 h-3" />
            {totalLessons} lecon{totalLessons !== 1 ? "s" : ""}
          </span>
        </div>
        <button
          onClick={() => setShowCourseDialog(true)}
          className="mt-3 w-full h-8 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5 border border-border"
        >
          <Settings className="w-3 h-3" />
          Parametres du cours
        </button>
      </div>

      {/* Modules list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleModuleDragEnd}>
          <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
            {modules.map((mod) => (
              <SortableModuleItem
                key={mod.id}
                module={mod}
                isExpanded={expandedModules.has(mod.id)}
                isSelected={selectedModuleId === mod.id && !selectedLessonId}
                onToggle={() => toggleModule(mod.id)}
                onSelect={() => {
                  setSelectedModuleId(mod.id);
                  setSelectedLessonId(null);
                  setSidebarOpen(false);
                }}
                onEdit={() => {
                  setEditingModule(mod);
                  setShowModuleDialog(true);
                }}
                onDelete={() => {
                  if (confirm(`Supprimer le module "${mod.title}" et toutes ses lecons ?`)) {
                    mutations.deleteModule.mutate(mod.id, {
                      onSuccess: () => {
                        toast.success("Module supprime");
                        if (selectedModuleId === mod.id) {
                          setSelectedModuleId(null);
                          setSelectedLessonId(null);
                        }
                      },
                      onError: () => toast.error("Erreur"),
                    });
                  }
                }}
                onAddLesson={() => {
                  setAddLessonModuleId(mod.id);
                  setShowLessonDialog(true);
                }}
                onSelectLesson={(id) => {
                  setSelectedLessonId(id);
                  setSelectedModuleId(null);
                  setSidebarOpen(false);
                }}
                onDeleteLesson={(id) => {
                  if (confirm("Supprimer cette lecon ?")) {
                    mutations.deleteLesson.mutate(id, {
                      onSuccess: () => {
                        toast.success("Lecon supprimee");
                        if (selectedLessonId === id) setSelectedLessonId(null);
                      },
                      onError: () => toast.error("Erreur"),
                    });
                  }
                }}
                onReorderLessons={(moduleId, orderedIds) => {
                  mutations.reorderLessons.mutate(
                    { moduleId, orderedIds },
                    { onError: () => toast.error("Erreur lors du reordonnancement") }
                  );
                }}
                selectedLessonId={selectedLessonId}
                lessons={mod.lessons ?? []}
              />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      {/* Add module button */}
      <div className="p-3 border-t border-border">
        <button
          onClick={() => {
            setEditingModule(null);
            setShowModuleDialog(true);
          }}
          className="w-full h-9 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5 border border-dashed border-border"
        >
          <Plus className="w-3.5 h-3.5" />
          Ajouter un module
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] -mx-4 -mt-4 lg:-mx-8 lg:-mt-8">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="lg:hidden fixed bottom-4 left-4 z-40 w-12 h-12 rounded-full bg-primary text-white shadow-lg flex items-center justify-center"
      >
        <BookOpen className="w-5 h-5" />
      </button>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-surface border-r border-border">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex w-80 bg-surface border-r border-border shrink-0">
        {sidebarContent}
      </div>

      {/* Main editor */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        {selectedLesson ? (
          <LessonEditorPanel
            lesson={selectedLesson}
            isPending={mutations.updateLesson.isPending}
            onSave={(updates) => {
              mutations.updateLesson.mutate(
                { id: selectedLesson.id, ...updates },
                {
                  onSuccess: () => toast.success("Lecon mise a jour"),
                  onError: () => toast.error("Erreur lors de la sauvegarde"),
                }
              );
            }}
            onAddAttachment={(att) => {
              mutations.addAttachment.mutate(
                { lessonId: selectedLesson.id, attachment: att },
                {
                  onSuccess: () => toast.success("Fichier ajoute"),
                  onError: () => toast.error("Erreur"),
                }
              );
            }}
            onRemoveAttachment={(url) => {
              mutations.removeAttachment.mutate(
                { lessonId: selectedLesson.id, attachmentUrl: url },
                {
                  onSuccess: () => toast.success("Fichier supprime"),
                  onError: () => toast.error("Erreur"),
                }
              );
            }}
          />
        ) : selectedModule ? (
          <ModuleEditorPanel
            module={selectedModule}
            isPending={mutations.updateModule.isPending}
            onSave={(updates) => {
              mutations.updateModule.mutate(
                { id: selectedModule.id, ...updates },
                {
                  onSuccess: () => toast.success("Module mis a jour"),
                  onError: () => toast.error("Erreur lors de la sauvegarde"),
                }
              );
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <BookOpen className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <h3 className="text-lg font-display font-semibold text-foreground mb-1">
              Editeur de cours
            </h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Selectionnez un module ou une lecon dans la barre laterale pour commencer a editer.
            </p>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <CourseFormDialog
        open={showCourseDialog}
        onClose={() => setShowCourseDialog(false)}
        course={course}
        isPending={mutations.updateCourse.isPending}
        onSave={(data) => {
          mutations.updateCourse.mutate(
            { id: course.id, ...data },
            {
              onSuccess: () => {
                toast.success("Cours mis a jour");
                setShowCourseDialog(false);
              },
              onError: () => toast.error("Erreur"),
            }
          );
        }}
      />

      <ModuleFormDialog
        open={showModuleDialog}
        onClose={() => {
          setShowModuleDialog(false);
          setEditingModule(null);
        }}
        initialTitle={editingModule?.title ?? ""}
        initialDescription={editingModule?.description ?? ""}
        isPending={editingModule ? mutations.updateModule.isPending : mutations.createModule.isPending}
        onSave={(data) => {
          if (editingModule) {
            mutations.updateModule.mutate(
              { id: editingModule.id, ...data },
              {
                onSuccess: () => {
                  toast.success("Module mis a jour");
                  setShowModuleDialog(false);
                  setEditingModule(null);
                },
                onError: () => toast.error("Erreur"),
              }
            );
          } else {
            const maxSort = modules.reduce((max, m) => Math.max(max, m.sort_order), -1);
            mutations.createModule.mutate(
              { course_id: course.id, title: data.title, description: data.description, sort_order: maxSort + 1 },
              {
                onSuccess: (newModule) => {
                  toast.success("Module cree");
                  setShowModuleDialog(false);
                  setExpandedModules((prev) => new Set([...prev, newModule.id]));
                },
                onError: () => toast.error("Erreur"),
              }
            );
          }
        }}
      />

      <LessonFormDialog
        open={showLessonDialog}
        onClose={() => {
          setShowLessonDialog(false);
          setAddLessonModuleId(null);
        }}
        isPending={mutations.createLesson.isPending}
        onSave={(data) => {
          if (!addLessonModuleId) return;
          const targetModule = modules.find((m) => m.id === addLessonModuleId);
          const maxSort = (targetModule?.lessons ?? []).reduce((max, l) => Math.max(max, l.sort_order), -1);
          mutations.createLesson.mutate(
            {
              module_id: addLessonModuleId,
              title: data.title,
              description: data.description,
              sort_order: maxSort + 1,
            },
            {
              onSuccess: (newLesson) => {
                toast.success("Lecon creee");
                setShowLessonDialog(false);
                setAddLessonModuleId(null);
                setSelectedLessonId(newLesson.id);
                setSelectedModuleId(null);
              },
              onError: () => toast.error("Erreur"),
            }
          );
        }}
      />
    </div>
  );
}
