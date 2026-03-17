"use client";

import { use, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useRoutePrefix } from "@/hooks/use-route-prefix";
import { useForm, useFormMutations } from "@/hooks/use-forms";
import { useAuth } from "@/hooks/use-auth";
import {
  useFormBuilderStore,
  type BuilderField,
} from "@/stores/form-builder-store";
import { FORM_FIELD_TYPES } from "@/lib/constants";
import { CONDITIONAL_OPERATORS } from "@/lib/conditional-logic";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ConditionalLogic, ConditionalRule } from "@/types/database";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  GripVertical,
  GitBranch,
  X,
  Eye,
  Type,
  AlignLeft,
  Mail,
  Phone,
  Hash,
  CircleDot,
  CheckSquare,
  ChevronDown,
  Star,
  BarChart,
  Sliders,
  Calendar,
  Clock,
  Upload,
  Heading,
  Text,
  Minus,
  Settings2,
  PenLine,
  ListChecks,
  Sparkles,
  LayoutGrid,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Type,
  AlignLeft,
  Mail,
  Phone,
  Hash,
  CircleDot,
  CheckSquare,
  ChevronDown,
  Star,
  BarChart,
  Sliders,
  Calendar,
  Clock,
  Upload,
  Heading,
  Text,
  Minus,
};

function getFieldIcon(iconName: string) {
  return ICON_MAP[iconName] ?? Type;
}

const FIELD_CATEGORIES = [
  {
    label: "Saisie",
    icon: PenLine,
    types: ["short_text", "long_text", "email", "phone", "number"],
  },
  {
    label: "Choix",
    icon: ListChecks,
    types: ["single_select", "multi_select", "dropdown"],
  },
  {
    label: "Avance",
    icon: Sparkles,
    types: ["rating", "nps", "scale", "date", "time", "file_upload"],
  },
  {
    label: "Mise en page",
    icon: LayoutGrid,
    types: ["heading", "paragraph", "divider"],
  },
];

export default function EditFormPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const { formId } = use(params);
  const { data: form, isLoading } = useForm(formId);
  const { updateForm, saveFields } = useFormMutations();
  const { user } = useAuth();
  const router = useRouter();
  const prefix = useRoutePrefix();

  const {
    title,
    description,
    fields,
    selectedFieldId,
    previewMode,
    status,
    setTitle,
    setDescription,
    addField,
    updateField,
    removeField,
    reorderFields,
    setSelectedFieldId,
    setPreviewMode,
    setStatus,
    loadForm,
    reset,
  } = useFormBuilderStore();

  // Load form data into store when it arrives
  const loadFormMemo = useCallback(() => {
    if (form) {
      loadForm(form);
    }
  }, [form, loadForm]);

  useEffect(() => {
    loadFormMemo();
    return () => {
      reset();
    };
  }, [loadFormMemo, reset]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderFields(active.id as string, over.id as string);
    }
  };

  const handleAddField = (type: string) => {
    const typeConfig = FORM_FIELD_TYPES.find((t) => t.value === type);
    const newField: BuilderField = {
      id: crypto.randomUUID(),
      field_type: type,
      label: typeConfig?.label ?? "",
      description: "",
      placeholder: "",
      is_required: false,
      options: ["single_select", "multi_select", "dropdown"].includes(type)
        ? [
            { label: "Option 1", value: "option_1" },
            { label: "Option 2", value: "option_2" },
          ]
        : [],
      conditional_logic: {},
      sort_order: fields.length,
    };
    addField(newField);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Le titre est requis");
      return;
    }
    if (!user) return;

    try {
      await updateForm.mutateAsync({
        id: formId,
        title: title.trim(),
        description: description.trim() || null,
        status,
      });

      await saveFields.mutateAsync({
        formId,
        fields: fields.map((f, i) => ({
          field_type: f.field_type,
          label: f.label || "Sans titre",
          description: f.description || null,
          placeholder: f.placeholder || null,
          is_required: f.is_required,
          options: f.options.length > 0 ? f.options : [],
          conditional_logic: f.conditional_logic,
          sort_order: i,
        })),
      });

      toast.success("Formulaire mis a jour");
      router.push(`${prefix}/forms/${formId}`);
    } catch {
      toast.error("Erreur lors de la sauvegarde");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-9 w-24 bg-muted rounded-xl animate-pulse" />
          <div className="flex gap-2">
            <div className="h-9 w-28 bg-muted rounded-xl animate-pulse" />
            <div className="h-9 w-32 bg-muted rounded-xl animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_300px] gap-4">
          <div className="hidden lg:block">
            <div className="h-80 bg-muted rounded-2xl animate-pulse" />
          </div>
          <div className="space-y-3">
            <div className="h-28 bg-muted rounded-2xl animate-pulse" />
            <div className="h-24 bg-muted rounded-2xl animate-pulse" />
            <div className="h-24 bg-muted rounded-2xl animate-pulse" />
          </div>
          <div className="hidden lg:block">
            <div className="h-64 bg-muted rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
          <Type className="w-7 h-7 text-muted-foreground/30" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">
          Formulaire non trouve
        </p>
        <p className="text-xs text-muted-foreground mb-4">
          Ce formulaire n&apos;existe pas ou a ete supprime
        </p>
        <Link
          href={`${prefix}/forms`}
          className="h-9 px-4 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux formulaires
        </Link>
      </div>
    );
  }

  const selectedField = fields.find((f) => f.id === selectedFieldId);
  const inputFields = fields.filter(
    (f) => !["heading", "paragraph", "divider"].includes(f.field_type),
  );

  if (previewMode) {
    return (
      <FormPreview
        title={title}
        description={description}
        fields={fields}
        onExit={() => setPreviewMode(false)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          href={`${prefix}/forms/${formId}`}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </Link>
        <div className="flex items-center gap-2">
          {/* Status selector */}
          <div className="relative">
            <div
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full",
                status === "active" && "bg-emerald-500",
                status === "draft" && "bg-zinc-400",
                status === "closed" && "bg-amber-500",
                status === "archived" && "bg-red-400",
              )}
            />
            <select
              value={status}
              onChange={(e) =>
                setStatus(
                  e.target.value as "draft" | "active" | "closed" | "archived",
                )
              }
              className="h-9 pl-7 pr-3 rounded-xl border border-border/50 text-sm text-foreground bg-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all appearance-none cursor-pointer"
            >
              <option value="draft">Brouillon</option>
              <option value="active">Actif</option>
              <option value="closed">Ferme</option>
              <option value="archived">Archive</option>
            </select>
          </div>
          <button
            onClick={() => setPreviewMode(true)}
            className="h-9 px-4 rounded-[10px] border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Apercu
          </button>
          <button
            onClick={handleSave}
            disabled={updateForm.isPending || saveFields.isPending}
            className="h-9 px-4 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {updateForm.isPending ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </div>

      {/* 3-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr_300px] gap-4 min-h-[calc(100vh-12rem)]">
        {/* Left: Field type palette */}
        <div className="hidden lg:block">
          <div className="bg-surface border border-border/50 rounded-2xl p-4 sticky top-24 shadow-sm">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-1">
              Champs
            </h3>
            <div className="space-y-4">
              {FIELD_CATEGORIES.map((cat) => {
                const CatIcon = cat.icon;
                return (
                  <div key={cat.label}>
                    <div className="flex items-center gap-1.5 px-1 mb-1.5">
                      <CatIcon className="w-3 h-3 text-muted-foreground/60" />
                      <span className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                        {cat.label}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {cat.types.map((typeValue) => {
                        const typeConfig = FORM_FIELD_TYPES.find(
                          (t) => t.value === typeValue,
                        );
                        if (!typeConfig) return null;
                        const Icon = getFieldIcon(typeConfig.icon);
                        return (
                          <button
                            key={typeValue}
                            onClick={() => handleAddField(typeValue)}
                            className="w-full h-8 px-2.5 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all flex items-center gap-2 text-left group"
                          >
                            <div className="w-5 h-5 rounded-md bg-muted/60 group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                              <Icon className="w-3 h-3 shrink-0 group-hover:text-primary transition-colors" />
                            </div>
                            {typeConfig.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Center: Form canvas */}
        <div className="space-y-3">
          <div className="bg-surface border border-border/50 rounded-2xl p-6 space-y-3 shadow-sm">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Titre du formulaire"
              className="w-full text-2xl font-bold text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
            />
            <div className="flex items-center gap-3">
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Description (optionnel)"
                className="flex-1 text-sm text-muted-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/40"
              />
              {fields.length > 0 && (
                <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 px-2 py-1 rounded-full whitespace-nowrap">
                  {fields.length} champ{fields.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={fields.map((f) => f.id)}
              strategy={verticalListSortingStrategy}
            >
              {fields.map((field, idx) => (
                <SortableFieldCard
                  key={field.id}
                  field={field}
                  index={idx}
                  isSelected={selectedFieldId === field.id}
                  onSelect={() => setSelectedFieldId(field.id)}
                  onRemove={() => removeField(field.id)}
                  onUpdate={(updates) => updateField(field.id, updates)}
                />
              ))}
            </SortableContext>
          </DndContext>

          {fields.length === 0 && (
            <div className="border-2 border-dashed border-border/40 rounded-2xl p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center mx-auto mb-4">
                <Type className="w-7 h-7 text-primary/40" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                Aucun champ pour le moment
              </p>
              <p className="text-xs text-muted-foreground/60 mb-5">
                Ajoute des champs depuis le panneau de gauche
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {["short_text", "email", "single_select", "rating"].map(
                  (type) => {
                    const tc = FORM_FIELD_TYPES.find((t) => t.value === type);
                    if (!tc) return null;
                    const Icon = getFieldIcon(tc.icon);
                    return (
                      <button
                        key={type}
                        onClick={() => handleAddField(type)}
                        className="h-8 px-3 rounded-xl bg-muted/60 hover:bg-primary/10 text-xs text-muted-foreground hover:text-primary transition-all flex items-center gap-1.5"
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {tc.label}
                      </button>
                    );
                  },
                )}
              </div>
            </div>
          )}

          {/* Mobile add field */}
          <div className="lg:hidden bg-surface border border-border border-dashed rounded-xl p-4">
            <p className="text-xs font-medium text-muted-foreground mb-3">
              Ajouter un champ
            </p>
            <div className="flex flex-wrap gap-1.5">
              {FORM_FIELD_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleAddField(type.value)}
                  className="h-7 px-2.5 rounded-lg bg-muted text-xs text-muted-foreground hover:text-foreground hover:bg-border/50 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Configuration panel */}
        <div className="hidden lg:block">
          {selectedField ? (
            <FieldConfigPanel
              field={selectedField}
              onUpdate={(updates) => updateField(selectedField.id, updates)}
              inputFields={inputFields}
            />
          ) : (
            <div className="bg-surface border border-border/50 rounded-2xl p-6 text-center sticky top-24 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                <Settings2 className="w-5 h-5 text-muted-foreground/30" />
              </div>
              <p className="text-sm text-muted-foreground">
                Selectionne un champ pour le configurer
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Sortable Field Card ─── */

function SortableFieldCard({
  field,
  index,
  isSelected,
  onSelect,
  onRemove,
  onUpdate,
}: {
  field: BuilderField;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onUpdate: (updates: Partial<BuilderField>) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const typeConfig = FORM_FIELD_TYPES.find((t) => t.value === field.field_type);
  const Icon = typeConfig ? getFieldIcon(typeConfig.icon) : Type;
  const hasCondition =
    field.conditional_logic &&
    "enabled" in field.conditional_logic &&
    field.conditional_logic.enabled;

  const isLayout = ["heading", "paragraph", "divider"].includes(
    field.field_type,
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "group/card relative bg-surface border rounded-2xl p-4 pl-5 cursor-pointer transition-all shadow-sm",
        isDragging && "opacity-50 shadow-lg scale-[1.02]",
        isSelected
          ? "border-primary ring-2 ring-primary/15"
          : "border-border/50 hover:border-primary/30 hover:shadow-md",
      )}
    >
      {/* Numbered badge */}
      {!isLayout && (
        <div
          className={cn(
            "absolute -left-3 top-4 w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm",
            isSelected
              ? "bg-primary text-white"
              : "bg-muted text-muted-foreground",
          )}
        >
          {index + 1}
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <button
          {...attributes}
          {...listeners}
          className="touch-none p-0.5 rounded hover:bg-muted transition-colors cursor-grab active:cursor-grabbing opacity-0 group-hover/card:opacity-100"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground/60" />
        </button>
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "w-5 h-5 rounded-md flex items-center justify-center",
              isSelected
                ? "bg-primary/15 text-primary"
                : "bg-muted/60 text-muted-foreground",
            )}
          >
            <Icon className="w-3 h-3" />
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {typeConfig?.label ?? field.field_type}
          </span>
        </div>
        {field.is_required && (
          <span className="text-[10px] text-primary font-semibold bg-primary/8 px-2 py-0.5 rounded-full">
            Requis
          </span>
        )}
        {hasCondition && (
          <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded-full">
            <GitBranch className="w-3 h-3" />
            Conditionnel
          </span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/40 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover/card:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <input
        value={field.label}
        onChange={(e) => onUpdate({ label: e.target.value })}
        placeholder="Label du champ..."
        className="w-full text-sm font-medium text-foreground bg-transparent border-none outline-none placeholder:text-muted-foreground/40 mb-2"
        onClick={(e) => e.stopPropagation()}
      />

      <FieldMiniPreview field={field} />
    </div>
  );
}

/* ─── Field Mini Preview ─── */

function FieldMiniPreview({ field }: { field: BuilderField }) {
  const type = field.field_type;

  if (type === "heading") {
    return (
      <div className="text-lg font-semibold text-foreground/30">
        {field.label || "Titre"}
      </div>
    );
  }
  if (type === "paragraph") {
    return (
      <div className="text-sm text-muted-foreground/50">
        {field.label || "Texte"}
      </div>
    );
  }
  if (type === "divider") {
    return <hr className="border-border" />;
  }
  if (type === "short_text" || type === "email" || type === "phone") {
    return (
      <div className="h-9 px-3 bg-muted/50 border border-border/50 rounded-lg flex items-center">
        <span className="text-xs text-muted-foreground/40">
          {field.placeholder || "Saisir..."}
        </span>
      </div>
    );
  }
  if (type === "long_text") {
    return (
      <div className="h-16 px-3 pt-2 bg-muted/50 border border-border/50 rounded-lg">
        <span className="text-xs text-muted-foreground/40">
          {field.placeholder || "Reponse longue..."}
        </span>
      </div>
    );
  }
  if (type === "number") {
    return (
      <div className="h-9 w-32 px-3 bg-muted/50 border border-border/50 rounded-lg flex items-center">
        <span className="text-xs text-muted-foreground/40">0</span>
      </div>
    );
  }
  if (type === "single_select" || type === "multi_select") {
    return (
      <div className="flex flex-wrap gap-1.5">
        {(field.options.length > 0
          ? field.options
          : [{ label: "Option 1", value: "1" }]
        ).map((opt, i) => (
          <div
            key={i}
            className="h-8 px-3 bg-muted/50 border border-border/50 rounded-lg flex items-center gap-2 text-xs text-muted-foreground"
          >
            {type === "single_select" ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-border/60" />
            ) : (
              <div className="w-3.5 h-3.5 rounded border-2 border-border/60" />
            )}
            {opt.label}
          </div>
        ))}
      </div>
    );
  }
  if (type === "dropdown") {
    return (
      <div className="h-9 px-3 bg-muted/50 border border-border/50 rounded-lg flex items-center justify-between">
        <span className="text-xs text-muted-foreground/40">
          Selectionner...
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/40" />
      </div>
    );
  }
  if (type === "rating") {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} className="w-6 h-6 text-muted-foreground/20" />
        ))}
      </div>
    );
  }
  if (type === "nps") {
    return (
      <div className="flex gap-1">
        {Array.from({ length: 11 }, (_, i) => (
          <div
            key={i}
            className="w-7 h-7 rounded-md border border-border/50 flex items-center justify-center text-[10px] text-muted-foreground/40"
          >
            {i}
          </div>
        ))}
      </div>
    );
  }
  if (type === "scale") {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            className="w-9 h-8 rounded-md border border-border/50 flex items-center justify-center text-xs text-muted-foreground/40"
          >
            {n}
          </div>
        ))}
      </div>
    );
  }
  if (type === "date") {
    return (
      <div className="h-9 w-44 px-3 bg-muted/50 border border-border/50 rounded-lg flex items-center gap-2">
        <Calendar className="w-3.5 h-3.5 text-muted-foreground/40" />
        <span className="text-xs text-muted-foreground/40">jj/mm/aaaa</span>
      </div>
    );
  }
  if (type === "time") {
    return (
      <div className="h-9 w-32 px-3 bg-muted/50 border border-border/50 rounded-lg flex items-center gap-2">
        <Clock className="w-3.5 h-3.5 text-muted-foreground/40" />
        <span className="text-xs text-muted-foreground/40">hh:mm</span>
      </div>
    );
  }
  if (type === "file_upload") {
    return (
      <div className="h-20 border-2 border-dashed border-border/50 rounded-lg flex flex-col items-center justify-center gap-1">
        <Upload className="w-5 h-5 text-muted-foreground/30" />
        <span className="text-[10px] text-muted-foreground/40">
          Glisser un fichier ici
        </span>
      </div>
    );
  }

  return null;
}

/* ─── Field Configuration Panel ─── */

function FieldConfigPanel({
  field,
  onUpdate,
  inputFields,
}: {
  field: BuilderField;
  onUpdate: (updates: Partial<BuilderField>) => void;
  inputFields: BuilderField[];
}) {
  const hasOptions = ["single_select", "multi_select", "dropdown"].includes(
    field.field_type,
  );

  const getLogic = (): ConditionalLogic => {
    if (field.conditional_logic && "enabled" in field.conditional_logic) {
      return field.conditional_logic as ConditionalLogic;
    }
    return {
      enabled: false,
      action: "show",
      rules: [{ fieldId: "", operator: "equals", value: "" }],
      logic: "and",
    };
  };

  const updateLogic = (logic: ConditionalLogic) => {
    onUpdate({ conditional_logic: logic });
  };

  return (
    <div className="bg-surface border border-border/50 rounded-2xl p-5 space-y-5 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto shadow-sm">
      {/* Header with type icon */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          {(() => {
            const tc = FORM_FIELD_TYPES.find(
              (t) => t.value === field.field_type,
            );
            const TypeIcon = tc ? getFieldIcon(tc.icon) : Type;
            return <TypeIcon className="w-4 h-4 text-primary" />;
          })()}
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Configuration
          </h3>
          <p className="text-[10px] text-muted-foreground">
            {FORM_FIELD_TYPES.find((t) => t.value === field.field_type)
              ?.label ?? field.field_type}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          Label
        </label>
        <input
          value={field.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="w-full h-9 px-3 bg-muted/50 border border-border/50 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          Description
        </label>
        <input
          value={field.description}
          onChange={(e) => onUpdate({ description: e.target.value })}
          placeholder="Texte d'aide..."
          className="w-full h-9 px-3 bg-muted/50 border border-border/50 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all placeholder:text-muted-foreground/40"
        />
      </div>

      {![
        "heading",
        "paragraph",
        "divider",
        "rating",
        "nps",
        "scale",
        "file_upload",
        "single_select",
        "multi_select",
      ].includes(field.field_type) && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1.5">
            Placeholder
          </label>
          <input
            value={field.placeholder}
            onChange={(e) => onUpdate({ placeholder: e.target.value })}
            className="w-full h-9 px-3 bg-muted/50 border border-border/50 rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
          />
        </div>
      )}

      {!["heading", "paragraph", "divider"].includes(field.field_type) && (
        <label className="flex items-center gap-2.5 cursor-pointer">
          <div className="relative">
            <input
              type="checkbox"
              checked={field.is_required}
              onChange={(e) => onUpdate({ is_required: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-muted rounded-full peer-checked:bg-primary transition-colors" />
            <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-surface rounded-full shadow-sm transition-transform peer-checked:translate-x-4" />
          </div>
          <span className="text-sm text-foreground">Requis</span>
        </label>
      )}

      {hasOptions && (
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-2">
            Options
          </label>
          <div className="space-y-1.5">
            {field.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <input
                  value={opt.label}
                  onChange={(e) => {
                    const newOptions = [...field.options];
                    newOptions[i] = {
                      label: e.target.value,
                      value: e.target.value.toLowerCase().replace(/\s+/g, "_"),
                    };
                    onUpdate({ options: newOptions });
                  }}
                  placeholder={`Option ${i + 1}`}
                  className="flex-1 h-8 px-2.5 bg-muted/50 border border-border/50 rounded-xl text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all"
                />
                <button
                  onClick={() => {
                    onUpdate({
                      options: field.options.filter((_, j) => j !== i),
                    });
                  }}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              onUpdate({
                options: [
                  ...field.options,
                  {
                    label: `Option ${field.options.length + 1}`,
                    value: `option_${field.options.length + 1}`,
                  },
                ],
              });
            }}
            className="mt-2 text-xs text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
          >
            <Plus className="w-3 h-3" />
            Ajouter une option
          </button>
        </div>
      )}

      {inputFields.filter((f) => f.id !== field.id).length > 0 && (
        <div className="pt-3 border-t border-border/50">
          <label className="flex items-center gap-2 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={getLogic().enabled}
              onChange={(e) =>
                updateLogic({ ...getLogic(), enabled: e.target.checked })
              }
              className="rounded border-border"
            />
            <div className="flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-sm text-foreground">
                Logique conditionnelle
              </span>
            </div>
          </label>

          {getLogic().enabled && (
            <ConditionalLogicEditor
              logic={getLogic()}
              onChange={updateLogic}
              availableFields={inputFields.filter((f) => f.id !== field.id)}
            />
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Conditional Logic Editor ─── */

function ConditionalLogicEditor({
  logic,
  onChange,
  availableFields,
}: {
  logic: ConditionalLogic;
  onChange: (logic: ConditionalLogic) => void;
  availableFields: BuilderField[];
}) {
  const updateRule = (idx: number, updates: Partial<ConditionalRule>) => {
    const newRules = logic.rules.map((r, i) =>
      i === idx ? { ...r, ...updates } : r,
    );
    onChange({ ...logic, rules: newRules });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <select
          value={logic.action}
          onChange={(e) =>
            onChange({ ...logic, action: e.target.value as "show" | "hide" })
          }
          className="h-8 px-2 bg-muted border border-border rounded-lg text-xs text-foreground focus:outline-none"
        >
          <option value="show">Afficher si</option>
          <option value="hide">Masquer si</option>
        </select>
        {logic.rules.length > 1 && (
          <select
            value={logic.logic}
            onChange={(e) =>
              onChange({ ...logic, logic: e.target.value as "and" | "or" })
            }
            className="h-8 px-2 bg-muted border border-border rounded-lg text-xs text-foreground focus:outline-none"
          >
            <option value="and">toutes les conditions</option>
            <option value="or">une condition</option>
          </select>
        )}
      </div>

      {logic.rules.map((rule, idx) => {
        const operatorConfig = CONDITIONAL_OPERATORS.find(
          (o) => o.value === rule.operator,
        );
        return (
          <div
            key={idx}
            className="space-y-1.5 p-2.5 bg-muted/50 rounded-lg border border-border/30"
          >
            <select
              value={rule.fieldId}
              onChange={(e) => updateRule(idx, { fieldId: e.target.value })}
              className="w-full h-8 px-2 bg-surface border border-border rounded-lg text-xs text-foreground focus:outline-none"
            >
              <option value="">Champ...</option>
              {availableFields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.label || "Sans titre"}
                </option>
              ))}
            </select>
            <select
              value={rule.operator}
              onChange={(e) =>
                updateRule(idx, {
                  operator: e.target.value as ConditionalRule["operator"],
                })
              }
              className="w-full h-8 px-2 bg-surface border border-border rounded-lg text-xs text-foreground focus:outline-none"
            >
              {CONDITIONAL_OPERATORS.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>
            {operatorConfig?.needsValue !== false && (
              <input
                value={rule.value}
                onChange={(e) => updateRule(idx, { value: e.target.value })}
                placeholder="Valeur..."
                className="w-full h-8 px-2 bg-surface border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            )}
            {logic.rules.length > 1 && (
              <button
                onClick={() => {
                  onChange({
                    ...logic,
                    rules: logic.rules.filter((_, i) => i !== idx),
                  });
                }}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-red-500 transition-colors mt-1"
              >
                <X className="w-3 h-3" />
                Supprimer
              </button>
            )}
          </div>
        );
      })}

      <button
        onClick={() => {
          onChange({
            ...logic,
            rules: [
              ...logic.rules,
              { fieldId: "", operator: "equals", value: "" },
            ],
          });
        }}
        className="text-xs text-primary hover:text-primary-hover transition-colors flex items-center gap-1"
      >
        <Plus className="w-3 h-3" />
        Ajouter une condition
      </button>
    </div>
  );
}

/* ─── Form Preview ─── */

function FormPreview({
  title,
  description,
  fields,
  onExit,
}: {
  title: string;
  description: string;
  fields: BuilderField[];
  onExit: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={onExit}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour a l&apos;editeur
        </button>
        <span className="text-xs font-medium text-primary bg-primary/5 px-3 py-1.5 rounded-full">
          Mode apercu
        </span>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-surface border border-border rounded-xl p-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {title || "Sans titre"}
          </h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        {fields.map((field) => {
          if (field.field_type === "heading") {
            return (
              <h2
                key={field.id}
                className="text-lg font-semibold text-foreground pt-4"
              >
                {field.label}
              </h2>
            );
          }
          if (field.field_type === "paragraph") {
            return (
              <p key={field.id} className="text-sm text-muted-foreground">
                {field.label}
              </p>
            );
          }
          if (field.field_type === "divider") {
            return <hr key={field.id} className="border-border" />;
          }
          return (
            <div
              key={field.id}
              className="bg-surface border border-border rounded-xl p-5"
            >
              <label className="block text-sm font-medium text-foreground mb-1">
                {field.label || "Sans titre"}
                {field.is_required && (
                  <span className="text-primary ml-1">*</span>
                )}
              </label>
              {field.description && (
                <p className="text-xs text-muted-foreground mb-3">
                  {field.description}
                </p>
              )}
              <FieldMiniPreview field={field} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
