"use client";

import { useState } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { PipelineColumn } from "@/types/setter-crm";
import {
  useCreatePipelineColumn,
  useUpdatePipelineColumn,
  useDeletePipelineColumn,
  useReorderPipelineColumns,
} from "@/hooks/use-setter-crm";

const COLUMN_COLORS = [
  { value: "red", label: "Rouge", class: "bg-red-500" },
  { value: "blue", label: "Bleu", class: "bg-blue-500" },
  { value: "green", label: "Vert", class: "bg-green-500" },
  { value: "amber", label: "Ambre", class: "bg-amber-500" },
  { value: "violet", label: "Violet", class: "bg-violet-500" },
  { value: "indigo", label: "Indigo", class: "bg-indigo-500" },
  { value: "rose", label: "Rose", class: "bg-rose-500" },
  { value: "cyan", label: "Cyan", class: "bg-cyan-500" },
  { value: "emerald", label: "Emeraude", class: "bg-emerald-500" },
  { value: "orange", label: "Orange", class: "bg-orange-500" },
];

function getColorClass(color: string) {
  return COLUMN_COLORS.find((c) => c.value === color)?.class ?? "bg-zinc-500";
}

// ─── Sortable Row ──────────────────────────────────────────

function SortableColumnRow({
  column,
  onUpdate,
  onDelete,
  isDeleting,
}: {
  column: PipelineColumn;
  onUpdate: (id: string, name: string, color: string) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(column.name);
  const [color, setColor] = useState(column.color);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  function handleSave() {
    if (!name.trim()) {
      toast.error("Le nom ne peut pas etre vide");
      return;
    }
    onUpdate(column.id, name.trim(), color);
    setEditing(false);
  }

  function handleCancel() {
    setName(column.name);
    setColor(column.color);
    setEditing(false);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-surface px-3 py-2.5",
        isDragging && "opacity-50 shadow-lg",
      )}
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground transition-colors"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Color dot */}
      <div
        className={cn("w-3 h-3 rounded-full shrink-0", getColorClass(color))}
      />

      {editing ? (
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-7 text-sm"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
          />
          {/* Color picker */}
          <div className="flex items-center gap-1">
            {COLUMN_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={cn(
                  "w-5 h-5 rounded-full transition-all",
                  c.class,
                  color === c.value
                    ? "ring-2 ring-offset-1 ring-foreground/30 scale-110"
                    : "opacity-50 hover:opacity-80",
                )}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="text-emerald-600 hover:text-emerald-700"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <>
          <span className="flex-1 text-sm font-medium text-foreground">
            {column.name}
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(column.id)}
            disabled={isDeleting}
            className="text-muted-foreground hover:text-red-600 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </>
      )}
    </div>
  );
}

// ─── Main Config Modal ─────────────────────────────────────

interface SetterPipelineConfigProps {
  open: boolean;
  onClose: () => void;
  columns: PipelineColumn[];
}

export function SetterPipelineConfig({
  open,
  onClose,
  columns,
}: SetterPipelineConfigProps) {
  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState("blue");

  const createColumn = useCreatePipelineColumn();
  const updateColumn = useUpdatePipelineColumn();
  const deleteColumn = useDeletePipelineColumn();
  const reorderColumns = useReorderPipelineColumns();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  function handleAdd() {
    if (!newName.trim()) {
      toast.error("Entrez un nom de colonne");
      return;
    }
    createColumn.mutate(
      { name: newName.trim(), color: newColor },
      {
        onSuccess: () => {
          setNewName("");
          setNewColor("blue");
          toast.success("Colonne ajoutee");
        },
      },
    );
  }

  function handleUpdate(id: string, name: string, color: string) {
    updateColumn.mutate(
      { id, name, color },
      { onSuccess: () => toast.success("Colonne mise a jour") },
    );
  }

  function handleDelete(id: string) {
    const col = (columns ?? []).find((c) => c.id === id);
    if (!col) return;
    // On ne supprime pas s'il y a des leads dedans (le hook gere l'erreur)
    deleteColumn.mutate(id, {
      onSuccess: () => toast.success("Colonne supprimee"),
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = (columns ?? []).findIndex((c) => c.id === active.id);
    const newIndex = (columns ?? []).findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(columns ?? [], oldIndex, newIndex);
    const orderedIds = reordered.map((c) => c.id);
    reorderColumns.mutate(orderedIds);
  }

  return (
    <Modal open={open} onClose={onClose} title="Gestion des colonnes" size="lg">
      <div className="space-y-4">
        {/* Add new column */}
        <div className="flex items-end gap-2">
          <Input
            label="Nouvelle colonne"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Ex: Premier contact"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
            wrapperClassName="flex-1"
          />
          <div className="flex items-center gap-1 pb-0.5">
            {COLUMN_COLORS.slice(0, 5).map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setNewColor(c.value)}
                className={cn(
                  "w-5 h-5 rounded-full transition-all",
                  c.class,
                  newColor === c.value
                    ? "ring-2 ring-offset-1 ring-foreground/30 scale-110"
                    : "opacity-40 hover:opacity-70",
                )}
              />
            ))}
          </div>
          <Button
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleAdd}
            loading={createColumn.isPending}
          >
            Ajouter
          </Button>
        </div>

        {/* Existing columns (sortable) */}
        <div className="space-y-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={(columns ?? []).map((c) => c.id)}
              strategy={verticalListSortingStrategy}
            >
              {(columns ?? []).map((col) => (
                <SortableColumnRow
                  key={col.id}
                  column={col}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                  isDeleting={deleteColumn.isPending}
                />
              ))}
            </SortableContext>
          </DndContext>

          {(columns ?? []).length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">
              Aucune colonne. Ajoutez-en une ci-dessus.
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
