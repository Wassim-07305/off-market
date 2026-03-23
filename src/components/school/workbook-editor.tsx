"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  Eye,
  ArrowLeft,
  Type,
  AlignLeft,
  Hash,
  Star,
  List,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useWorkbookMutations } from "@/hooks/use-workbooks";
import { useCourses } from "@/hooks/use-courses";
import { WorkbookPlayer } from "./workbook-player";
import type {
  WorkbookField,
  WorkbookFieldOption,
  WorkbookModuleType,
} from "@/types/database";

const MODULE_TYPES: { value: WorkbookModuleType; label: string }[] = [
  { value: "marche", label: "Marche" },
  { value: "offre", label: "Offre" },
  { value: "communication", label: "Communication" },
  { value: "acquisition", label: "Acquisition" },
  { value: "conversion", label: "Conversion" },
  { value: "diagnostic", label: "Diagnostic" },
  { value: "general", label: "General" },
];

const FIELD_TYPES: {
  value: WorkbookField["type"];
  label: string;
  icon: typeof Type;
}[] = [
  { value: "text", label: "Texte court", icon: Type },
  { value: "textarea", label: "Texte long", icon: AlignLeft },
  { value: "number", label: "Nombre", icon: Hash },
  { value: "rating", label: "Notation", icon: Star },
  { value: "select", label: "Choix unique", icon: List },
];

interface WorkbookEditorProps {
  existingWorkbook?: {
    id: string;
    title: string;
    description: string | null;
    course_id: string | null;
    module_type: WorkbookModuleType | null;
    fields: WorkbookField[];
  };
  onClose?: () => void;
}

export function WorkbookEditor({
  existingWorkbook,
  onClose,
}: WorkbookEditorProps) {
  const { user } = useAuth();
  const { data: courses } = useCourses("published");
  const { createWorkbook, updateWorkbook } = useWorkbookMutations();

  const [title, setTitle] = useState(existingWorkbook?.title ?? "");
  const [description, setDescription] = useState(
    existingWorkbook?.description ?? "",
  );
  const [courseId, setCourseId] = useState(existingWorkbook?.course_id ?? "");
  const [moduleType, setModuleType] = useState<WorkbookModuleType | "">(
    existingWorkbook?.module_type ?? "",
  );
  const [fields, setFields] = useState<WorkbookField[]>(
    existingWorkbook?.fields ?? [],
  );
  const [showPreview, setShowPreview] = useState(false);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(
    null,
  );

  const addField = (type: WorkbookField["type"]) => {
    const id = crypto.randomUUID();
    const newField: WorkbookField = {
      id,
      type,
      label: "",
      required: false,
      ...(type === "select" ? { options: [{ label: "", value: "" }] } : {}),
      ...(type === "rating" ? { max: 5 } : {}),
    };
    setFields([...fields, newField]);
    setEditingFieldIndex(fields.length);
  };

  const updateField = (index: number, updates: Partial<WorkbookField>) => {
    setFields(fields.map((f, i) => (i === index ? { ...f, ...updates } : f)));
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
    setEditingFieldIndex(null);
  };

  const moveField = (from: number, to: number) => {
    if (to < 0 || to >= fields.length) return;
    const updated = [...fields];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setFields(updated);
    if (editingFieldIndex === from) setEditingFieldIndex(to);
  };

  const addOption = (fieldIndex: number) => {
    const field = fields[fieldIndex];
    if (!field.options) return;
    updateField(fieldIndex, {
      options: [...field.options, { label: "", value: "" }],
    });
  };

  const updateOption = (
    fieldIndex: number,
    optIndex: number,
    updates: Partial<WorkbookFieldOption>,
  ) => {
    const field = fields[fieldIndex];
    if (!field.options) return;
    const updatedOptions = field.options.map((o, i) =>
      i === optIndex ? { ...o, ...updates } : o,
    );
    updateField(fieldIndex, { options: updatedOptions });
  };

  const removeOption = (fieldIndex: number, optIndex: number) => {
    const field = fields[fieldIndex];
    if (!field.options) return;
    updateField(fieldIndex, {
      options: field.options.filter((_, i) => i !== optIndex),
    });
  };

  const handleSave = () => {
    if (!user) return;

    // Validate
    const validFields = fields.filter((f) => f.label.trim());
    if (!title.trim()) return;

    if (existingWorkbook) {
      updateWorkbook.mutate(
        {
          id: existingWorkbook.id,
          title: title.trim(),
          description: description.trim() || null,
          course_id: courseId || null,
          module_type: moduleType || null,
          fields: validFields,
        },
        { onSuccess: () => onClose?.() },
      );
    } else {
      createWorkbook.mutate(
        {
          title: title.trim(),
          description: description.trim() || undefined,
          course_id: courseId || undefined,
          module_type: moduleType || undefined,
          fields: validFields,
          created_by: user.id,
        },
        { onSuccess: () => onClose?.() },
      );
    }
  };

  const isSaving = createWorkbook.isPending || updateWorkbook.isPending;

  if (showPreview && fields.length > 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowPreview(false)}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour a l'editeur
          </button>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 text-xs font-medium">
            <Eye className="w-3.5 h-3.5" />
            Aperçu
          </span>
        </div>
        {/* Mock preview - we can't render the full player without a DB id, so render fields inline */}
        <div className="bg-surface border border-border rounded-xl p-6 space-y-6">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {fields
            .filter((f) => f.label.trim())
            .map((field, i) => (
              <PreviewField key={field.id} field={field} index={i} />
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          {existingWorkbook ? "Modifier le workbook" : "Nouveau workbook"}
        </h3>
        <div className="flex items-center gap-2">
          {fields.length > 0 && (
            <button
              onClick={() => setShowPreview(true)}
              className="inline-flex items-center gap-1.5 h-9 px-4 border border-border bg-surface text-foreground rounded-xl text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              <Eye className="w-4 h-4" />
              Aperçu
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            className="inline-flex items-center gap-2 h-9 px-4 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Enregistrer
          </button>
        </div>
      </div>

      {/* Meta fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Analyse de marche"
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Type de module
          </label>
          <select
            value={moduleType}
            onChange={(e) =>
              setModuleType(e.target.value as WorkbookModuleType | "")
            }
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Aucun</option>
            {MODULE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description du workbook..."
            rows={2}
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">
            Formation associee
          </label>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Aucune</option>
            {courses?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Fields list */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">
          Champs ({fields.length})
        </h4>

        {fields.map((field, index) => (
          <div
            key={field.id}
            className={cn(
              "bg-surface border rounded-xl overflow-hidden transition-all",
              editingFieldIndex === index
                ? "border-primary/50 ring-1 ring-primary/20"
                : "border-border",
            )}
          >
            {/* Field header */}
            <div
              className="flex items-center gap-2 px-4 py-3 cursor-pointer"
              onClick={() =>
                setEditingFieldIndex(editingFieldIndex === index ? null : index)
              }
            >
              <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
                {index + 1}
              </span>
              <span className="flex-1 text-sm font-medium text-foreground truncate">
                {field.label || "Sans titre"}
              </span>
              <span className="text-[11px] text-muted-foreground capitalize px-2 py-0.5 bg-muted rounded-full">
                {FIELD_TYPES.find((t) => t.value === field.type)?.label ??
                  field.type}
              </span>
              {field.required && (
                <span className="text-[10px] text-red-500 font-medium">
                  Requis
                </span>
              )}
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveField(index, index - 1);
                  }}
                  disabled={index === 0}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  title="Monter"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 15l-6-6-6 6" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveField(index, index + 1);
                  }}
                  disabled={index === fields.length - 1}
                  className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  title="Descendre"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeField(index);
                  }}
                  className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Field editor (expanded) */}
            {editingFieldIndex === index && (
              <div className="px-4 pb-4 pt-1 border-t border-border space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Libelle
                    </label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) =>
                        updateField(index, { label: e.target.value })
                      }
                      placeholder="Question ou libelle..."
                      className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">
                      Placeholder
                    </label>
                    <input
                      type="text"
                      value={field.placeholder ?? ""}
                      onChange={(e) =>
                        updateField(index, {
                          placeholder: e.target.value || undefined,
                        })
                      }
                      placeholder="Texte d'aide..."
                      className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">
                    Description (optionnelle)
                  </label>
                  <input
                    type="text"
                    value={field.description ?? ""}
                    onChange={(e) =>
                      updateField(index, {
                        description: e.target.value || undefined,
                      })
                    }
                    placeholder="Aide supplementaire pour ce champ..."
                    className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Number-specific fields */}
                {field.type === "number" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Min
                      </label>
                      <input
                        type="number"
                        value={field.min ?? ""}
                        onChange={(e) =>
                          updateField(index, {
                            min: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                        className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">
                        Max
                      </label>
                      <input
                        type="number"
                        value={field.max ?? ""}
                        onChange={(e) =>
                          updateField(index, {
                            max: e.target.value
                              ? Number(e.target.value)
                              : undefined,
                          })
                        }
                        className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                )}

                {/* Rating-specific */}
                {field.type === "rating" && (
                  <div className="space-y-1 max-w-[200px]">
                    <label className="text-xs font-medium text-muted-foreground">
                      Nombre d'etoiles
                    </label>
                    <input
                      type="number"
                      value={field.max ?? 5}
                      min={1}
                      max={10}
                      onChange={(e) =>
                        updateField(index, { max: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 bg-surface border border-border rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                )}

                {/* Select options */}
                {field.type === "select" && (
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Options
                    </label>
                    {field.options?.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateOption(index, optIdx, {
                              label: val,
                              value:
                                val.toLowerCase().replace(/\s+/g, "_") || "",
                            });
                          }}
                          placeholder={`Option ${optIdx + 1}`}
                          className="flex-1 px-3 py-1.5 bg-surface border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                        <button
                          onClick={() => removeOption(index, optIdx)}
                          className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addOption(index)}
                      className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-medium"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Ajouter une option
                    </button>
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={field.required ?? false}
                    onChange={(e) =>
                      updateField(index, { required: e.target.checked })
                    }
                    className="rounded border-border text-primary focus:ring-primary/20"
                  />
                  <span className="text-foreground text-xs">Champ requis</span>
                </label>
              </div>
            )}
          </div>
        ))}

        {/* Add field buttons */}
        <div className="flex flex-wrap gap-2 pt-2">
          {FIELD_TYPES.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => addField(value)}
              className="inline-flex items-center gap-1.5 h-8 px-3 border border-dashed border-border rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preview Field (read-only rendering for preview mode)
// ---------------------------------------------------------------------------

function PreviewField({
  field,
  index,
}: {
  field: WorkbookField;
  index: number;
}) {
  const baseClass =
    "w-full px-3 py-2 bg-muted/50 border border-border rounded-lg text-sm text-muted-foreground";

  return (
    <div className="space-y-2">
      <label className="flex items-start gap-2">
        <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center mt-0.5">
          {index + 1}
        </span>
        <div>
          <span className="text-sm font-medium text-foreground">
            {field.label}
            {field.required && <span className="text-red-500 ml-0.5">*</span>}
          </span>
          {field.description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {field.description}
            </p>
          )}
        </div>
      </label>
      <div className="pl-8">
        {field.type === "text" && (
          <input
            disabled
            placeholder={field.placeholder ?? ""}
            className={baseClass}
          />
        )}
        {field.type === "textarea" && (
          <textarea
            disabled
            rows={3}
            placeholder={field.placeholder ?? ""}
            className={cn(baseClass, "resize-none")}
          />
        )}
        {field.type === "number" && (
          <input
            disabled
            type="number"
            placeholder={field.placeholder ?? ""}
            className={cn(baseClass, "max-w-[200px]")}
          />
        )}
        {field.type === "select" && (
          <select disabled className={cn(baseClass, "max-w-[400px]")}>
            <option>Sélectionner...</option>
            {field.options?.map((o) => (
              <option key={o.value}>{o.label}</option>
            ))}
          </select>
        )}
        {field.type === "rating" && (
          <div className="flex items-center gap-1">
            {Array.from({ length: field.max ?? 5 }, (_, i) => (
              <Star key={i} className="w-6 h-6 text-muted-foreground/30" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
