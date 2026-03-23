"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  Bookmark,
  Plus,
  X,
  Trash2,
  ChevronDown,
  Check,
  Share2,
  Loader2,
  Pencil,
} from "lucide-react";
import {
  useSavedSegments,
  useCreateSegment,
  useUpdateSegment,
  useDeleteSegment,
} from "@/hooks/use-saved-segments";
import { useAuth } from "@/hooks/use-auth";
import type { SavedSegment } from "@/hooks/use-saved-segments";

// ─── Color config for segment dots ──────────────────────────

const SEGMENT_COLORS = [
  { value: "red", dot: "bg-red-500", label: "Rouge" },
  { value: "blue", dot: "bg-blue-500", label: "Bleu" },
  { value: "green", dot: "bg-emerald-500", label: "Vert" },
  { value: "amber", dot: "bg-amber-500", label: "Jaune" },
  { value: "purple", dot: "bg-purple-500", label: "Violet" },
  { value: "zinc", dot: "bg-zinc-400", label: "Gris" },
] as const;

function getSegmentDotClass(color: string | null | undefined): string {
  const found = SEGMENT_COLORS.find((c) => c.value === color);
  return found?.dot ?? "bg-zinc-400";
}

// ─── Save / Edit Modal ──────────────────────────────────────

interface SegmentFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: {
    name: string;
    description: string;
    isShared: boolean;
    color: string;
  }) => void;
  isPending?: boolean;
  initial?: {
    name: string;
    description: string;
    isShared: boolean;
    color: string;
  };
  title: string;
  submitLabel: string;
}

function SegmentFormModal({
  open,
  onClose,
  onSave,
  isPending,
  initial,
  title,
  submitLabel,
}: SegmentFormModalProps) {
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [isShared, setIsShared] = useState(initial?.isShared ?? false);
  const [color, setColor] = useState(initial?.color ?? "zinc");

  useEffect(() => {
    if (open) {
      setName(initial?.name ?? "");
      setDescription(initial?.description ?? "");
      setIsShared(initial?.isShared ?? false);
      setColor(initial?.color ?? "zinc");
    }
  }, [open, initial]);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      description: description.trim(),
      isShared,
      color,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-600/10 flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-red-600" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Nom du segment
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Prospects LinkedIn haute valeur"
              autoFocus
              className="w-full h-10 px-4 bg-muted border border-border rounded-[10px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Description{" "}
              <span className="text-muted-foreground font-normal">
                (optionnel)
              </span>
            </label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Filtres pour les prospects > 5k EUR"
              className="w-full h-10 px-4 bg-muted border border-border rounded-[10px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-600/20 focus:border-red-600/30 transition-all"
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Couleur
            </label>
            <div className="flex items-center gap-2">
              {SEGMENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn(
                    "w-6 h-6 rounded-full transition-all flex items-center justify-center",
                    c.dot,
                    color === c.value
                      ? "ring-2 ring-offset-2 ring-offset-surface ring-foreground/30 scale-110"
                      : "opacity-60 hover:opacity-100",
                  )}
                  title={c.label}
                >
                  {color === c.value && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={isShared}
              onChange={(e) => setIsShared(e.target.checked)}
              className="w-4 h-4 rounded border-border text-red-600 focus:ring-red-600/20 cursor-pointer"
            />
            <div className="flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                Partager avec l&apos;équipe
              </span>
            </div>
          </label>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-9 rounded-[10px] border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isPending}
              className="flex-1 h-9 rounded-[10px] bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : null}
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Segment Manager Component ──────────────────────────────

export interface SegmentFilters {
  tag?: string;
  flag?: string;
  coachId?: string;
  search?: string;
  stage?: string;
  source?: string;
  [key: string]: string | undefined;
}

interface SegmentManagerProps {
  currentFilters: SegmentFilters;
  onApplySegment: (filters: SegmentFilters) => void;
  hasActiveFilters: boolean;
}

export function SegmentManager({
  currentFilters,
  onApplySegment,
  hasActiveFilters,
}: SegmentManagerProps) {
  const [open, setOpen] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [editingSegment, setEditingSegment] = useState<SavedSegment | null>(
    null,
  );
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const { mySegments, sharedSegments, isLoading } = useSavedSegments();
  const createSegment = useCreateSegment();
  const updateSegment = useUpdateSegment();
  const deleteSegment = useDeleteSegment();

  const allSegments = [...mySegments, ...sharedSegments];

  // Close dropdown on click outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleSave = useCallback(
    (data: {
      name: string;
      description: string;
      isShared: boolean;
      color: string;
    }) => {
      createSegment.mutate(
        {
          name: data.name,
          description: data.description || undefined,
          filters: { ...currentFilters } as Record<string, unknown>,
          is_shared: data.isShared,
          color: data.color,
        },
        {
          onSuccess: () => {
            setShowSaveModal(false);
          },
        },
      );
    },
    [currentFilters, createSegment],
  );

  const handleUpdate = useCallback(
    (data: {
      name: string;
      description: string;
      isShared: boolean;
      color: string;
    }) => {
      if (!editingSegment) return;
      updateSegment.mutate(
        {
          id: editingSegment.id,
          name: data.name,
          description: data.description || null,
          is_shared: data.isShared,
          color: data.color,
        },
        {
          onSuccess: () => {
            setEditingSegment(null);
          },
        },
      );
    },
    [editingSegment, updateSegment],
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteSegment.mutate(id);
      if (activeSegmentId === id) setActiveSegmentId(null);
    },
    [deleteSegment, activeSegmentId],
  );

  const handleApply = useCallback(
    (segment: SavedSegment) => {
      onApplySegment(segment.filters as SegmentFilters);
      setActiveSegmentId(segment.id);
      setOpen(false);
    },
    [onApplySegment],
  );

  const handleClear = useCallback(() => {
    onApplySegment({});
    setActiveSegmentId(null);
    setOpen(false);
  }, [onApplySegment]);

  const activeSegment = allSegments.find((s) => s.id === activeSegmentId);

  const isOwner = (segment: SavedSegment) => segment.created_by === user?.id;

  const filterCount = (segment: SavedSegment) =>
    Object.values(segment.filters).filter(Boolean).length;

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <div className="flex items-center gap-1.5">
          {/* Main dropdown button */}
          <button
            onClick={() => setOpen(!open)}
            className={cn(
              "h-9 px-3.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-2",
              activeSegment
                ? "bg-red-600/10 text-red-600 border-red-600/30"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/60",
            )}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span className="max-w-[120px] truncate">
              {activeSegment ? activeSegment.name : "Segments"}
            </span>
            <ChevronDown
              className={cn(
                "w-3 h-3 transition-transform",
                open && "rotate-180",
              )}
            />
          </button>

          {/* Quick-save current filter */}
          {hasActiveFilters && !activeSegment && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="h-9 px-2.5 rounded-xl border border-dashed border-border text-xs text-muted-foreground hover:text-red-600 hover:border-red-600/30 hover:bg-red-600/5 transition-all flex items-center gap-1"
              title="Sauvegarder le filtre actuel"
            >
              <Plus className="w-3.5 h-3.5" />
              <Bookmark className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown panel */}
        {open && (
          <div className="absolute top-full mt-2 left-0 bg-surface border border-border rounded-xl shadow-lg z-50 w-72 overflow-hidden">
            {isLoading ? (
              <div className="p-6 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : allSegments.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
                  <Bookmark className="w-5 h-5 text-muted-foreground/40" />
                </div>
                <p className="text-xs font-medium text-foreground">
                  Aucun segment sauvegarde
                </p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Appliquez des filtres puis sauvegardez-les pour un acces
                  rapide
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={() => {
                      setOpen(false);
                      setShowSaveModal(true);
                    }}
                    className="mt-3 h-8 px-4 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-all flex items-center gap-1.5 mx-auto"
                  >
                    <Plus className="w-3 h-3" />
                    Sauvegarder le filtre actuel
                  </button>
                )}
              </div>
            ) : (
              <div className="py-1 max-h-[360px] overflow-y-auto">
                {/* Clear active segment */}
                {activeSegmentId && (
                  <button
                    onClick={handleClear}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-muted transition-colors text-left border-b border-border"
                  >
                    <X className="w-3 h-3" />
                    Effacer le segment actif
                  </button>
                )}

                {/* My segments */}
                {mySegments.length > 0 && (
                  <>
                    <div className="px-3 py-1.5">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Mes segments
                      </span>
                    </div>
                    {mySegments.map((segment) => (
                      <SegmentRow
                        key={segment.id}
                        segment={segment}
                        isActive={activeSegmentId === segment.id}
                        isOwner={true}
                        onApply={() => handleApply(segment)}
                        onEdit={() => {
                          setOpen(false);
                          setEditingSegment(segment);
                        }}
                        onDelete={() => handleDelete(segment.id)}
                      />
                    ))}
                  </>
                )}

                {/* Shared segments */}
                {sharedSegments.length > 0 && (
                  <>
                    <div className="px-3 py-1.5 mt-1">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Partages
                      </span>
                    </div>
                    {sharedSegments.map((segment) => (
                      <SegmentRow
                        key={segment.id}
                        segment={segment}
                        isActive={activeSegmentId === segment.id}
                        isOwner={false}
                        onApply={() => handleApply(segment)}
                      />
                    ))}
                  </>
                )}

                {/* Save current filter */}
                {hasActiveFilters && (
                  <div className="border-t border-border mt-1 pt-1">
                    <button
                      onClick={() => {
                        setOpen(false);
                        setShowSaveModal(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-muted-foreground hover:text-red-600 hover:bg-red-600/5 transition-colors text-left"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Sauvegarder le filtre actuel
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save modal */}
      <SegmentFormModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSave}
        isPending={createSegment.isPending}
        title="Sauvegarder le segment"
        submitLabel="Sauvegarder"
      />

      {/* Edit modal */}
      <SegmentFormModal
        open={!!editingSegment}
        onClose={() => setEditingSegment(null)}
        onSave={handleUpdate}
        isPending={updateSegment.isPending}
        initial={
          editingSegment
            ? {
                name: editingSegment.name,
                description: editingSegment.description ?? "",
                isShared: editingSegment.is_shared,
                color: editingSegment.color ?? "zinc",
              }
            : undefined
        }
        title="Modifier le segment"
        submitLabel="Mettre a jour"
      />
    </>
  );
}

// ─── Segment Row ────────────────────────────────────────────

function SegmentRow({
  segment,
  isActive,
  isOwner,
  onApply,
  onEdit,
  onDelete,
}: {
  segment: SavedSegment;
  isActive: boolean;
  isOwner: boolean;
  onApply: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const filterCount = Object.values(segment.filters).filter(Boolean).length;
  const creatorName = segment.creator?.full_name ?? null;
  const creatorInitial = creatorName
    ? creatorName.charAt(0).toUpperCase()
    : null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors group",
        isActive && "bg-red-600/5",
      )}
    >
      <button
        onClick={onApply}
        className="flex-1 text-left flex items-center gap-2.5 min-w-0"
      >
        {/* Color dot or check */}
        {isActive ? (
          <Check className="w-3.5 h-3.5 text-red-600 shrink-0" />
        ) : (
          <div
            className={cn(
              "w-2.5 h-2.5 rounded-full shrink-0",
              getSegmentDotClass(segment.color),
            )}
          />
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <p
              className={cn(
                "text-sm truncate",
                isActive ? "text-red-600 font-medium" : "text-foreground",
              )}
            >
              {segment.name}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] text-muted-foreground">
              {filterCount} filtre{filterCount !== 1 ? "s" : ""}
            </span>
            {segment.is_shared && !isOwner && creatorInitial && (
              <div className="flex items-center gap-1">
                {segment.creator?.avatar_url ? (
                  <Image
                    src={segment.creator.avatar_url}
                    alt=""
                    width={14}
                    height={14}
                    className="w-3.5 h-3.5 rounded-full"
                  />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                    <span className="text-[8px] font-medium text-muted-foreground">
                      {creatorInitial}
                    </span>
                  </div>
                )}
                <span className="text-[10px] text-blue-500 font-medium">
                  Partage
                </span>
              </div>
            )}
            {segment.is_shared && isOwner && (
              <span className="text-[10px] text-blue-500 flex items-center gap-0.5">
                <Share2 className="w-2.5 h-2.5" />
                Partage
              </span>
            )}
          </div>
        </div>
      </button>

      {/* Edit / Delete — only for owner */}
      {isOwner && (
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              title="Modifier"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground hover:text-red-500 transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
