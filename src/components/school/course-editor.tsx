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
import type {
  Course,
  Module,
  Lesson,
  LessonAttachment,
} from "@/types/database";
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
  HelpCircle,
  ExternalLink,
  X,
} from "lucide-react";
import { QuizBuilder } from "./quiz-builder";
import type { QuizConfig } from "@/types/quiz";
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 px-3 py-2.5 ml-2 cursor-pointer rounded-lg transition-all",
        isSelected
          ? "bg-primary/10 ring-1 ring-primary/25"
          : "hover:bg-muted/80",
        isDragging && "opacity-50 bg-primary/10",
      )}
      onClick={onSelect}
    >
      <button
        {...attributes}
        {...listeners}
        className="w-5 h-5 flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground cursor-grab shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <div
        className={cn(
          "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
          isSelected
            ? "bg-primary/20 text-primary"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Play className="w-3 h-3" />
      </div>
      <span
        className={cn(
          "text-sm truncate flex-1 transition-colors",
          isSelected ? "font-medium text-foreground" : "text-muted-foreground",
        )}
      >
        {lesson.title}
      </span>
      {lesson.estimated_duration && (
        <span className="text-xs text-muted-foreground/70 shrink-0 tabular-nums bg-muted/50 px-1.5 py-0.5 rounded">
          {lesson.estimated_duration}m
        </span>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="w-6 h-6 flex items-center justify-center text-muted-foreground/40 hover:text-error hover:bg-error/10 rounded-md transition-all shrink-0 opacity-0 group-hover:opacity-100"
      >
        <Trash2 className="w-3.5 h-3.5" />
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: mod.id });

  const lessonSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  const sortedLessons = [...lessons].sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  const handleLessonDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = sortedLessons.findIndex((l) => l.id === active.id);
      const newIndex = sortedLessons.findIndex((l) => l.id === over.id);
      const reordered = arrayMove(sortedLessons, oldIndex, newIndex);
      onReorderLessons(
        mod.id,
        reordered.map((l) => l.id),
      );
    },
    [sortedLessons, mod.id, onReorderLessons],
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
        "group/module rounded-xl border bg-surface transition-all",
        isDragging
          ? "opacity-50 border-primary/30 bg-primary/5 shadow-lg"
          : "border-border hover:border-border/80 shadow-sm",
        isSelected && !isDragging
          ? "ring-2 ring-primary/20 border-primary/20"
          : "",
      )}
    >
      {/* Module header */}
      <div className="flex items-center gap-2 px-3 py-3">
        <button
          {...attributes}
          {...listeners}
          className="w-6 h-6 flex items-center justify-center text-muted-foreground/40 hover:text-muted-foreground cursor-grab shrink-0 opacity-0 group-hover/module:opacity-100 transition-opacity"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <button
          onClick={onToggle}
          className="shrink-0 w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        <button
          onClick={onSelect}
          className="flex-1 text-left text-sm font-semibold text-foreground truncate hover:text-primary transition-colors"
        >
          {mod.title}
        </button>
        <span className="text-[11px] text-muted-foreground shrink-0 tabular-nums bg-muted px-2 py-0.5 rounded-full font-medium">
          {lessons.length} lecon{lessons.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={onEdit}
          className="w-7 h-7 flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-muted rounded-lg transition-all shrink-0 opacity-0 group-hover/module:opacity-100"
        >
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDelete}
          className="w-7 h-7 flex items-center justify-center text-muted-foreground/50 hover:text-error hover:bg-error/10 rounded-lg transition-all shrink-0 opacity-0 group-hover/module:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Lessons with DnD */}
      {isExpanded && (
        <div className="border-t border-border/50 pb-2 pt-1">
          <DndContext
            sensors={lessonSensors}
            collisionDetection={closestCenter}
            onDragEnd={handleLessonDragEnd}
          >
            <SortableContext
              items={sortedLessons.map((l) => l.id)}
              strategy={verticalListSortingStrategy}
            >
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
            className="w-[calc(100%-1rem)] mx-2 mt-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-lg border border-dashed border-border/50 hover:border-primary/30 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
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
  moduleTitle,
}: {
  lesson: Lesson;
  onSave: (updates: Partial<Lesson>) => void;
  onAddAttachment: (att: LessonAttachment) => void;
  onRemoveAttachment: (url: string) => void;
  isPending: boolean;
  moduleTitle?: string;
}) {
  const [title, setTitle] = useState(lesson.title);
  const [description, setDescription] = useState(lesson.description ?? "");
  const [videoUrl, setVideoUrl] = useState(
    lesson.video_url ??
      (lesson.content as Record<string, string>)?.video_url ??
      (lesson.content as Record<string, string>)?.url ??
      "",
  );
  const [contentHtml, setContentHtml] = useState(
    lesson.content_html ??
      (lesson.content as Record<string, string>)?.html ??
      "",
  );
  const [duration, setDuration] = useState(lesson.estimated_duration ?? 0);
  const [contentType, setContentType] = useState(lesson.content_type);

  useEffect(() => {
    setTitle(lesson.title);
    setDescription(lesson.description ?? "");
    setVideoUrl(
      lesson.video_url ??
        (lesson.content as Record<string, string>)?.video_url ??
        (lesson.content as Record<string, string>)?.url ??
        "",
    );
    setContentHtml(
      lesson.content_html ??
        (lesson.content as Record<string, string>)?.html ??
        "",
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
    <div className="max-w-2xl space-y-6">
      {/* Header with badge */}
      <div>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground mb-3">
          <FileText className="w-3 h-3" />
          Lecon
        </span>
        {moduleTitle && (
          <p className="text-xs text-muted-foreground mb-1">{moduleTitle}</p>
        )}
        <h2 className="text-xl font-display font-semibold text-foreground">
          {lesson.title}
        </h2>
      </div>

      {/* Card 1: Informations generales */}
      <div
        className="bg-surface rounded-2xl border border-border p-6 space-y-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            Titre
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="Titre de la lecon"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-shadow"
            placeholder="Description de la lecon (optionnelle)"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
              <Clock className="w-3 h-3 inline mr-1" />
              Duree (minutes)
            </label>
            <input
              type="number"
              min={0}
              value={duration || ""}
              onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
              placeholder="Ex : 15"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
              Type de contenu
            </label>
            <div className="flex flex-wrap gap-1.5">
              {[
                { value: "video", label: "Video", icon: Video },
                { value: "text", label: "Texte", icon: FileText },
                { value: "quiz", label: "Quiz", icon: HelpCircle },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() =>
                    setContentType(t.value as Lesson["content_type"])
                  }
                  className={cn(
                    "h-8 px-3 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all",
                    contentType === t.value
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  <t.icon className="w-3 h-3" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5"
          >
            {isPending && <Save className="w-3.5 h-3.5 animate-spin" />}
            Enregistrer
          </button>
        </div>
      </div>

      {/* Card 2: Video */}
      <div
        className="bg-surface rounded-2xl border border-border p-6 space-y-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Video className="w-4 h-4 text-muted-foreground" />
          <span className="text-base font-display font-semibold text-foreground">
            Video
          </span>
        </div>

        {videoUrl && (
          <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Video actuelle :
            </p>
            <p className="text-sm truncate">{videoUrl}</p>
            <button
              onClick={() => setVideoUrl("")}
              className="h-7 px-2 rounded-lg text-xs text-error hover:bg-error/10 transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Retirer la video
            </button>
          </div>
        )}

        <div>
          <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            URL de la video (YouTube, Vimeo, etc.)
          </label>
          <input
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className={inputClass}
          />
        </div>

        <div className="relative flex items-center">
          <div className="flex-1 border-t border-border" />
          <span className="px-3 text-xs text-muted-foreground">ou</span>
          <div className="flex-1 border-t border-border" />
        </div>

        <FileUpload
          bucket="course-assets"
          path="videos"
          accept="video/*"
          maxSizeMB={500}
          label="Glissez une video ou cliquez pour uploader"
          onUpload={(url) => setVideoUrl(url)}
        />
      </div>

      {/* Card 3: Pieces jointes */}
      <div
        className="bg-surface rounded-2xl border border-border p-6 space-y-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-muted-foreground" />
          <span className="text-base font-display font-semibold text-foreground">
            Pieces jointes
          </span>
        </div>

        {attachments.length > 0 && (
          <div className="space-y-2">
            {attachments.map((att) => (
              <div
                key={att.url}
                className="flex items-center gap-3 rounded-xl border border-border px-3 py-2"
              >
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{att.name}</p>
                  <p className="text-xs text-muted-foreground uppercase">
                    {att.type}
                  </p>
                </div>
                <a
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline shrink-0"
                >
                  Ouvrir
                </a>
                <button
                  onClick={() => onRemoveAttachment(att.url)}
                  className="p-1 text-muted-foreground hover:text-error rounded shrink-0"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <FileUpload
          bucket="course-assets"
          path="resources"
          maxSizeMB={100}
          label="Ajouter une piece jointe"
          onUpload={(url, name) => {
            const ext = name.split(".").pop()?.toLowerCase() ?? "";
            let type = "document";
            if (["mp4", "webm", "mov"].includes(ext)) type = "video";
            if (["mp3", "wav", "ogg"].includes(ext)) type = "audio";
            if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext))
              type = "image";
            onAddAttachment({ name, url, type });
          }}
        />
      </div>

      {/* Card 4: Text/HTML Content */}
      {contentType === "text" && (
        <div
          className="bg-surface rounded-2xl border border-border p-6 space-y-4"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-base font-display font-semibold text-foreground">
              Contenu texte
            </span>
          </div>
          <textarea
            value={contentHtml}
            onChange={(e) => setContentHtml(e.target.value)}
            rows={10}
            placeholder="Contenu de la lecon (HTML supporte)"
            className="w-full px-4 py-3 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-y transition-shadow font-mono"
          />
        </div>
      )}

      {/* Card 5: Quiz Builder */}
      {contentType === "quiz" && (
        <div
          className="bg-surface rounded-2xl border border-border p-6 space-y-4"
          style={{ boxShadow: "var(--shadow-card)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4 text-muted-foreground" />
            <span className="text-base font-display font-semibold text-foreground">
              Quiz
            </span>
          </div>
          <QuizBuilder
            initialConfig={
              (lesson.content as unknown as QuizConfig)?.questions
                ? (lesson.content as unknown as QuizConfig)
                : undefined
            }
            onSave={(quizConfig) => {
              onSave({
                content_type: "quiz",
                content: quizConfig as unknown as Record<string, unknown>,
              });
            }}
            isSaving={isPending}
          />
        </div>
      )}
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
    <div className="max-w-2xl space-y-6">
      {/* Header with badge */}
      <div>
        <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground mb-3">
          <BookOpen className="w-3 h-3" />
          Module
        </span>
        <h2 className="text-xl font-display font-semibold text-foreground">
          {mod.title}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {mod.lessons?.length ?? 0} lecon
          {(mod.lessons?.length ?? 0) > 1 ? "s" : ""}
        </p>
      </div>

      {/* Card */}
      <div
        className="bg-surface rounded-2xl border border-border p-6 space-y-4"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <div>
          <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            Titre
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            placeholder="Titre du module"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Description du module (optionnelle)"
            className="w-full px-4 py-3 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-shadow"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => onSave({ title, description: description || null })}
            disabled={isPending}
            className="h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-1.5"
          >
            {isPending && <Save className="w-3.5 h-3.5 animate-spin" />}
            Enregistrer
          </button>
        </div>
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
    [...(course.modules ?? [])].sort((a, b) => a.sort_order - b.sort_order),
  );

  // Update modules when course data changes (e.g. after mutation)
  useEffect(() => {
    setModules(
      [...(course.modules ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    );
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
  const [addLessonModuleId, setAddLessonModuleId] = useState<string | null>(
    null,
  );

  // Mobile sidebar
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // DnD
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
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
        { onError: () => toast.error("Erreur lors du reordonnancement") },
      );
    },
    [modules, mutations.reorderModules, course.id],
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
    ? (modules.find((m) => m.id === selectedModuleId) ?? null)
    : null;
  const selectedLesson = selectedLessonId
    ? (modules
        .flatMap((m) => m.lessons ?? [])
        .find((l) => l.id === selectedLessonId) ?? null)
    : null;

  // Stats
  const totalLessons = modules.reduce(
    (acc, m) => acc + (m.lessons?.length ?? 0),
    0,
  );

  // Sidebar content
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Course header */}
      <div className="p-5 border-b border-border">
        <Link
          href={`${routePrefix}/school`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-3 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          Formations
        </Link>
        <h2 className="text-base font-display font-bold text-foreground truncate">
          {course.title}
        </h2>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
            <BookOpen className="w-3.5 h-3.5" />
            {modules.length} module{modules.length !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5 bg-muted/50 px-2 py-1 rounded-md">
            <Play className="w-3.5 h-3.5" />
            {totalLessons} lecon{totalLessons !== 1 ? "s" : ""}
          </span>
        </div>
        <button
          onClick={() => setShowCourseDialog(true)}
          className="mt-3 w-full h-9 rounded-xl text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center justify-center gap-2 border border-border"
        >
          <Settings className="w-3.5 h-3.5" />
          Parametres du cours
        </button>
      </div>

      {/* Modules list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleModuleDragEnd}
        >
          <SortableContext
            items={modules.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
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
                  if (
                    confirm(
                      `Supprimer le module "${mod.title}" et toutes ses lecons ?`,
                    )
                  ) {
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
                    {
                      onError: () =>
                        toast.error("Erreur lors du reordonnancement"),
                    },
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
      <div className="p-4 border-t border-border">
        <button
          onClick={() => {
            setEditingModule(null);
            setShowModuleDialog(true);
          }}
          className="w-full h-10 rounded-xl text-sm font-medium text-primary hover:text-primary-foreground bg-primary/10 hover:bg-primary transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
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
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
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
            key={selectedLesson.id}
            lesson={selectedLesson}
            moduleTitle={
              modules.find((m) =>
                (m.lessons ?? []).some((l) => l.id === selectedLesson.id),
              )?.title
            }
            isPending={mutations.updateLesson.isPending}
            onSave={(updates) => {
              mutations.updateLesson.mutate(
                { id: selectedLesson.id, ...updates },
                {
                  onSuccess: () => toast.success("Lecon mise a jour"),
                  onError: () => toast.error("Erreur lors de la sauvegarde"),
                },
              );
            }}
            onAddAttachment={(att) => {
              mutations.addAttachment.mutate(
                { lessonId: selectedLesson.id, attachment: att },
                {
                  onSuccess: () => toast.success("Fichier ajoute"),
                  onError: () => toast.error("Erreur"),
                },
              );
            }}
            onRemoveAttachment={(url) => {
              mutations.removeAttachment.mutate(
                { lessonId: selectedLesson.id, attachmentUrl: url },
                {
                  onSuccess: () => toast.success("Fichier supprime"),
                  onError: () => toast.error("Erreur"),
                },
              );
            }}
          />
        ) : selectedModule ? (
          <ModuleEditorPanel
            key={selectedModule.id}
            module={selectedModule}
            isPending={mutations.updateModule.isPending}
            onSave={(updates) => {
              mutations.updateModule.mutate(
                { id: selectedModule.id, ...updates },
                {
                  onSuccess: () => toast.success("Module mis a jour"),
                  onError: () => toast.error("Erreur lors de la sauvegarde"),
                },
              );
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-display font-semibold text-foreground mb-1">
              Selectionnez un element
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Cliquez sur un module ou une lecon dans le panneau de gauche pour
              modifier son contenu.
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
            },
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
        isPending={
          editingModule
            ? mutations.updateModule.isPending
            : mutations.createModule.isPending
        }
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
              },
            );
          } else {
            const maxSort = modules.reduce(
              (max, m) => Math.max(max, m.sort_order),
              -1,
            );
            mutations.createModule.mutate(
              {
                course_id: course.id,
                title: data.title,
                description: data.description,
                sort_order: maxSort + 1,
              },
              {
                onSuccess: (newModule) => {
                  toast.success("Module cree");
                  setShowModuleDialog(false);
                  setExpandedModules(
                    (prev) => new Set([...prev, newModule.id]),
                  );
                },
                onError: () => toast.error("Erreur"),
              },
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
          const maxSort = (targetModule?.lessons ?? []).reduce(
            (max, l) => Math.max(max, l.sort_order),
            -1,
          );
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
            },
          );
        }}
      />
    </div>
  );
}
