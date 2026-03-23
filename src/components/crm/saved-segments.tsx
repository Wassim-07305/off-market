"use client";

import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  Bookmark,
  Plus,
  X,
  Trash2,
  ChevronDown,
  Check,
  Filter,
  Share2,
  Loader2,
} from "lucide-react";
import {
  useSavedSegments,
  useCreateSegment,
  useDeleteSegment,
} from "@/hooks/use-saved-segments";
import type { SavedSegment } from "@/hooks/use-saved-segments";

interface SaveSegmentModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (name: string, isShared: boolean) => void;
  isPending?: boolean;
}

function SaveSegmentModal({
  open,
  onClose,
  onSave,
  isPending,
}: SaveSegmentModalProps) {
  const [name, setName] = useState("");
  const [isShared, setIsShared] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), isShared);
    setName("");
    setIsShared(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Sauvegarder le segment
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Eleves inactifs 2 semaines"
            autoFocus
            className="w-full h-10 px-4 bg-muted border border-border rounded-[10px] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />

          <label className="flex items-center gap-2.5 cursor-pointer group">
            <input
              type="checkbox"
              checked={isShared}
              onChange={(e) => setIsShared(e.target.checked)}
              className="w-4 h-4 rounded border-border text-primary focus:ring-primary/20 cursor-pointer"
            />
            <div className="flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                Partager avec l&apos;équipe
              </span>
            </div>
          </label>

          <div className="flex gap-2">
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
              className="flex-1 h-9 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : null}
              Sauvegarder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export interface SegmentFilters {
  tag?: string;
  flag?: string;
  coachId?: string;
  search?: string;
}

interface SavedSegmentsProps {
  currentFilters: SegmentFilters;
  onApplySegment: (filters: SegmentFilters) => void;
  hasActiveFilters: boolean;
}

export function SavedSegments({
  currentFilters,
  onApplySegment,
  hasActiveFilters,
}: SavedSegmentsProps) {
  const [open, setOpen] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);

  const { segments, isLoading } = useSavedSegments();
  const createSegment = useCreateSegment();
  const deleteSegment = useDeleteSegment();

  const handleSave = useCallback(
    (name: string, isShared: boolean) => {
      createSegment.mutate(
        {
          name,
          filters: { ...currentFilters } as Record<string, unknown>,
          is_shared: isShared,
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

  const activeSegment = segments.find((s) => s.id === activeSegmentId);

  return (
    <>
      <div className="relative">
        <div className="flex items-center gap-1.5">
          {/* Dropdown button */}
          <button
            onClick={() => setOpen(!open)}
            className={cn(
              "h-8 px-3 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5",
              activeSegment
                ? "bg-primary/10 text-primary border-primary/30"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-muted/60",
            )}
          >
            <Filter className="w-3 h-3" />
            {activeSegment ? activeSegment.name : "Segments"}
            <ChevronDown className="w-3 h-3" />
          </button>

          {/* Save current filter */}
          {hasActiveFilters && (
            <button
              onClick={() => setShowSaveModal(true)}
              className="h-8 px-2 rounded-lg border border-dashed border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all flex items-center gap-1"
              title="Sauvegarder ce filtre"
            >
              <Plus className="w-3 h-3" />
              <Bookmark className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Dropdown */}
        {open && (
          <div className="absolute top-full mt-1 left-0 bg-surface border border-border rounded-xl shadow-lg z-50 w-64 overflow-hidden">
            {isLoading ? (
              <div className="p-4 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
              </div>
            ) : segments.length === 0 ? (
              <div className="p-4 text-center">
                <Bookmark className="w-6 h-6 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs text-muted-foreground">
                  Aucun segment sauvegarde
                </p>
                <p className="text-[10px] text-muted-foreground/60 mt-1">
                  Appliquez des filtres puis sauvegardez-les
                </p>
              </div>
            ) : (
              <div className="py-1">
                {/* Clear active */}
                {activeSegmentId && (
                  <button
                    onClick={handleClear}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors text-left"
                  >
                    <X className="w-3 h-3" />
                    Effacer le segment actif
                  </button>
                )}

                {segments.map((segment) => (
                  <div
                    key={segment.id}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 hover:bg-muted transition-colors group",
                      activeSegmentId === segment.id && "bg-primary/5",
                    )}
                  >
                    <button
                      onClick={() => handleApply(segment)}
                      className="flex-1 text-left flex items-center gap-2"
                    >
                      {activeSegmentId === segment.id ? (
                        <Check className="w-3 h-3 text-primary shrink-0" />
                      ) : (
                        <Bookmark className="w-3 h-3 text-muted-foreground shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm text-foreground truncate">
                            {segment.name}
                          </p>
                          {segment.is_shared && (
                            <Share2 className="w-3 h-3 text-blue-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                          {
                            Object.values(segment.filters).filter(Boolean)
                              .length
                          }{" "}
                          filtre(s)
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(segment.id);
                      }}
                      className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground/0 group-hover:text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Close dropdown on click outside */}
        {open && (
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
        )}
      </div>

      <SaveSegmentModal
        open={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSave}
        isPending={createSegment.isPending}
      />
    </>
  );
}
