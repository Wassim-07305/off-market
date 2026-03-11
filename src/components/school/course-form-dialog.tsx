"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { FileUpload } from "./file-upload";
import type { Course } from "@/types/database";

interface CourseFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    description: string;
    cover_image_url?: string;
    status: Course["status"];
  }) => void;
  course?: Course | null;
  isPending?: boolean;
}

export function CourseFormDialog({
  open,
  onClose,
  onSave,
  course,
  isPending,
}: CourseFormDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<Course["status"]>("draft");

  useEffect(() => {
    if (course) {
      setTitle(course.title);
      setDescription(course.description ?? "");
      setCoverUrl(course.cover_image_url);
      setStatus(course.status);
    } else {
      setTitle("");
      setDescription("");
      setCoverUrl(null);
      setStatus("draft");
    }
  }, [course, open]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      title: title.trim(),
      description: description.trim(),
      cover_image_url: coverUrl ?? undefined,
      status,
    });
  };

  const inputClass =
    "w-full h-10 px-4 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-shadow";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-lg bg-surface rounded-2xl p-6 space-y-5"
        style={{ boxShadow: "var(--shadow-elevated)" }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-bold text-foreground">
            {course ? "Modifier le cours" : "Nouveau cours"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
              Titre *
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre du cours"
              className={inputClass}
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description du cours"
              rows={3}
              className="w-full px-4 py-3 bg-muted/50 rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-shadow"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
              Image de couverture
            </label>
            <FileUpload
              bucket="course-assets"
              path="thumbnails"
              accept="image/*"
              maxSizeMB={10}
              currentUrl={coverUrl}
              preview
              onUpload={(url) => setCoverUrl(url)}
              onRemove={() => setCoverUrl(null)}
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-1.5">
              Statut
            </label>
            <div className="flex gap-2">
              {[
                { value: "draft", label: "Brouillon" },
                { value: "published", label: "Publie" },
              ].map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setStatus(s.value as Course["status"])}
                  className={`h-9 px-4 rounded-xl text-sm font-medium transition-all ${
                    status === s.value
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-xl text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!title.trim() || isPending}
              className="h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isPending
                ? "Enregistrement..."
                : course
                  ? "Sauvegarder"
                  : "Creer"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
